"use client";

import React from "react";
import { Award, Code, FileCheck, Sparkles, TrendingUp, CheckCircle, Star, ShieldCheck } from "lucide-react";

export default function TalentScorePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Award className="w-8 h-8 text-indigo-400" />
          AI Talent Score & Analysis
        </h1>
        <p className="text-slate-400 mt-1">
          Comprehensive evaluation generated from your GitHub repositories, code quality, and parsed resume.
        </p>
      </div>

      {/* Main Score Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Overall Talent Score</span>
            <div className="relative flex items-center justify-center">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                88.5
              </span>
              <span className="text-xl font-semibold text-slate-500 ml-1">/100</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Top 5% Talent Match
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Score Breakdown
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" /> Code Quality & GitHub Activity
                  </span>
                  <span className="font-semibold text-cyan-400">92 / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-400" /> Resume & Skill Relevance
                  </span>
                  <span className="font-semibold text-purple-400">85 / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Project Complexity & Architecture
                  </span>
                  <span className="font-semibold text-emerald-400">88 / 100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Skills & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Verified Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {["TypeScript", "React", "Next.js", "Node.js", "Python", "Supabase", "TailwindCSS", "REST APIs", "Git"].map((skill) => (
              <span key={skill} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            AI Highlights & Strengths
          </h3>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2" />
              Strong consistency in full-stack JavaScript and TypeScript repositories.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2" />
              Demonstrated capability building serverless applications with Supabase.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2" />
              High repository documentation standards and modular code architecture.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
