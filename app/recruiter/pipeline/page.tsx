"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Users,
  Search,
  Sparkles,
  ChevronRight,
  Layers,
  MoreVertical,
  Plus,
  ArrowRight
} from "lucide-react";

interface CandidateCard {
  id: string;
  name: string;
  role: string;
  score: number;
  match: number;
  avatar: string;
  skills: string[];
  jobTitle: string;
}

interface Stage {
  id: string;
  title: string;
  accentColor: string;
  dotColor: string;
  candidates: CandidateCard[];
}

const initialStages: Stage[] = [
  {
    id: "sourced",
    title: "Sourced / AI Matched",
    accentColor: "border-[#D2042D]/30 bg-[#D2042D]/5",
    dotColor: "bg-[#D2042D]",
    candidates: [
      {
        id: "cand-1",
        name: "Elena Rostova",
        role: "Senior Full Stack Eng",
        score: 92,
        match: 95,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        skills: ["React", "Next.js", "TypeScript"],
        jobTitle: "Senior Cloud Architect"
      },
      {
        id: "cand-2",
        name: "Alex Rivera",
        role: "Machine Learning Eng",
        score: 88,
        match: 89,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        skills: ["Python", "PyTorch", "FastAPI"],
        jobTitle: "Staff QA Engineer"
      },
    ],
  },
  {
    id: "screening",
    title: "Screening Review",
    accentColor: "border-purple-500/30 bg-purple-500/5",
    dotColor: "bg-purple-400",
    candidates: [
      {
        id: "cand-3",
        name: "Marcus Chen",
        role: "Senior Architect",
        score: 94,
        match: 91,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        skills: ["AWS", "Kubernetes", "Go"],
        jobTitle: "VP of Engineering"
      },
    ],
  },
  {
    id: "interviewing",
    title: "Interviewing",
    accentColor: "border-[#ecc154]/30 bg-[#ecc154]/5",
    dotColor: "bg-[#ecc154]",
    candidates: [
      {
        id: "cand-4",
        name: "Sarah Jenkins",
        role: "Senior Engineer",
        score: 90,
        match: 88,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        skills: ["Go", "Kubernetes", "Redis"],
        jobTitle: "DevOps Lead"
      },
    ],
  },
  {
    id: "offer",
    title: "Offer Stage",
    accentColor: "border-[#64de87]/30 bg-[#64de87]/5",
    dotColor: "bg-[#64de87]",
    candidates: [
      {
        id: "cand-5",
        name: "Linda Wu",
        role: "Director of Eng",
        score: 87,
        match: 85,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        skills: ["Leadership", "System Design"],
        jobTitle: "Senior Cloud Architect"
      },
    ],
  },
];

export default function RecruiterPipelinePage() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);

  const handleDragStart = (candidateId: string, stageId: string) => {
    setDraggingId(candidateId);
    setDraggingFrom(stageId);
  };

  const handleDrop = (targetStageId: string) => {
    if (!draggingId || !draggingFrom || draggingFrom === targetStageId) {
      setDraggingId(null);
      setDraggingFrom(null);
      return;
    }

    setStages(prev => {
      const fromStage = prev.find(s => s.id === draggingFrom)!;
      const candidate = fromStage.candidates.find(c => c.id === draggingId)!;

      return prev.map(stage => {
        if (stage.id === draggingFrom) {
          return { ...stage, candidates: stage.candidates.filter(c => c.id !== draggingId) };
        }
        if (stage.id === targetStageId) {
          return { ...stage, candidates: [...stage.candidates, candidate] };
        }
        return stage;
      });
    });

    setDraggingId(null);
    setDraggingFrom(null);
  };

  const totalCandidates = stages.reduce((acc, s) => acc + s.candidates.length, 0);

  return (
    <div className="space-y-6 bg-[#131313] text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Pipeline Board</h1>
          <p className="text-xs text-[#A3A3A3] mt-1.5">
            <span className="text-[#D2042D] font-bold font-mono">{totalCandidates}</span> candidates across{" "}
            <span className="text-white font-semibold">{stages.length}</span> stages — drag to advance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className="bg-[#1c1c1e] border border-[#353534] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D] w-52"
            />
          </div>
          <button className="flex items-center gap-1.5 bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/40 text-white font-bold px-3 py-2 rounded-lg text-xs transition-all">
            <Layers className="w-3.5 h-3.5 text-[#D2042D]" />
            <span>Filter View</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const filtered = stage.candidates.filter(c =>
            !searchQuery ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <div
              key={stage.id}
              className={`flex flex-col gap-3 min-h-[400px] rounded-2xl p-4 border ${stage.accentColor} transition-all`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{stage.title}</h3>
                </div>
                <span className="text-[10px] font-bold text-[#A3A3A3] bg-[#131313] px-2 py-0.5 rounded-full border border-[#353534] font-mono">
                  {filtered.length}
                </span>
              </div>

              {/* Candidate Cards */}
              {filtered.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-[#A3A3A3] text-xs border border-dashed border-[#353534]/50 rounded-xl">
                  Drop candidates here
                </div>
              ) : (
                filtered.map((cand) => (
                  <div
                    key={cand.id}
                    draggable
                    onDragStart={() => handleDragStart(cand.id, stage.id)}
                    className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/30 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all shadow-md hover:shadow-[#D2042D]/5 hover:-translate-y-0.5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#353534] shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{cand.name}</p>
                          <p className="text-[10px] text-[#A3A3A3] mt-1 truncate max-w-[100px]">{cand.role}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#D2042D] font-mono leading-none">{cand.match}%</p>
                        <p className="text-[8px] text-[#A3A3A3] mt-0.5 uppercase font-bold">Match</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {cand.skills.slice(0, 2).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-[#131313] border border-[#353534] text-[#A3A3A3] text-[9px] rounded font-medium">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#353534]/50">
                      <span className="text-[9px] text-[#A3A3A3] truncate max-w-[100px]">{cand.jobTitle}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono font-bold text-white">{cand.score}</span>
                        <span className="text-[9px] text-[#A3A3A3]">/100</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Add Candidate Placeholder */}
              <button className="mt-auto w-full border border-dashed border-[#353534]/50 hover:border-[#D2042D]/30 text-[#A3A3A3] hover:text-white rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-1 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
