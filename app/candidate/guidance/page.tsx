"use client";

import React from "react";
import { Compass, Lightbulb, Target, Rocket } from "lucide-react";

export default function GuidancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Compass className="w-8 h-8 text-indigo-400" />
          AI Career Guidance & Roadmap
        </h1>
        <p className="text-slate-400 mt-1">
          Personalized AI recommendations to boost your Talent Score and career growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Recommended Skills</h3>
          <p className="text-sm text-slate-400">
            Adding Docker containerization and Redis caching to your projects can increase your talent match score by +7%.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">GitHub Enhancements</h3>
          <p className="text-sm text-slate-400">
            Add detailed `README.md` files and architecture diagrams to your recent repositories to showcase system design depth.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Target Role Paths</h3>
          <p className="text-sm text-slate-400">
            Your current portfolio aligns strongly with Senior Full Stack & AI Integrations roles.
          </p>
        </div>
      </div>
    </div>
  );
}
