"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Shield, Brain, Layers, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:py-32 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-semibold mb-6 animate-pulse-subtle">
          <Sparkles className="h-3.5 w-3.5" />
          <span>V1.0 AI Talent Intelligence Scaffold</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-950 via-zinc-900 to-indigo-905 dark:from-zinc-100 dark:via-zinc-100 dark:to-indigo-400 bg-clip-text text-transparent leading-none">
          Evaluate Talent. Optimize Operations.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The autonomous vetting shell for engineers and recruitment ops. Built with modern dashboards, radar charts, and interactive Kanban pipeline workflows.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-1.5 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] transition-all"
          >
            <span>Register Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-bold transition-all"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Dual Context Section */}
      <section className="py-12 px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Candidate Card */}
          <div className="glass-card p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-900 transition-all duration-300">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-sm mb-4">
                <Brain className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Candidate Growth Portal
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 mb-6">
                Understand your sub-scores via automated repo analytics, browse curated matching jobs, build structured resumes, and complete tailored roadmap goals.
              </p>
              
              <ul className="space-y-2 mb-8 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Visual Talent Radar Graph
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Dynamic AI Job Matches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Tailored Skill Upgrades
                </li>
              </ul>
            </div>

            <Link
              href="/candidate"
              className="w-full text-center py-2.5 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-950/40 transition-colors border border-indigo-100/50 dark:border-indigo-900/30"
            >
              Demo Candidate Dashboard
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="glass-card p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-violet-300 dark:hover:border-violet-900 transition-all duration-300">
            <div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40 shadow-sm mb-4">
                <Layers className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Recruiting Operations Center
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 mb-6">
                Query developers using natural language Copilot, track applicants along visual pipeline stages, and manage metrics using real-time graphs.
              </p>

              <ul className="space-y-2 mb-8 text-xs font-semibold text-zinc-650 dark:text-zinc-350">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  AI Natural Language Search
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Drag-and-Drop Pipeline Board
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Hiring & Metric Dashboards
                </li>
              </ul>
            </div>

            <Link
              href="/recruiter"
              className="w-full text-center py-2.5 bg-violet-50/70 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-950/40 transition-colors border border-violet-100/50 dark:border-violet-900/30"
            >
              Demo Recruiter Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
