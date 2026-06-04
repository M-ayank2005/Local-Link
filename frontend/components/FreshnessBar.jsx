"use client";

import { Zap } from "lucide-react";

/**
 * FreshnessBar — shows a visual freshness % bar
 * 100% = just created, 0% = at expiry time
 */
export default function FreshnessBar({ createdAt, expiryDate }) {
  const created = new Date(createdAt).getTime();
  const expiry  = new Date(expiryDate).getTime();
  const now     = Date.now();

  const totalWindow = expiry - created;
  const elapsed     = now - created;

  // Clamp between 0 and 100
  const freshness = totalWindow > 0
    ? Math.max(0, Math.min(100, Math.round(((totalWindow - elapsed) / totalWindow) * 100)))
    : 0;

  // Color thresholds
  let barColor = "bg-emerald-500";
  let labelColor = "text-emerald-600 dark:text-emerald-400";
  let label = "Very Fresh";

  if (freshness <= 10) {
    barColor = "bg-red-500";
    labelColor = "text-red-600 dark:text-red-400";
    label = "Almost Gone";
  } else if (freshness <= 30) {
    barColor = "bg-orange-500";
    labelColor = "text-orange-600 dark:text-orange-400";
    label = "Fading Fast";
  } else if (freshness <= 60) {
    barColor = "bg-amber-500";
    labelColor = "text-amber-600 dark:text-amber-400";
    label = "Still Good";
  } else if (freshness <= 85) {
    barColor = "bg-lime-500";
    labelColor = "text-lime-600 dark:text-lime-400";
    label = "Fresh";
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <Zap className="w-3 h-3" />
          Freshness
        </span>
        <span className={`text-[11px] font-bold ${labelColor}`}>
          {label} · {freshness}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${freshness}%` }}
        />
      </div>
    </div>
  );
}
