"use client";

import React, { useState } from "react";
import {
  Award,
  Sparkles,
  Loader2,
  GitBranch,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Brain,
  CheckCircle
} from "lucide-react";

interface ShortlistCandidate {
  name: string;
  avatar: string;
  github: string;
  score: number;
  match: number;
  skills: string[];
  justification: string;
}

const mockShortlists: Record<string, ShortlistCandidate[]> = {
  "fe-eng": [
    {
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      github: "shikha-singh",
      score: 92,
      match: 95,
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
      justification: "Top matching engineer with verified Supabase Vector RLS libraries and high-frequency React/Next.js commits."
    },
    {
      name: "Marcus Chen",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      github: "marcus-chen",
      score: 84,
      match: 82,
      skills: ["Vue.js", "Nuxt.js", "GraphQL", "TailwindCSS"],
      justification: "Strong frontend styling alignment, Vue.js codebase context, and solid styling aesthetics scoring."
    }
  ],
  "product-design": [
    {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      github: "sarah-design",
      score: 89,
      match: 91,
      skills: ["Figma", "UI Design", "TailwindCSS", "CSS Motion"],
      justification: "Design systems spec matches precisely. Produced 4 open-source Figma component utility packages."
    }
  ],
  "data-architect": [
    {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      github: "alexrivera-dev",
      score: 88,
      match: 89,
      skills: ["Python", "PyTorch", "pgvector", "PostgreSQL"],
      justification: "Highly relevant background in PostgreSQL vector searching and ML local feature extraction models."
    }
  ]
};

export default function AIShortlistingPage() {
  const [selectedJob, setSelectedJob] = useState("fe-eng");
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [shortlist, setShortlist] = useState<ShortlistCandidate[]>(mockShortlists["fe-eng"]);

  const handleRunMatching = () => {
    setIsRunningMatch(true);
    setTimeout(() => {
      setShortlist(mockShortlists[selectedJob] || []);
      setIsRunningMatch(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 bg-[#131313] text-[#F5F5F5]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">AI Shortlisting</h1>
          <p className="text-xs text-[#A3A3A3] mt-1.5">
            Evaluate and rank candidate match profiles for open job positions using vector embeddings.
          </p>
        </div>
      </div>

      {/* Control Card */}
      <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#D2042D]/5 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Target Job Posting</label>
          <select
            value={selectedJob}
            onChange={(e) => {
              setSelectedJob(e.target.value);
              setShortlist(mockShortlists[e.target.value] || []);
            }}
            className="w-full max-w-md bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D2042D]"
          >
            <option value="fe-eng">Senior Front-End Engineer (Engineering)</option>
            <option value="product-design">Product Designer (Design)</option>
            <option value="data-architect">Data Platform Architect (Data Engineering)</option>
          </select>
        </div>

        <button
          onClick={handleRunMatching}
          disabled={isRunningMatch}
          className="flex items-center gap-2 px-5 py-3 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D2042D]/15 self-start md:self-auto shrink-0 disabled:opacity-50"
        >
          {isRunningMatch ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Calculating Cosine Similarity...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Execute Recruiter Match Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match Statistics */}
        <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 space-y-6 h-fit shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#353534]/50 pb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D2042D]" /> Match Evaluation Info
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#A3A3A3]">Shortlisted Pool</span>
              <span className="font-bold text-white font-mono">{shortlist.length} Candidates</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#A3A3A3]">Maximum Score</span>
              <span className="font-bold text-[#65de85] font-mono">
                {shortlist[0] ? `${shortlist[0].score}/100` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#A3A3A3]">AI Confidence</span>
              <span className="font-bold text-[#ecc154] font-mono">
                {shortlist[0] ? `${shortlist[0].match}% Match` : "N/A"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#131313] border border-[#353534] rounded-xl text-[11px] text-[#A3A3A3] leading-relaxed">
            🚀 <strong>Shortlist Engine:</strong> Embeds the job description parameters and performs cosine similarity vector searches against candidate profile logs.
          </div>
        </div>

        {/* Shortlist Ranked Candidates List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider px-1">
            Ranked Shortlist Standings
          </h2>

          {isRunningMatch ? (
            <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-20 text-center text-[#A3A3A3] text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#D2042D] mx-auto mb-3" />
              <span>Analyzing git repositories and resumes...</span>
            </div>
          ) : shortlist.length === 0 ? (
            <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-20 text-center text-[#A3A3A3] text-xs">
              <span>No candidates shortlisted for this job yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {shortlist.map((cand, idx) => (
                <div 
                  key={idx}
                  className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/40 rounded-2xl p-6 transition-all shadow-lg space-y-4 relative"
                >
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#D2042D]/15 text-[#D2042D] border border-[#d2032c]/20">
                        #{idx + 1}
                      </div>
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#353534]"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-none">{cand.name}</h4>
                        <span className="text-[10px] text-[#A3A3A3] font-mono mt-1 block">@{cand.github}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A3A3A3] block">Match Similarity</span>
                        <span className="font-bold text-[#D2042D]">{cand.match}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#A3A3A3] block">Talent Score</span>
                        <span className="font-bold text-[#65de85]">{cand.score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Justification reasoning */}
                  <div className="p-4 bg-[#131313] border border-[#353534] rounded-xl flex gap-3">
                    <div className="h-5 w-5 shrink-0 rounded bg-[#D2042D]/10 flex items-center justify-center text-[#D2042D]">
                      <Brain className="h-3 w-3" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">AI Match Reasoning</h5>
                      <p className="text-xs text-[#A3A3A3] leading-relaxed">
                        {cand.justification}
                      </p>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {cand.skills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 bg-[#131313] border border-[#353534] text-[#A3A3A3] text-[10px] rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
