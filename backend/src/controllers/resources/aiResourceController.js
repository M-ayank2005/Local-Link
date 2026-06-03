const { GoogleGenerativeAI } = require('@google/generative-ai');
const Resource = require('../../models/resources/Resource');

// ─── Gemini Setup ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const askGemini = async (prompt) => {
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      const isRetryable = err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('503');
      if (isRetryable && attempt < MAX_RETRIES) {
        const wait = attempt * 15000;
        console.log(`Gemini API busy (Status ${err.status}). Retrying in ${wait / 1000}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 1. Smart Resource Recommendation
//    POST /api/v1/resources/ai/smart-search
// ════════════════════════════════════════════════════════════════════════════
exports.smartSearch = async (req, res) => {
  try {
    const { query, lng, lat, distance = 10 } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const prompt = `
You are a smart search assistant for a rental marketplace called LocalLink.
A user has typed the following query looking to rent items:
"${query}"

Based on their query, figure out what physical items or categories they might need.
Our platform categories are: "drill", "ladder", "projector", "tent", "tool", "appliance", "sports", "other".
List the most relevant categories (up to 3) and some specific keyword items (up to 5) they might be looking for.

Respond ONLY with valid JSON in this exact structure:
{
  "categories": ["array of matching categories from the allowed list"],
  "keywords": ["array of specific item names related to their query"],
  "explanation": "A short, friendly sentence explaining what you found (e.g., 'For a birthday party, you might need a tent, chairs, and a projector.')"
}
`.trim();

    const raw = await askGemini(prompt);
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI parsing failed' });
    }

    let filter = { isActive: true };
    if (lng && lat) {
      const radius = distance / 6378.1;
      filter.location = { $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius] } };
    }

    const orConditions = [];
    if (parsed.categories && parsed.categories.length > 0) {
      orConditions.push({ category: { $in: parsed.categories } });
    }
    if (parsed.keywords && parsed.keywords.length > 0) {
      const keywordRegex = parsed.keywords.join('|');
      orConditions.push({ title: { $regex: keywordRegex, $options: 'i' } });
      orConditions.push({ description: { $regex: keywordRegex, $options: 'i' } });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const resources = await Resource.find(filter).populate('owner', 'fullName rating totalReviews').limit(20);

    return res.status(200).json({
      success: true,
      aiData: parsed,
      count: resources.length,
      data: resources
    });

  } catch (error) {
    console.error('smartSearch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 2. Dynamic Pricing Assistant
//    POST /api/v1/resources/ai/pricing
// ════════════════════════════════════════════════════════════════════════════
exports.pricingAssistant = async (req, res) => {
  try {
    const { category, condition, itemDetails = '', location = '' } = req.body;

    if (!category || !condition) {
      return res.status(400).json({ success: false, message: 'Category and condition are required' });
    }

    const recentItems = await Resource.find({ category, condition }).select('pricePerDay').limit(30);
    const prices = recentItems.map(r => r.pricePerDay).filter(p => p > 0);
    
    let marketContext = 'No local data available. Use general Indian rental market estimates.';
    if (prices.length >= 3) {
      marketContext = `Real market data from ${prices.length} local listings for ${category}: min=₹${Math.min(...prices)}, max=₹${Math.max(...prices)}, avg=₹${Math.round(prices.reduce((a,b)=>a+b,0)/prices.length)}.`;
    }

    const prompt = `
You are a pricing expert for a rental marketplace in India called LocalLink.
A user wants to list an item for rent and needs a daily price recommendation.
Respond ONLY with valid JSON, no markdown.

Item details:
- Category: ${category}
- Condition: ${condition}
- Details: ${itemDetails || 'N/A'}
- Location: ${location || 'India'}
- ${marketContext}

Respond with this exact JSON structure:
{
  "recommendedPrice": {
    "min": <number in INR, round to 10>,
    "max": <number in INR, round to 10>
  },
  "explanation": "A short sentence explaining why this price is good, considering condition and demand.",
  "tip": "A quick tip to make their listing stand out"
}
`.trim();

    const raw = await askGemini(prompt);
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI parsing failed' });
    }

    return res.status(200).json({ success: true, data: parsed });

  } catch (error) {
    console.error('pricingAssistant error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 3. Bundle Recommendation
//    GET /api/v1/resources/ai/bundle/:resourceId
// ════════════════════════════════════════════════════════════════════════════
exports.bundleRecommendation = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const prompt = `
A user on a local rental marketplace (LocalLink) is currently looking at renting this item:
- Title: "${resource.title}"
- Category: "${resource.category}"
- Description: "${resource.description}"

We want to suggest a "Bundle Recommendation" of related items that are frequently rented together with this item to increase platform engagement.
For example, if they rent a Tent, they might need Chairs, Tables, Lights, etc.
Our platform categories are: "drill", "ladder", "projector", "tent", "tool", "appliance", "sports", "other".

Respond ONLY with valid JSON in this exact structure:
{
  "bundleTitle": "A catchy title for the bundle (e.g. 'Complete Your Camping Trip')",
  "suggestedKeywords": ["array of 3-4 specific items they might also need"],
  "categories": ["array of 1-3 allowed categories to search for these items"],
  "reason": "A short, engaging sentence explaining why they should rent these together."
}
`.trim();

    const raw = await askGemini(prompt);
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI parsing failed' });
    }

    // Now query some actual items based on the AI suggestion
    const filter = { 
      isActive: true, 
      _id: { $ne: resource._id },
      location: { 
        $geoWithin: { $centerSphere: [[resource.location.coordinates[0], resource.location.coordinates[1]], 10 / 6378.1] } 
      }
    };
    
    const orConditions = [];
    if (parsed.categories && parsed.categories.length > 0) {
      orConditions.push({ category: { $in: parsed.categories } });
    }
    if (parsed.suggestedKeywords && parsed.suggestedKeywords.length > 0) {
      const keywordRegex = parsed.suggestedKeywords.join('|');
      orConditions.push({ title: { $regex: keywordRegex, $options: 'i' } });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    const recommendedItems = await Resource.find(filter).limit(4).select('title pricePerDay images category');

    return res.status(200).json({ 
      success: true, 
      aiData: parsed,
      data: recommendedItems
    });

  } catch (error) {
    console.error('bundleRecommendation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
