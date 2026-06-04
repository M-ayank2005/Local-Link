/**
 * AI Food Safety Predictor — Client-side scoring utility
 * This is a heuristic suggestion tool, NOT a certified food safety standard.
 *
 * @param {Object} food - A food listing object from the API
 * @returns {{ safetyScore: number, status: string, reasons: string[] }}
 */

const HIGH_RISK_KEYWORDS = [
  'meat', 'chicken', 'fish', 'seafood', 'prawn', 'shrimp', 'mutton', 'beef',
  'pork', 'egg', 'eggs', 'dairy', 'milk', 'cheese', 'paneer', 'cream',
  'curd', 'yogurt', 'butter', 'mayonnaise', 'mayo', 'raw'
];

const MEDIUM_RISK_KEYWORDS = [
  'rice', 'cooked rice', 'noodles', 'pasta', 'gravy', 'curry', 'dal',
  'lentils', 'soup', 'stew', 'sauce', 'tofu', 'sprouts'
];

export function calculateFoodSafety(food) {
  let score = 100;
  const reasons = [];

  // ── 1. Ingredient Risk ──────────────────────────────────────────────────
  const ingredientList = (food.ingredients || []).map(i => i.toLowerCase());
  let highRiskCount = 0;
  let medRiskCount = 0;
  const highRiskFound = [];
  const medRiskFound = [];

  for (const ingredient of ingredientList) {
    const isHigh = HIGH_RISK_KEYWORDS.some(k => ingredient.includes(k));
    const isMed = !isHigh && MEDIUM_RISK_KEYWORDS.some(k => ingredient.includes(k));
    if (isHigh) { highRiskCount++; highRiskFound.push(ingredient); }
    else if (isMed) { medRiskCount++; medRiskFound.push(ingredient); }
  }

  const highDeduction = Math.min(highRiskCount * 15, 30);
  const medDeduction = Math.min(medRiskCount * 8, 16);
  score -= highDeduction;
  score -= medDeduction;

  if (highRiskFound.length > 0) {
    reasons.push(`Contains high-risk ingredients: ${highRiskFound.slice(0, 3).join(', ')}`);
  } else if (medRiskFound.length > 0) {
    reasons.push(`Contains medium-risk ingredients: ${medRiskFound.slice(0, 2).join(', ')}`);
  } else {
    reasons.push('Low-risk ingredients (plant-based / dry goods)');
  }

  // ── 2. Time Since Preparation (using createdAt) ─────────────────────────
  const createdAt = food.createdAt ? new Date(food.createdAt) : new Date();
  const hoursSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

  let timeDeduction = 0;
  let timeReason = '';
  if (hoursSinceCreated <= 2) {
    timeDeduction = 0;
    timeReason = `Freshly prepared (${Math.round(hoursSinceCreated * 60)} mins ago)`;
  } else if (hoursSinceCreated <= 6) {
    timeDeduction = 5;
    timeReason = `Prepared ${Math.floor(hoursSinceCreated)} hours ago`;
  } else if (hoursSinceCreated <= 12) {
    timeDeduction = 15;
    timeReason = `Prepared ${Math.floor(hoursSinceCreated)} hours ago — consume promptly`;
  } else if (hoursSinceCreated <= 24) {
    timeDeduction = 25;
    timeReason = `Prepared over ${Math.floor(hoursSinceCreated)} hours ago`;
  } else {
    timeDeduction = 40;
    timeReason = `Prepared more than ${Math.floor(hoursSinceCreated / 24)} day(s) ago`;
  }
  score -= timeDeduction;
  reasons.push(timeReason);

  // ── 3. Expiry Proximity ─────────────────────────────────────────────────
  if (food.expiryDate) {
    const expiryDate = new Date(food.expiryDate);
    const hoursToExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursToExpiry < 0) {
      score -= 40;
      reasons.push('⚠️ Listing is past its expiry date');
    } else if (hoursToExpiry < 2) {
      score -= 20;
      reasons.push(`Expires very soon (in ${Math.round(hoursToExpiry * 60)} mins)`);
    } else if (hoursToExpiry < 6) {
      score -= 10;
      reasons.push(`Expiring soon (in ${Math.round(hoursToExpiry)} hours)`);
    }
  }

  // ── 4. Season Risk ──────────────────────────────────────────────────────
  const season = (food.season || '').toLowerCase();
  if (season === 'summer') {
    score -= 10;
    reasons.push('Summer season — higher ambient temperature increases spoilage risk');
  } else if (season === 'monsoon') {
    score -= 15;
    reasons.push('Monsoon season — high humidity accelerates bacterial growth');
  } else if (season === 'winter') {
    reasons.push('Winter season — cooler temperatures help preserve freshness');
  }

  // ── 5. Storage Method (optional field) ─────────────────────────────────
  const storage = (food.storageMethod || 'room_temp').toLowerCase();
  if (storage === 'frozen') {
    score += 20;
    reasons.push('Stored frozen — excellent preservation');
  } else if (storage === 'refrigerated') {
    score += 15;
    reasons.push('Stored in refrigerator — good preservation');
  } else {
    reasons.push('Stored at room temperature');
  }

  // ── 6. Packaging Type (optional field) ─────────────────────────────────
  const packaging = (food.packagingType || 'open').toLowerCase();
  if (packaging === 'vacuum_sealed') {
    score += 15;
    reasons.push('Vacuum sealed — maximum protection from contamination');
  } else if (packaging === 'airtight') {
    score += 10;
    reasons.push('Airtight container — well protected');
  } else if (packaging === 'covered') {
    score += 5;
    reasons.push('Covered packaging — moderate protection');
  } else {
    reasons.push('Open packaging — handle with care');
  }

  // ── Final Score ─────────────────────────────────────────────────────────
  const safetyScore = Math.max(0, Math.min(100, Math.round(score)));

  let status = 'Safe';
  if (safetyScore <= 30) status = 'Unsafe';
  else if (safetyScore <= 60) status = 'Consume Soon';

  return { safetyScore, status, reasons };
}
