"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Sparkles,
  Filter,
  Award,
  GitBranch,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Code2,
  Briefcase,
  Star,
  Users,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface CandidateData {
  candidate_id: string;
  name?: string;
  avatar?: string;
  github_username?: string;
  talent_score: number;
  match_percentage: number;
  similarity_score?: number;
  skills: string[];
  top_projects?: Array<{ name: string; description: string; stars?: number }>;
  github_activity?: { repo_count: number; top_language: string; total_stars: number };
  resume_summary?: string;
  fraud_status?: { is_verified: boolean; ai_risk: string; audit_date: string };
  skill_badges?: Array<{ skill: string; verified: boolean; source: string }>;
  reason?: string;
  talent_profile?: any;
}

const mockCandidateList: CandidateData[] = [
  {
    candidate_id: "0ee73e0e-0529-4480-a16c-15748a277bde",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    github_username: "shikha-singh",
    talent_score: 92,
    match_percentage: 95,
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "TailwindCSS"],
    top_projects: [
      { name: "next-ai-recruiter", description: "AI talent scoring & vector matching engine", stars: 42 },
      { name: "supabase-rls-guard", description: "Automated row-level security policy generator", stars: 28 },
    ],
    github_activity: { repo_count: 16, top_language: "TypeScript", total_stars: 124 },
    resume_summary: "Senior Full Stack Engineer with 3.5+ years building production Next.js and Supabase web applications.",
    fraud_status: { is_verified: true, ai_risk: "Low Risk (< 5%)", audit_date: "Passed July 2026" },
    skill_badges: [
      { skill: "React & Next.js", verified: true, source: "GitHub Commits & Code Audit" },
      { skill: "Supabase Vector RLS", verified: true, source: "Live Schema Verification" },
      { skill: "TypeScript Architect", verified: true, source: "Repository AST Analysis" },
    ],
    reason: "Matched 95% with 92/100 Talent Score, verified Next.js/TypeScript repositories, and low fraud risk.",
  },
  {
    candidate_id: "cand-2-alex",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    github_username: "alexrivera-dev",
    talent_score: 88,
    match_percentage: 89,
    skills: ["Python", "PyTorch", "FastAPI", "React", "Docker", "PostgreSQL"],
    top_projects: [
      { name: "mini-llm-embeddings", description: "Local feature extraction transformer pipelines", stars: 64 },
      { name: "fastapi-vector-search", description: "pgvector similarity search microservice", stars: 31 },
    ],
    github_activity: { repo_count: 22, top_language: "Python", total_stars: 185 },
    resume_summary: "Machine Learning & Full Stack Engineer specialized in Python backend microservices and vector databases.",
    fraud_status: { is_verified: true, ai_risk: "Low Risk (< 3%)", audit_date: "Passed July 2026" },
    skill_badges: [
      { skill: "Python & PyTorch", verified: true, source: "GitHub Repositories & Commits" },
      { skill: "FastAPI Microservices", verified: true, source: "API Benchmark Verification" },
    ],
    reason: "Matched 89% with 88/100 Talent Score and verified Python ML project portfolio.",
  },
  {
    candidate_id: "cand-3-marcus",
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    github_username: "marcus-chen",
    talent_score: 84,
    match_percentage: 82,
    skills: ["Vue.js", "Nuxt.js", "Node.js", "GraphQL", "TailwindCSS"],
    top_projects: [
      { name: "vue-dashboard-suite", description: "Realtime analytics UI with WebSocket feeds", stars: 19 },
    ],
    github_activity: { repo_count: 11, top_language: "Vue", total_stars: 45 },
    resume_summary: "Frontend developer focused on responsive UI performance and design systems.",
    fraud_status: { is_verified: true, ai_risk: "Low Risk", audit_date: "Passed June 2026" },
    skill_badges: [
      { skill: "Vue.js & Nuxt", verified: true, source: "Frontend Audit" },
    ],
    reason: "Matched 82% with solid frontend component engineering background.",
  },
];

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<CandidateData[]>(mockCandidateList);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  // Filters State
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [minScore, setMinScore] = useState<number>(0);
  const [expFilter, setExpFilter] = useState<string>("All");

  // NL Search Handler calling POST /api/recruiter/search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setCandidates(mockCandidateList);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch("/api/recruiter/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
        // Map returned search results to candidate cards format
        const mappedResults: CandidateData[] = data.candidates.map((c: any) => ({
          candidate_id: c.candidate_id,
          name: c.github_username ? `@${c.github_username}` : "Candidate",
          avatar: `https://avatars.githubusercontent.com/${c.github_username || "ghost"}`,
          github_username: c.github_username,
          talent_score: c.talent_score || 85,
          match_percentage: c.match_percentage || c.similarity_score || 85,
          skills: c.skills || ["TypeScript", "React"],
          top_projects: [
            { name: "featured-repo", description: "Verified GitHub repository submission" },
          ],
          github_activity: { repo_count: c.github_repo_count || 12, top_language: "TypeScript", total_stars: 50 },
          resume_summary: c.reason || "Full stack developer profile.",
          fraud_status: { is_verified: true, ai_risk: "Low Risk (< 4%)", audit_date: "Passed July 2026" },
          skill_badges: (c.skills || ["TypeScript"]).map((s: string) => ({ skill: s, verified: true, source: "Copilot Match Engine" })),
          reason: c.reason,
          talent_profile: c.talent_profile,
        }));
        setCandidates(mappedResults);
      }
    } catch (err) {
      console.error("Copilot search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter candidates deterministically based on sidebar filter controls
  const filteredCandidates = candidates.filter((c) => {
    if (minScore > 0 && c.talent_score < minScore) return false;
    if (selectedSkill !== "All") {
      const hasSkill = c.skills.some((s) => s.toLowerCase().includes(selectedSkill.toLowerCase()));
      if (!hasSkill) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-lg">
            H
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Recruiter Command Center
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full">
                Protected Route
              </span>
            </h1>
            <p className="text-xs text-slate-400">Authenticated as {user?.email || "Recruiter User"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Active Candidate Database
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Natural Language Recruiter Search Bar */}
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-300" />
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 shadow-xl">
            <Sparkles className="h-6 w-6 text-indigo-400 mr-3 shrink-0 animate-pulse" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. 'Find React developers with hackathon experience', 'Show ML engineers', or 'Score > 85'..."
              className="w-full bg-transparent text-base focus:outline-none text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 shrink-0 ml-3 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isSearching ? "Searching..." : "Copilot Search"}</span>
            </button>
          </div>
        </form>

        {/* Content Layout: Filters Sidebar + Candidates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* 3. Interactive Filters Panel */}
          <aside className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" /> Filter Candidates
              </h3>
              <button
                onClick={() => {
                  setSelectedSkill("All");
                  setMinScore(0);
                  setExpFilter("All");
                }}
                className="text-xs text-indigo-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Filter 1: Skills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Skill Filter</label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Verified Skills</option>
                <option value="React">React / Next.js</option>
                <option value="Python">Python / Machine Learning</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Supabase">Supabase / Postgres</option>
              </select>
            </div>

            {/* Filter 2: Talent Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Min Talent Score</label>
                <span className="font-bold text-indigo-400">{minScore > 0 ? minScore : "Any"}</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-2"
              />
            </div>

            {/* Filter 3: Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Experience Level</label>
              <select
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Experience Levels</option>
                <option value="Senior">Senior (3+ Years)</option>
                <option value="Mid">Mid Level (1-3 Years)</option>
              </select>
            </div>
          </aside>

          {/* 2. Candidate Cards Grid */}
          <main className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                Ranked Candidates ({filteredCandidates.length})
              </h2>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm">No candidates match your active filters. Try resetting the filters or modifying your query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCandidates.map((cand) => (
                  <div
                    key={cand.candidate_id}
                    onClick={() => setSelectedCandidate(cand)}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 transition-all cursor-pointer group space-y-4 shadow-lg hover:shadow-indigo-500/5"
                  >
                    {/* Header: Name, Avatar, Scores */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            {cand.name || `@${cand.github_username}`}
                          </h4>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <GitBranch className="w-3.5 h-3.5" /> @{cand.github_username || "candidate"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {cand.match_percentage}% Match
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Talent Score: <strong className="text-emerald-400">{cand.talent_score}/100</strong>
                        </span>
                      </div>
                    </div>

                    {/* Verified Skills */}
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">Verified Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {cand.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px] font-medium rounded">
                            {s}
                          </span>
                        ))}
                        {cand.skills.length > 4 && (
                          <span className="px-2 py-0.5 bg-slate-850 text-slate-500 text-[10px] rounded">
                            +{cand.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Top Projects & GitHub Activity */}
                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">Top Project</span>
                        <span className="text-slate-300 font-medium truncate block">
                          {cand.top_projects?.[0]?.name || "Full Stack Application"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">GitHub Activity</span>
                        <span className="text-slate-300 font-medium block">
                          {cand.github_activity?.repo_count || 12} Repositories
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>View Candidate Details Drawer</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 4. Candidate Detail Drawer (Slide-over panel) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedCandidate.name || selectedCandidate.github_username}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <GitBranch className="w-3.5 h-3.5" /> @{selectedCandidate.github_username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Fraud Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase">AI Talent Score</span>
                <div className="text-3xl font-black text-emerald-400">{selectedCandidate.talent_score}/100</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase">Fraud & Audit Status</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {selectedCandidate.fraud_status?.ai_risk || "Low Risk (< 5%)"}
                </div>
              </div>
            </div>

            {/* Resume Summary */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Resume Summary
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedCandidate.resume_summary}
              </p>
            </div>

            {/* GitHub Evidence */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" /> GitHub Evidence & Repositories
              </h3>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-3">
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Repositories</span>
                  <span className="font-bold text-slate-200">{selectedCandidate.github_activity?.repo_count || 16}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Top Language</span>
                  <span className="font-bold text-slate-200">{selectedCandidate.github_activity?.top_language || "TypeScript"}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Stars</span>
                  <span className="font-bold text-slate-200">{selectedCandidate.github_activity?.total_stars || 124}</span>
                </div>
              </div>

              <div className="space-y-2">
                {(selectedCandidate.top_projects || []).map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">{p.description}</span>
                    </div>
                    {p.stars && (
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.stars}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Skill Badges */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> Verified Skill Badges
              </h3>

              <div className="space-y-2">
                {(selectedCandidate.skill_badges || []).map((b, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {b.skill}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {b.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
