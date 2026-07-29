"use client";

import React, { useState } from "react";
import { mockTalentScore, mockJobs, mockRoadmapSteps } from "@/lib/mock-data";
import { JobCard } from "@/components/JobCard";
import { RadarScoreChart } from "@/components/RadarScoreChart";
import {
  Sparkles,
  Award,
  Compass,
  CheckCircle2,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

export default function CandidateDashboard() {
  const [isLoadingState, setIsLoadingState] = useState(false);

  // Skill badges checklist (mock verified skills)
  const verifiedSkills = [
    "React (Expert)",
    "TypeScript (Expert)",
    "Next.js (Advanced)",
    "GraphQL (Intermediate)",
    "System Design (Intermediate)",
    "PostgreSQL (Intermediate)",
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header and Loading Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Welcome back, Elena</span>
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your profile was updated by AI Agent parsing 3 hours ago.
          </p>
        </div>

        {/* Loading State Toggle */}
        <button
          onClick={() => setIsLoadingState(!isLoadingState)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <span>Show Loading State:</span>
          {isLoadingState ? (
            <ToggleRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-zinc-400" />
          )}
        </button>
      </div>

      {isLoadingState ? (
        // ================= LOADING SKELETON STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Talent Score Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 animate-pulse-subtle">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-8 w-16 bg-zinc-250 dark:bg-zinc-800 rounded-full"></div>
              </div>
              <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-lg flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700"></div>
              </div>
            </div>

            {/* Verified Skills Skeleton */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 animate-pulse-subtle">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Top Job Matches Skeleton */}
            <div className="space-y-4">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse-subtle"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 h-72 flex flex-col justify-between animate-pulse-subtle"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        <div className="h-5 w-16 bg-zinc-250 dark:bg-zinc-800 rounded-full"></div>
                      </div>
                      <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
                      <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                      <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Roadmap Skeleton */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 animate-pulse-subtle">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
                      <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ================= LOADED VIEW STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Talent Score & Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Talent Score summary card */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-indigo-500" />
                    Talent Score Analytics
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Evaluated based on projects, skills, and community footprint.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400">
                    {mockTalentScore.overall}
                    <span className="text-xs text-zinc-400 font-medium">/100</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wide">
                    Top 2% Globally
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Radar chart component */}
                <div className="md:col-span-2 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-100 dark:border-zinc-900/60 p-2">
                  <RadarScoreChart data={mockTalentScore.subScores} />
                </div>

                {/* Score breakdown metrics list */}
                <div className="space-y-3.5 pl-2">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Key Strengths
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Problem Solving</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">95%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Coding Ability</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">92%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Technical Consistency</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">88%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Skill Badges chip list */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Verified Skill Credentials
              </h3>
              <div className="flex flex-wrap gap-2">
                {verifiedSkills.map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-semibold px-3 py-1 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-1 shadow-sm"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Job Matches */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                Top AI-Generated Job Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Roadmap / Next steps */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm h-full">
              <div className="mb-6">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-indigo-500" />
                  Your AI Career Roadmap
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  AI suggestions to boost match percentages and fill missing gaps.
                </p>
              </div>

              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-155 dark:before:bg-zinc-850">
                {mockRoadmapSteps.map((step) => (
                  <div key={step.id} className="relative flex gap-4 pl-8 group">
                    {/* Circle Node */}
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-650 flex items-center justify-center shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {step.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            step.status === "in_progress"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-zinc-400"
                          }`}
                        >
                          {step.status === "in_progress" ? "In Progress" : "Up Next"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="text-[10px] font-semibold text-zinc-400">
                        Est: {step.timeEstimate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informational callout card */}
              <div className="mt-8 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850 flex gap-2">
                <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                  Completing roadmap steps updates your credentials and broadcasts improvements instantly to relevant recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
