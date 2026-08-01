"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabaseBrowser } from "@/lib/db/client";
import {
  Users,
  Search,
  Sparkles,
  ChevronRight,
  Layers,
  MoreVertical,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";

interface CandidateCard {
  id: string; // composite: candidateId-jobId
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

export default function RecruiterPipelinePage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      const supabase = supabaseBrowser;
      
      const { data: recs, error: recsError } = await supabase
        .from("job_recommendations")
        .select(`
          id,
          candidate_id,
          job_id,
          match_percentage,
          candidate:candidate_profiles (
            user_id,
            github_username,
            talent_score,
            talent_profile
          ),
          job:job_postings (
            id,
            title
          )
        `);

      if (recsError) throw recsError;

      const { data: stagesData, error: stagesError } = await supabase
        .from("pipeline_stages")
        .select("*");

      if (stagesError) throw stagesError;

      const stageLookup: { [key: string]: string } = {};
      (stagesData || []).forEach((row: any) => {
        stageLookup[`${row.candidate_id}-${row.job_id}`] = row.stage;
      });

      const baseStages: Stage[] = [
        {
          id: "sourced",
          title: "Sourced / AI Matched",
          accentColor: "border-[#D2042D]/30 bg-[#D2042D]/5",
          dotColor: "bg-[#D2042D]",
          candidates: []
        },
        {
          id: "screening",
          title: "Screening Review",
          accentColor: "border-purple-500/30 bg-purple-500/5",
          dotColor: "bg-purple-400",
          candidates: []
        },
        {
          id: "interviewing",
          title: "Interviewing",
          accentColor: "border-[#ecc154]/30 bg-[#ecc154]/5",
          dotColor: "bg-[#ecc154]",
          candidates: []
        },
        {
          id: "offer",
          title: "Offer Stage",
          accentColor: "border-[#64de87]/30 bg-[#64de87]/5",
          dotColor: "bg-[#64de87]",
          candidates: []
        }
      ];

      (recs || []).forEach((r: any) => {
        const candidateProfile = r.candidate;
        if (!candidateProfile) return;

        const candidateId = candidateProfile.user_id;
        const jobId = r.job_id;
        const activeStage = stageLookup[`${candidateId}-${jobId}`] || "sourced";
        const stageObj = baseStages.find(s => s.id === activeStage);
        if (stageObj) {
          const overall = candidateProfile.talent_score?.overall_score || candidateProfile.talent_score?.overallScore || 75;
          const skillsList = candidateProfile.talent_profile?.resume?.skills || ["React", "TypeScript"];
          const roleTitle = candidateProfile.talent_profile?.resume?.experience?.[0]?.role || "Software Engineer";

          stageObj.candidates.push({
            id: `${candidateId}-${jobId}`,
            name: candidateProfile.talent_profile?.resume?.name || `@${candidateProfile.github_username}` || "Candidate",
            role: roleTitle,
            score: overall,
            match: Math.round(r.match_percentage || 80),
            avatar: `https://avatars.githubusercontent.com/${candidateProfile.github_username || "ghost"}`,
            skills: skillsList.slice(0, 3),
            jobTitle: r.job?.title || "Position"
          });
        }
      });

      setStages(baseStages);
    } catch (e) {
      console.error("Failed to load pipeline board data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

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

    const [candId, jId] = draggingId.split("-");

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

    fetch("/api/recruiter/pipeline/stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candId,
        job_id: jId,
        stage: targetStageId
      })
    }).catch(err => console.error("Failed to persist stage change:", err));

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
      {loading ? (
        <div className="py-20 text-center text-[#A3A3A3] text-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D2042D] mb-3" />
          <span>Loading pipeline board...</span>
        </div>
      ) : (
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
                {/* Column Title */}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                    <span className="font-bold text-white text-xs">{stage.title}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold bg-[#131313] border border-[#353534] px-1.5 py-0.5 rounded text-[#A3A3A3]">
                    {filtered.length}
                  </span>
                </div>

                {/* Cards */}
                {filtered.length === 0 ? (
                  <div className="border border-dashed border-[#353534]/50 rounded-xl p-6 text-center text-[10px] text-[#A3A3A3] flex flex-col items-center justify-center gap-1.5 min-h-[140px] bg-[#131313]/10">
                    <Users className="w-5 h-5 opacity-40" />
                    <span>No Candidates</span>
                  </div>
                ) : (
                  filtered.map((cand) => (
                    <div
                      key={cand.id}
                      draggable
                      onDragStart={() => handleDragStart(cand.id, stage.id)}
                      className="bg-[#1c1c1e] border border-[#353534] rounded-xl p-4 flex flex-col gap-3.5 hover:border-[#D2042D]/40 transition-colors cursor-grab active:cursor-grabbing shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <img src={cand.avatar} alt={cand.name} className="w-8 h-8 rounded-full object-cover border border-[#353534]" />
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-xs leading-none">{cand.name}</span>
                            <span className="text-[10px] text-[#A3A3A3] mt-1 truncate max-w-[100px]">{cand.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 font-mono text-[9px] font-bold text-[#ecc154] bg-[#ecc154]/10 px-1.5 py-0.5 rounded-full border border-[#ecc154]/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{cand.match}%</span>
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
      )}
    </div>
  );
}
