"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function getCountdown(expiryDate) {
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: "Expired", color: "text-red-500 dark:text-red-400" };

  const totalSecs = Math.floor(diff / 1000);
  const days  = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins  = Math.floor((totalSecs % 3600) / 60);
  const secs  = totalSecs % 60;

  let text = "";
  let color = "text-emerald-600 dark:text-emerald-400";

  if (days > 0) {
    text = `${days}d ${hours}h left`;
    color = days > 1 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";
  } else if (hours > 0) {
    text = `${hours}h ${mins}m left`;
    color = hours > 3 ? "text-amber-600 dark:text-amber-400" : "text-orange-600 dark:text-orange-400";
  } else {
    text = `${mins}m ${secs}s left`;
    color = "text-red-600 dark:text-red-400";
  }

  return { expired: false, text, color };
}

export default function ExpiryCountdown({ expiryDate }) {
  const [countdown, setCountdown] = useState(() => getCountdown(expiryDate));

  useEffect(() => {
    // Update every second if < 1 hour, every minute otherwise
    const diff = new Date(expiryDate).getTime() - Date.now();
    const interval = diff < 3600000 ? 1000 : 60000;

    const timer = setInterval(() => {
      setCountdown(getCountdown(expiryDate));
    }, interval);

    return () => clearInterval(timer);
  }, [expiryDate]);

  return (
    <div className={`flex items-center text-sm font-semibold ${countdown.color}`}>
      <Timer className="w-4 h-4 mr-2 flex-shrink-0" />
      <span>{countdown.text}</span>
    </div>
  );
}
