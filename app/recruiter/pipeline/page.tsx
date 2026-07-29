"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Search,
  Filter,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface CandidateCard {
  id: string;
  name: string;
  role: string;
  score: number;
  match: number;
  avatar: string;
}

interface Stage {
  id: string;
  title: string;
  color: string;
  candidates: CandidateCard[];
}

const initialStages: Stage[] = [
  {
    id: "sourced",
    title: "Sourced / AI Matched",
    color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
    candidates: [
      {
        id: "cand-1",
        name: "Elena Rostova",
        role: "Senior Full Stack Engineer",
        score: 92,
        match: 95,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "cand-2",
        name: "Alex Rivera",
        role: "Machine Learning Engineer",
        score: 88,
        match: 89,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "screening",
    title: "Screening Review",
    color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    candidates: [
      {
        id: "cand-3",
        name: "Marcus Chen",
        role: "Frontend Developer",
        score: 84,
        match: 82,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: "interview",
    title: "Interview Stage",
    color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    candidates: [],
  },
  {
    id: "hired",
    title: "Offer / Hired",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    candidates: [],
  },
];

export default function RecruiterPipelinePage() {
  const { user } = useAuth();
  const [stages, setStages] = useState<Stage[]>(initialStages);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recruiter/dashboard" className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Recruiter Candidate Pipeline
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full">
                Active Kanban
              </span>
            </h1>
            <p className="text-xs text-slate-400">Track candidates across recruitment stages</p>
          </div>
        </div>

        <Link
          href="/recruiter/dashboard"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </header>

      {/* Kanban Board Layout */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[900px]">
          {stages.map((stage) => (
            <div key={stage.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col">
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${stage.color}`}>
                  {stage.title}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {stage.candidates.length}
                </span>
              </div>

              {/* Cards in Stage */}
              <div className="space-y-3 flex-1">
                {stage.candidates.length === 0 ? (
                  <div className="border border-dashed border-slate-800 rounded-lg p-6 text-center text-xs text-slate-500">
                    No candidates in this stage
                  </div>
                ) : (
                  stage.candidates.map((c) => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{c.name}</h4>
                          <span className="text-[10px] text-slate-400 block">{c.role}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-900">
                        <span className="text-emerald-400 font-semibold">Score: {c.score}/100</span>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 font-bold rounded">
                          {c.match}% Match
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
