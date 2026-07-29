"use client";

import React from "react";
import { Trophy, Calendar, Award, ExternalLink } from "lucide-react";

export default function HackathonsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-indigo-400" />
          Hackathons & Achievements
        </h1>
        <p className="text-slate-400 mt-1">
          Showcase hackathon submissions, awards, and coding event achievements to recruiters.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-100">Global AI Innovation Hackathon 2025</h3>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-xs font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" /> 1st Place Winner
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Built an automated AI talent scoring pipeline with Next.js and Supabase.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> October 2025
              </span>
            </div>
          </div>

          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
            View Project <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
