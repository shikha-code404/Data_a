"use client";

import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { SubScore } from "@/lib/mock-data";

interface RadarScoreChartProps {
  data: SubScore[];
}

export const RadarScoreChart: React.FC<RadarScoreChartProps> = ({ data }) => {
  // Simple state to ensure client-side mounting (prevents Recharts SSR mismatch warnings)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
        Loading score dynamics...
      </div>
    );
  }

  return (
    <div className="h-64 w-full flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="var(--border)" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "currentColor", fontSize: 10, fontWeight: 500 }}
            className="text-zinc-500 dark:text-zinc-400"
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "currentColor", fontSize: 8 }}
            className="text-zinc-400 dark:text-zinc-600"
            axisLine={false}
          />
          <Radar
            name="Talent Score"
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--secondary)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarScoreChart;
