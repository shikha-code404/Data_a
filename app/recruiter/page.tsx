"use client";

import React, { useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { mockCandidates, mockPipelineStages, mockJobs } from "@/lib/mock-data";
import { CandidateCard } from "@/components/CandidateCard";
import { StatCard } from "@/components/StatCard";
import { MatchScorePill } from "@/components/MatchScorePill";
import {
  Sparkles,
  Search,
  Briefcase,
  Users,
  Percent,
  Plus,
  Layers,
  Settings,
} from "lucide-react";

export default function RecruiterDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineData, setPipelineData] = useState(mockPipelineStages);

  // Handle simulated drag and drop between Kanban stages
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id as string;
    const targetStageId = over.id as string;

    // Find the candidate across all stages
    let candidateToMove: any = null;
    const updatedStages = pipelineData.map((stage) => {
      const exists = stage.candidates.some((c) => c.id === candidateId);
      if (exists) {
        candidateToMove = stage.candidates.find((c) => c.id === candidateId);
        return {
          ...stage,
          candidates: stage.candidates.filter((c) => c.id !== candidateId),
        };
      }
      return stage;
    });

    if (candidateToMove) {
      const finalStages = updatedStages.map((stage) => {
        if (stage.id === targetStageId) {
          return {
            ...stage,
            candidates: [...stage.candidates, candidateToMove],
          };
        }
        return stage;
      });
      setPipelineData(finalStages);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Recruiting Operations Control
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review talent discovery feeds, pipelines, and AI copilot assessments.
        </p>
      </div>

      {/* Recruiter Copilot search bar */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur opacity-15 group-focus-within:opacity-30 transition duration-300"></div>
        <div className="relative flex items-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-4 py-3.5 shadow-sm">
          <Sparkles className="h-5 w-5 text-indigo-500 mr-3 shrink-0 animate-pulse" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find React developers with hackathon experience and high problem-solving sub-scores..."
            className="w-full bg-transparent text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
          <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm ml-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Hiring Analytics: 3 stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Open Positions"
          value={mockJobs.length}
          trend="+2 posted this week"
          trendType="up"
          icon={<Briefcase className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Candidate Match"
          value="84.2%"
          trend="+1.4% improvement"
          trendType="up"
          icon={<Percent className="h-5 w-5" />}
        />
        <StatCard
          title="Pipeline Active"
          value={pipelineData.reduce((acc, stage) => acc + stage.candidates.length, 0)}
          trend="5 new applicants today"
          trendType="up"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Candidate Discovery Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            Candidate Discovery Feed
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
            Showing 4 matching candidates
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCandidates.slice(0, 4).map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>

      {/* Pipeline preview Kanban Board using dnd-kit structure */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-violet-500" />
            Interactive Recruiter Pipeline
          </h2>
          <span className="text-xs text-zinc-400 font-medium">
            Drag and drop candidates to update stages
          </span>
        </div>

        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {pipelineData.map((stage) => (
              <div
                key={stage.id}
                id={stage.id}
                className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-3.5 min-h-[300px] flex flex-col space-y-3"
              >
                {/* Column Header */}
                <div className="flex justify-between items-center border-b border-zinc-200/40 dark:border-zinc-800/40 pb-2 mb-1">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {stage.title}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-450 px-1.5 py-0.5 bg-zinc-200/50 dark:bg-zinc-800 rounded">
                    {stage.candidates.length}
                  </span>
                </div>

                {/* Column Body / Candidate Lists */}
                <div className="flex-1 flex flex-col gap-2.5">
                  {stage.candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-3 rounded-lg shadow-sm hover:border-violet-300 dark:hover:border-violet-955/65 transition-colors cursor-grab active:cursor-grabbing group relative"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate block max-w-[100px]">
                          {candidate.name}
                        </span>
                        <div className="scale-75 origin-top-right">
                          <MatchScorePill score={candidate.matchScore} />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-450 dark:text-zinc-550 truncate">
                        {candidate.title}
                      </p>
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-850/40">
                        <span className="text-[9px] font-medium text-zinc-400">
                          Score: {candidate.overallScore}
                        </span>
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-4 h-4 rounded-full object-cover border border-zinc-200 dark:border-zinc-750"
                        />
                      </div>
                    </div>
                  ))}
                  {stage.candidates.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                      <span className="text-[10px] text-zinc-400 font-medium">Empty Stage</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
