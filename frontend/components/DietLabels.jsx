"use client";

import { analyzeDiet, estimateCO2Saved } from "@/utils/foodDietAnalyzer";

export default function DietLabels({ food }) {
  const labels = analyzeDiet(food.ingredients || []);
  const co2 = estimateCO2Saved(food.quantity, food.ingredients || []);

  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-3">
      {labels.map((label, i) => (
        <span
          key={i}
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${label.bg} ${label.text_color} ${label.border}`}
        >
          {label.text}
        </span>
      ))}
      {/* CO2 badge */}
      <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50 flex items-center gap-1">
        🌍 ~{co2} kg CO₂ saved
      </span>
    </div>
  );
}
