import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  trendType = "neutral",
  icon,
  className = "",
}) => {
  let trendColor = "text-slate-500 dark:text-slate-400";
  if (trendType === "up") {
    trendColor = "text-emerald-600 dark:text-emerald-400";
  } else if (trendType === "down") {
    trendColor = "text-red-600 dark:text-red-400";
  }

  return (
    <div
      className={`glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex justify-between items-start ${className}`}
    >
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {value}
        </div>
        {trend && (
          <div className={`text-xs font-semibold flex items-center gap-1 ${trendColor}`}>
            {trend}
          </div>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
