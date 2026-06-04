/**
 * Food Diet Analyzer — detects dietary labels from ingredients list
 * Returns tags: Vegan, Vegetarian, Non-Veg, Contains Dairy, Gluten-Free
 */

const MEAT_KEYWORDS = [
  'chicken', 'mutton', 'beef', 'pork', 'fish', 'prawn', 'shrimp', 'seafood',
  'lamb', 'turkey', 'duck', 'meat', 'keema', 'mince', 'bacon', 'sausage',
  'tuna', 'salmon', 'crab', 'lobster', 'squid'
];

const DAIRY_KEYWORDS = [
  'milk', 'cheese', 'paneer', 'cream', 'butter', 'curd', 'yogurt', 'ghee',
  'khoya', 'malai', 'condensed milk', 'whey', 'lactose'
];

const EGG_KEYWORDS = ['egg', 'eggs', 'mayonnaise', 'mayo'];

const GLUTEN_KEYWORDS = [
  'wheat', 'flour', 'maida', 'bread', 'pasta', 'noodles', 'semolina', 'sooji',
  'rava', 'roti', 'chapati', 'biscuit', 'cake', 'barley', 'rye'
];

export function analyzeDiet(ingredients = []) {
  const list = ingredients.map(i => i.toLowerCase());

  const hasMeat   = list.some(i => MEAT_KEYWORDS.some(k => i.includes(k)));
  const hasDairy  = list.some(i => DAIRY_KEYWORDS.some(k => i.includes(k)));
  const hasEgg    = list.some(i => EGG_KEYWORDS.some(k => i.includes(k)));
  const hasGluten = list.some(i => GLUTEN_KEYWORDS.some(k => i.includes(k)));

  const labels = [];

  if (hasMeat) {
    labels.push({ text: '🍗 Non-Veg',      bg: 'bg-red-100 dark:bg-red-950/40',    text_color: 'text-red-700 dark:text-red-400',     border: 'border-red-200 dark:border-red-800/50' });
  } else if (hasEgg) {
    labels.push({ text: '🥚 Eggetarian',   bg: 'bg-yellow-100 dark:bg-yellow-950/40', text_color: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/50' });
  } else if (hasDairy) {
    labels.push({ text: '🌿 Vegetarian',   bg: 'bg-green-100 dark:bg-green-950/40',   text_color: 'text-green-700 dark:text-green-400',   border: 'border-green-200 dark:border-green-800/50' });
  } else if (list.length > 0) {
    labels.push({ text: '🌱 Vegan',        bg: 'bg-emerald-100 dark:bg-emerald-950/40', text_color: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50' });
  }

  if (hasDairy && !hasMeat) {
    labels.push({ text: '🥛 Contains Dairy', bg: 'bg-sky-100 dark:bg-sky-950/40', text_color: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800/50' });
  }

  if (!hasGluten && list.length > 0) {
    labels.push({ text: '✅ Gluten-Free', bg: 'bg-purple-100 dark:bg-purple-950/40', text_color: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50' });
  }

  return labels;
}

/**
 * Estimate CO₂ saved based on quantity and food type
 * Avg food waste = ~2.5 kg CO2e per kg food. We approximate 0.3 kg per serving.
 */
export function estimateCO2Saved(quantity = 1, ingredients = []) {
  const list = ingredients.map(i => i.toLowerCase());
  const hasMeat = list.some(i => MEAT_KEYWORDS.some(k => i.includes(k)));
  // Meat-based food has higher CO2 footprint
  const co2PerItem = hasMeat ? 1.2 : 0.5; // kg CO2e per item saved
  return (quantity * co2PerItem).toFixed(1);
}
