import React from "react";

interface MatchScorePillProps {
  score: number;
  className?: string;
}

export const MatchScorePill: React.FC<MatchScorePillProps> = ({ score, className = "" }) => {
  // Determine color theme based on score
  let bgClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40";
  let dotClass = "bg-emerald-500";

  if (score < 70) {
    bgClass = "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/40";
    dotClass = "bg-slate-400";
  } else if (score < 85) {
    bgClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40";
    dotClass = "bg-amber-500";
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm transition-all duration-200 ${bgClass} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotClass} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}></span>
      </span>
      <span>{score}% Match</span>
    </div>
  );
};

export default MatchScorePill;
