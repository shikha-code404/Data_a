"use client";

import React, { useState, useEffect } from "react";
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

export default function AIShortlistingPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [shortlist, setShortlist] = useState<ShortlistCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        if (data.jobs.length > 0) {
          const firstJobId = data.jobs[0].id;
          setSelectedJob(firstJobId);
          await runMatchingForJob(firstJobId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runMatchingForJob = async (jobId: string) => {
    setIsRunningMatch(true);
    try {
      const res = await fetch("/api/matching/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        const mapped = data.matches.map((m: any) => ({
          name: m.github_username ? `@${m.github_username}` : "Candidate Match",
          avatar: `https://avatars.githubusercontent.com/${m.github_username || "ghost"}`,
          github: m.github_username || "candidate",
          score: m.talent_score || 80,
          match: m.match_percentage || 80,
          skills: m.matching_skills || [],
          justification: m.reason || "Matches cosine similarity parameters."
        }));
        setShortlist(mapped);
      } else {
        setShortlist([]);
      }
    } catch (e) {
      console.error(e);
      setShortlist([]);
    } finally {
      setIsRunningMatch(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRunMatching = () => {
    if (selectedJob) {
      runMatchingForJob(selectedJob);
    }
  };

  const handleJobSelectChange = (jobId: string) => {
    setSelectedJob(jobId);
    runMatchingForJob(jobId);
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-[#131313] text-[#F5F5F5] py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D2042D] mb-3" />
        <p className="text-xs text-[#A3A3A3]">Loading job listings...</p>
      </div>
    );
  }

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
            onChange={(e) => handleJobSelectChange(e.target.value)}
            className="w-full max-w-md bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D2042D]"
          >
            {jobs.length === 0 ? (
              <option value="">No active job postings found</option>
            ) : (
              jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.company || "Partner"})</option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleRunMatching}
          disabled={isRunningMatch || !selectedJob}
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
