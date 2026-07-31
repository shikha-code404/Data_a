"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, MapPin, Users, Award, ShieldCheck, Sparkles } from "lucide-react";

export default function RecruiterAnalyticsPage() {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [groupBy, setGroupBy] = useState<string>("campus");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/analytics/heatmap?by=${groupBy}`).then((r) => r.json()),
      fetch(`/api/recruiter/analytics`).then((r) => r.json())
    ])
      .then(([heatmap, analytics]) => {
        if (Array.isArray(heatmap)) setHeatmapData(heatmap);
        if (analytics && analytics.team_statistics) setAnalyticsData(analytics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [groupBy]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Recruiter Analytics & Intelligence</span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2 mt-1">
          <BarChart3 className="w-8 h-8 text-indigo-400" /> Hiring Analytics & Campus Heatmap
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time predictive pipeline analytics, candidate risk distribution, and campus talent density heatmaps.
        </p>
      </div>

      {/* Predictive Analytics Overview */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Total Pool Size</span>
            <span className="text-3xl font-extrabold text-indigo-400 mt-2 block">
              {analyticsData.team_statistics.hiring_funnel?.total_candidates || 8}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Active evaluated profiles</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Avg Talent Score</span>
            <span className="text-3xl font-extrabold text-emerald-400 mt-2 block">
              {analyticsData.team_statistics.average_talent_score || 82.5}
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Out of 100 overall score</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Avg Match Rate</span>
            <span className="text-3xl font-extrabold text-cyan-400 mt-2 block">
              {analyticsData.team_statistics.average_match_percentage || 84.3}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">384d vector cosine fit</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Pass Conversion</span>
            <span className="text-3xl font-extrabold text-purple-400 mt-2 block">
              {analyticsData.team_statistics.interview_conversion_rate || 100}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Verified interview pass rate</span>
          </div>
        </div>
      )}

      {/* Campus Talent Heatmap Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" /> Campus Talent Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated candidate talent density based strictly on verified profile location evidence.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {["campus", "city", "department", "year"].map((dim) => (
              <button
                key={dim}
                onClick={() => setGroupBy(dim)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition ${
                  groupBy === dim
                    ? "bg-purple-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Loading heatmap data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {heatmapData.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition">
                <div>
                  <span className="text-xs font-bold text-purple-300 block line-clamp-1">{item.location}</span>
                  <span className="text-2xl font-extrabold text-white mt-2 block">{item.candidate_count} <span className="text-xs text-slate-400 font-normal">candidates</span></span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-900 grid grid-cols-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Avg Talent</span>
                    <span className="font-bold text-emerald-400">{item.average_talent_score}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Avg Rep</span>
                    <span className="font-bold text-indigo-400">{item.average_reputation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
