"use client";

import { useState } from "react";
import { calculateFoodSafety } from "@/utils/foodSafetyScorer";
import { ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldX, Bot } from "lucide-react";

const STATUS_CONFIG = {
  Safe: {
    emoji: "🟢",
    label: "Safe",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/60",
    badgeText: "text-emerald-700 dark:text-emerald-400",
    scoreBg: "bg-emerald-500",
    Icon: ShieldCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  "Consume Soon": {
    emoji: "🟡",
    label: "Consume Soon",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeBorder: "border-amber-200 dark:border-amber-800/60",
    badgeText: "text-amber-700 dark:text-amber-400",
    scoreBg: "bg-amber-500",
    Icon: ShieldAlert,
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  Unsafe: {
    emoji: "🔴",
    label: "Unsafe",
    badgeBg: "bg-red-50 dark:bg-red-950/40",
    badgeBorder: "border-red-200 dark:border-red-800/60",
    badgeText: "text-red-700 dark:text-red-400",
    scoreBg: "bg-red-500",
    Icon: ShieldX,
    iconColor: "text-red-500 dark:text-red-400",
  },
};

export default function FoodSafetyBadge({ food }) {
  const [expanded, setExpanded] = useState(false);
  const { safetyScore, status, reasons } = calculateFoodSafety(food);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Safe"];
  const { Icon } = cfg;

  return (
    <div
      className={`rounded-xl border ${cfg.badgeBg} ${cfg.badgeBorder} overflow-hidden transition-all duration-200`}
    >
      {/* Header Row */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {/* AI label */}
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            <Bot className="w-3 h-3" />
            AI Safety
          </span>

          {/* Status badge */}
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badgeText} ${cfg.badgeBg} border ${cfg.badgeBorder}`}
          >
            <Icon className={`w-3 h-3 ${cfg.iconColor}`} />
            {cfg.emoji} {cfg.label}
          </span>
        </div>

        {/* Score + toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {/* Mini progress bar */}
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${cfg.scoreBg} rounded-full transition-all duration-500`}
                style={{ width: `${safetyScore}%` }}
              />
            </div>
            <span className={`text-xs font-bold tabular-nums ${cfg.badgeText}`}>
              {safetyScore}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expandable reasons */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-current/10 space-y-1">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider mb-2">
            Prediction Factors
          </p>
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-0.5 text-[10px] text-gray-400">•</span>
              <span className={`text-xs leading-relaxed ${cfg.badgeText}`}>
                {reason}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 italic">
            ⚠️ This is an AI suggestion only. Use your own judgment.
          </p>
        </div>
      )}
    </div>
  );
}
