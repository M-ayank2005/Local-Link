const { GoogleGenerativeAI } = require('@google/generative-ai');
const SkillBooking = require('../../models/skills/Booking');
const Service = require('../../models/skills/Service');

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
        const wait = attempt * 15000; // 15s, 30s
        console.log(`Gemini API busy (Status ${err.status}). Retrying in ${wait / 1000}s... (attempt ${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
};

// ─── Constants (kept for DB context queries) ─────────────────────────────────

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const normalizeCategory = (value = '') => {
  const v = value.toLowerCase().trim();
  if (v.includes('plumb')) return 'plumber';
  if (v.includes('electric')) return 'electrician';
  if (v.includes('carpent') || v.includes('furniture')) return 'carpenter';
  if (v.includes('tutor') || v.includes('teach') || v.includes('coach')) return 'tutor';
  if (v.includes('clean') || v.includes('maid')) return 'cleaner';
  if (v.includes('paint')) return 'painter';
  if (v.includes('mechanic') || v.includes('auto')) return 'mechanic';
  if (v.includes('cook') || v.includes('chef')) return 'cook';
  if (v.includes('driver') || v.includes('chauffeur')) return 'driver';
  if (v.includes('helper') || v.includes('labour')) return 'helper';
  return v || 'other';
};

const titleCase = (str = '') =>
  str.replace(/[_-]/g, ' ').split(' ').filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));

const getSlotLabel = (hour) => {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
};

const getHourFromBooking = (booking) => {
  const time = booking.scheduledTime?.start || '09:00';
  const parsed = Number(String(time).split(':')[0]);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 23) : 9;
};

// ════════════════════════════════════════════════════════════════════════════
// 1. AI Pricing Assistant
//    POST /provider/ai/pricing
// ════════════════════════════════════════════════════════════════════════════
exports.getPricingSuggestion = async (req, res) => {
  try {
    const { service, category, experience, location = '', jobType = '' } = req.body || {};

    if (!service && !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a service name or category.',
      });
    }

    const cat = normalizeCategory(category || service);
    const expYears = clamp(Number(experience) || 0, 0, 40);

    // Pull real market data from DB for context
    const localServices = await Service.find({
      category: cat,
      isActive: true,
      ...(location ? { 'address.city': { $regex: location, $options: 'i' } } : {}),
    }).select('pricePerHour').limit(50);

    const marketPrices = localServices.map(s => s.pricePerHour).filter(Boolean);
    const marketContext = marketPrices.length >= 3
      ? `Real market data from ${marketPrices.length} local listings: min=₹${Math.min(...marketPrices)}, max=₹${Math.max(...marketPrices)}, avg=₹${Math.round(marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length)}.`
      : 'No local listings found — use general Indian market knowledge.';

    const prompt = `
You are a pricing expert for a local service marketplace in India called LocalLink.

A service provider is asking for a price recommendation. Respond ONLY with valid JSON, no markdown, no explanation.

Details:
- Service category: ${cat}
- Service/job type: ${service || jobType || cat}
- Experience: ${expYears} years
- Location: ${location || 'India (general)'}
- ${marketContext}

Respond with this exact JSON structure:
{
  "recommendedPrice": {
    "min": <number in INR, round to nearest 10>,
    "max": <number in INR, round to nearest 10>,
    "currency": "INR"
  },
  "basis": [<array of 3-4 short reason strings>],
  "tip": "<one short pricing tip for the provider>"
}
`.trim();

    const raw = await askGemini(prompt);

    let data;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        meta: { category: cat, localListingsUsed: marketPrices.length, aiPowered: true },
      },
    });
  } catch (err) {
    console.error('getPricingSuggestion error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating pricing suggestion.' });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 2. AI Job Description Generator
//    POST /provider/ai/description
// ════════════════════════════════════════════════════════════════════════════
exports.generateJobDescription = async (req, res) => {
  try {
    const { service, category, experience = 0, specialization = '', skills = [] } = req.body || {};

    if (!service && !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a service name or category.',
      });
    }

    const cat = normalizeCategory(category || service);
    const expYears = clamp(Number(experience) || 0, 0, 50);

    const skillList = Array.isArray(skills)
      ? skills
      : String(skills).split(',').map(s => s.trim()).filter(Boolean);

    const allSkills = [...new Set([specialization, ...skillList].filter(Boolean))];

    const prompt = `
You are a professional profile writer for LocalLink, an Indian local services marketplace.

Write a compelling service provider profile for a customer-facing listing. Respond ONLY with valid JSON, no markdown.

Provider details:
- Category: ${cat}
- Experience: ${expYears} years
- Specializations/Skills: ${allSkills.length ? allSkills.join(', ') : 'general ' + cat + ' work'}

Respond with this exact JSON structure:
{
  "description": "<2-3 sentence professional description, warm and trustworthy tone, mention specific skills, max 60 words>",
  "highlights": [<array of 3 short badge strings like "5+ years experience", "Emergency available">],
  "wordCount": <number>
}
`.trim();

    const raw = await askGemini(prompt);

    let data;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      data.wordCount = data.description?.split(' ').length || 0;
    } catch {
      return res.status(500).json({ success: false, message: 'AI returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      data: { ...data, category: cat, aiPowered: true },
    });
  } catch (err) {
    console.error('generateJobDescription error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating job description.' });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 3. AI Availability Optimizer
//    GET /provider/ai/availability
// ════════════════════════════════════════════════════════════════════════════
exports.getAvailabilitySuggestion = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const since = new Date();
    since.setDate(since.getDate() - 90); // last 90 days

    const bookings = await SkillBooking.find({
      provider: req.user._id,
      createdAt: { $gte: since },
    }).select('scheduledDate scheduledTime status');

    // Build demand matrix for Gemini context
    const demand = {};
    DAY_NAMES.forEach(day => {
      demand[day] = { total: 0, slots: { morning: 0, afternoon: 0, evening: 0, night: 0 } };
    });

    bookings.forEach(b => {
      const dayIdx = new Date(b.scheduledDate).getDay();
      const day = DAY_NAMES[dayIdx];
      if (!day) return;
      const slot = getSlotLabel(getHourFromBooking(b));
      const weight = b.status === 'completed' ? 1.5 : b.status === 'confirmed' ? 1.2 : 1.0;
      demand[day].total += weight;
      demand[day].slots[slot] += weight;
    });

    const demandSummary = DAY_NAMES.map(day => ({
      day,
      total: Math.round(demand[day].total * 10) / 10,
      ...demand[day].slots,
    }));

    const prompt = `
You are an availability advisor for LocalLink, an Indian local services marketplace.

Analyze this provider's booking demand data from the last 90 days and give smart scheduling advice. Respond ONLY with valid JSON, no markdown.

Booking demand (weighted by completion status):
${JSON.stringify(demandSummary, null, 2)}

Total bookings analyzed: ${bookings.length}
${bookings.length === 0 ? 'No history available — use general Indian service market patterns.' : ''}

Respond with this exact JSON structure:
{
  "recommendation": "<one clear actionable sentence about when to be available>",
  "bestDay": "<day name>",
  "bestSlot": "<morning|afternoon|evening|night>",
  "suggestedWindow": "<e.g. 5 PM – 9 PM>",
  "suggestedStart": "<HH:MM>",
  "suggestedEnd": "<HH:MM>",
  "insight": "<one additional insight about their booking patterns or market tips>",
  "bookingsAnalyzed": ${bookings.length}
}
`.trim();

    const raw = await askGemini(prompt);

    let data;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI returned an unexpected format. Please try again.' });
    }

    const daySummary = demandSummary.map(d => ({
      day: titleCase(d.day),
      total: d.total,
      slots: { morning: d.morning, afternoon: d.afternoon, evening: d.evening, night: d.night },
      isBest: d.day === (data.bestDay || '').toLowerCase(),
    })).sort((a, b) => b.total - a.total);

    return res.status(200).json({
      success: true,
      data: { ...data, daySummary, fallback: bookings.length === 0, aiPowered: true },
    });
  } catch (err) {
    console.error('getAvailabilitySuggestion error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating availability suggestion.' });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 4. AI Demand Insights  (Admin only)
//    GET /admin/ai/demand-insights
// ════════════════════════════════════════════════════════════════════════════
exports.getDemandInsights = async (req, res) => {
  try {
    const now = new Date();
    const currentStart  = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [current, previous, upcoming] = await Promise.all([
      SkillBooking.aggregate([
        { $match: { createdAt: { $gte: currentStart } } },
        { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'svc' } },
        { $unwind: { path: '$svc', preserveNullAndEmpty: false } },
        { $group: { _id: '$svc.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      SkillBooking.aggregate([
        { $match: { createdAt: { $gte: previousStart, $lt: currentStart } } },
        { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'svc' } },
        { $unwind: { path: '$svc', preserveNullAndEmpty: false } },
        { $group: { _id: '$svc.category', count: { $sum: 1 } } },
      ]),
      SkillBooking.aggregate([
        { $match: { scheduledDate: { $gte: now }, status: { $in: ['pending', 'confirmed'] } } },
        { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'svc' } },
        { $unwind: { path: '$svc', preserveNullAndEmpty: false } },
        { $group: { _id: '$svc.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const prevMap = previous.reduce((m, i) => ({ ...m, [i._id]: i.count }), {});
    const totalCurrent = current.reduce((s, i) => s + i.count, 0);
    const totalPrev    = previous.reduce((s, i) => s + i.count, 0);

    const rawData = current.slice(0, 6).map(item => ({
      category: item._id,
      currentCount: item.count,
      previousCount: prevMap[item._id] || 0,
      growth: prevMap[item._id]
        ? Math.round(((item.count - prevMap[item._id]) / prevMap[item._id]) * 100)
        : (item.count > 0 ? 100 : 0),
    }));

    const prompt = `
You are a business analyst for LocalLink, an Indian local services marketplace.

Analyze this month's booking data and generate human-readable insights for the admin dashboard. Respond ONLY with valid JSON, no markdown.

This month's data by category:
${JSON.stringify(rawData, null, 2)}

Upcoming bookings (next few days):
${JSON.stringify(upcoming, null, 2)}

Overall: ${totalCurrent} bookings this month vs ${totalPrev} last month.

Respond with this exact JSON structure:
{
  "insights": [
    {
      "category": "<category name>",
      "count": <number>,
      "previousCount": <number>,
      "growth": <number percent>,
      "trend": "<up|down|stable>",
      "message": "<smart insight sentence about this category, max 15 words>"
    }
  ],
  "upcomingPeaks": [
    {
      "category": "<category>",
      "count": <number>,
      "message": "<short message>"
    }
  ],
  "summary": {
    "totalCurrentMonth": ${totalCurrent},
    "totalPrevMonth": ${totalPrev},
    "overallGrowth": <number percent>,
    "overallTrend": "<up|down|stable>",
    "adminTip": "<one strategic tip for the admin based on this data>"
  }
}
`.trim();

    const raw = await askGemini(prompt);

    let data;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ success: false, message: 'AI returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      data: { ...data, aiPowered: true },
    });
  } catch (err) {
    console.error('getDemandInsights error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating demand insights.' });
  }
};
