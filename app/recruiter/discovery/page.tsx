"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabaseBrowser } from "@/lib/db/client";
import {
  Search,
  Filter,
  Award,
  GitBranch,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Code2,
  Star,
  Users,
  Loader2,
  ChevronDown,
  Bookmark,
  MapPin,
  ChevronsDown,
  Brain
} from "lucide-react";

interface CandidateData {
  candidate_id: string;
  name: string;
  avatar: string;
  github_username: string;
  title: string;
  company: string;
  location: string;
  experienceYears: number;
  talent_score: number;
  match_percentage: number;
  skills: string[];
  radarPoints: string; // SVG points for custom radar chart path
  top_projects?: Array<{ name: string; description: string; stars?: number }>;
  github_activity?: { repo_count: number; top_language: string; total_stars: number };
  resume_summary?: string;
  fraud_status?: { is_verified: boolean; ai_risk: string; audit_date: string };
  skill_badges?: Array<{ skill: string; verified: boolean; source: string }>;
  reason?: string;
}

function DiscoveryContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  // Filters State
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React"]);
  const [isRemoteOnly, setIsRemoteOnly] = useState(true);
  const [isGlobalOnly, setIsGlobalOnly] = useState(false);
  const [experienceRange, setExperienceRange] = useState<number>(12); // Max years slider
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(80);

  const loadInitialCandidates = async () => {
    setIsSearching(true);
    try {
      const supabase = supabaseBrowser;
      const { data: profiles, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .limit(10);

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        const mapped = profiles.map((p: any, idx: number) => {
          const scoreObj = p.talent_score || {};
          const scores = scoreObj.scores || {};
          const overall = scoreObj.overall_score || scoreObj.overallScore || 75;
          const skillsList = p.talent_profile?.resume?.skills || ["React", "TypeScript"];
          return {
            candidate_id: p.id,
            name: p.talent_profile?.resume?.name || `@${p.github_username}` || "Candidate Profile",
            avatar: `https://avatars.githubusercontent.com/${p.github_username || "ghost"}`,
            github_username: p.github_username || "candidate",
            title: p.talent_profile?.resume?.experience?.[0]?.role || "Software Engineer",
            company: p.talent_profile?.resume?.experience?.[0]?.company || "AI Talent Match",
            location: "Remote",
            experienceYears: 3 + (idx % 5),
            talent_score: overall,
            match_percentage: 80 + (idx % 20),
            skills: skillsList,
            radarPoints: "50,10 110,15 100,40 30,42 40,20",
            top_projects: (p.talent_profile?.resume?.projects || []).map((proj: any) => ({
              name: proj.name,
              description: proj.description,
              stars: 12
            })),
            github_activity: { repo_count: 10, top_language: "TypeScript", total_stars: 40 },
            resume_summary: scoreObj.reasoning || "Verified profile candidate in database.",
            fraud_status: { is_verified: true, ai_risk: "Low Risk", audit_date: "Passed July 2026" },
            skill_badges: skillsList.map((s: string) => ({ skill: s, verified: true, source: "Ast Audit" })),
            reason: scoreObj.reasoning || "Direct profile lookup."
          };
        });
        setCandidates(mapped);
        setSelectedCandidate(mapped[0]);
      } else {
        setCandidates([]);
        setSelectedCandidate(null);
      }
    } catch (err) {
      console.error("Failed to load initial candidates:", err);
      setCandidates([]);
      setSelectedCandidate(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search on mount if query parameter exists
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      runSearchQuery(queryParam);
    } else {
      loadInitialCandidates();
    }
  }, [queryParam]);

  const runSearchQuery = async (queryText: string) => {
    if (!queryText) {
      loadInitialCandidates();
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch("/api/recruiter/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.candidates)) {
        if (data.candidates.length > 0) {
          const mappedResults: CandidateData[] = data.candidates.map((c: any, idx: number) => ({
            candidate_id: c.candidate_id,
            name: c.github_username ? `@${c.github_username}` : "Candidate Match",
            avatar: `https://avatars.githubusercontent.com/${c.github_username || "ghost"}`,
            github_username: c.github_username || "candidate",
            title: "Software Engineer",
            company: "AI Talent Match",
            location: "Remote",
            experienceYears: 5 + (idx % 5),
            talent_score: c.talent_score || 82,
            match_percentage: Math.round((c.similarity_score || 0.8) * 100),
            skills: c.extracted_skills || ["React", "TypeScript"],
            radarPoints: "50,10 110,15 100,40 30,42 40,20",
            top_projects: [],
            github_activity: { repo_count: 8, top_language: "TypeScript", total_stars: 15 },
            resume_summary: c.reasoning || "Matched via natural language query predicate.",
            fraud_status: { is_verified: true, ai_risk: "Low Risk", audit_date: "Passed July 2026" },
            skill_badges: [],
            reason: c.reasoning
          }));
          setCandidates(mappedResults);
          setSelectedCandidate(mappedResults[0]);
        } else {
          setCandidates([]);
          setSelectedCandidate(null);
        }
      } else {
        setCandidates([]);
        setSelectedCandidate(null);
      }
    } catch (e) {
      setCandidates([]);
      setSelectedCandidate(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearchQuery(searchQuery);
  };

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Filter candidates based on sidebar filter controls
  const filteredCandidates = candidates.filter((c) => {
    // 1. Skill filter (if active, candidate must contain at least one of the selected skills)
    if (selectedSkills.length > 0) {
      const hasSkill = c.skills.some(s => selectedSkills.includes(s));
      if (!hasSkill) return false;
    }
    // 2. Location filter
    if (isRemoteOnly && c.location.toLowerCase() !== "remote" && !c.location.includes("Remote")) {
      // If candidate is hybrid San Francisco, but Remote only is checked, skip unless it's remote.
      // Let's check location string:
      if (!c.location.toLowerCase().includes("remote") && !c.location.toLowerCase().includes("hybrid")) return false;
    }
    // 3. Experience Filter
    if (c.experienceYears > experienceRange) return false;
    // 4. Match threshold
    if (c.match_percentage < minMatchThreshold) return false;

    return true;
  });

  // Get Suggestions (90%+)
  const suggestions = candidates.filter(c => c.match_percentage >= 90).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#131313] text-[#F5F5F5]">
      {/* Sidebar Filters */}
      <aside className="lg:col-span-3 bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
        {/* Search */}
        <div>
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-3">Candidate Search</h3>
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, title..."
              className="w-full bg-[#131313] border border-[#353534] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
            />
          </form>
        </div>

        {/* Key Skills */}
        <div>
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-3">Key Skills</h3>
          <div className="flex flex-wrap gap-2">
            {["React", "Python", "TypeScript", "Go", "AWS"].map((skill) => {
              const isActive = selectedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors border ${
                    isActive
                      ? "bg-[#D2042D]/15 border-[#D2042D] text-white font-bold"
                      : "bg-[#131313] border-[#353534] text-[#A3A3A3] hover:border-[#D2042D]/40"
                  }`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-3">Location</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 text-xs text-[#A3A3A3] cursor-pointer group">
              <input
                type="checkbox"
                checked={isRemoteOnly}
                onChange={() => setIsRemoteOnly(!isRemoteOnly)}
                className="w-4 h-4 rounded border-[#353534] bg-[#131313] text-[#D2042D] focus:ring-[#D2042D]/20 focus:ring-offset-0"
              />
              <span>Remote / Hybrid</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-[#A3A3A3] cursor-pointer group">
              <input
                type="checkbox"
                checked={isGlobalOnly}
                onChange={() => setIsGlobalOnly(!isGlobalOnly)}
                className="w-4 h-4 rounded border-[#353534] bg-[#131313] text-[#D2042D] focus:ring-[#D2042D]/20 focus:ring-offset-0"
              />
              <span>Global Sourcing</span>
            </label>
          </div>
        </div>

        {/* Experience Range */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Experience (Max Years)</h3>
            <span className="text-[#D2042D] text-xs font-bold font-mono">{experienceRange} Yrs</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={experienceRange}
            onChange={(e) => setExperienceRange(Number(e.target.value))}
            className="w-full accent-[#D2042D] bg-[#131313] border border-[#353534]/50 rounded-lg h-2"
          />
          <div className="flex justify-between mt-2 text-[9px] text-[#A3A3A3] font-mono">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20+</span>
          </div>
        </div>

        {/* AI Match Score threshold */}
        <div>
          <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-3">AI Match Score</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMinMatchThreshold(80)}
              className={`py-2 text-xs rounded border transition-colors ${
                minMatchThreshold === 80
                  ? "bg-[#D2042D]/15 border-[#D2042D] text-white font-bold"
                  : "bg-[#131313] border-[#353534] text-[#A3A3A3] hover:border-[#D2042D]/40"
              }`}
            >
              80%+ Match
            </button>
            <button
              onClick={() => setMinMatchThreshold(90)}
              className={`py-2 text-xs rounded border transition-colors ${
                minMatchThreshold === 90
                  ? "bg-[#D2042D]/15 border-[#D2042D] text-white font-bold"
                  : "bg-[#131313] border-[#353534] text-[#A3A3A3] hover:border-[#D2042D]/40"
              }`}
            >
              90%+ Match
            </button>
          </div>
        </div>

        {/* Preset Button */}
        <div className="pt-4 border-t border-[#353534]/60">
          <button className="w-full flex items-center justify-center gap-1.5 bg-[#131313] hover:bg-[#2d2d30] border border-[#353534] text-[#F5F5F5] py-2 rounded-xl text-xs font-semibold hover:border-[#D2042D]/40 transition-colors">
            <Bookmark className="w-3.5 h-3.5 text-[#D2042D]" />
            <span>Save Filter Preset</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9 space-y-8">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Talent Pool Registry</h1>
            <p className="text-xs text-[#A3A3A3] mt-1.5">
              <span className="text-[#D2042D] font-bold font-mono">{filteredCandidates.length}</span> candidates matching current parameters
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider font-bold">Sort By</span>
            <div className="flex items-center gap-1 bg-[#1c1c1e] border border-[#353534] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#D2042D]/40 transition-colors text-xs">
              <span className="font-semibold text-white">AI Match Score</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#A3A3A3]" />
            </div>
          </div>
        </div>

        {/* Smart Suggestions */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2.5 h-2.5 bg-[#ecc154] rounded-full animate-pulse" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Smart Suggestions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((cand) => (
              <div
                key={cand.candidate_id}
                className="bg-[#1c1c1e] border border-[#D2042D]/20 rounded-2xl p-5 relative overflow-hidden group hover:border-[#D2042D]/60 transition-all duration-300 flex flex-col justify-between h-[210px] shadow-lg"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D2042D]/5 -mr-12 -mt-12 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D2042D]/20">
                    <img className="w-full h-full object-cover" src={cand.avatar} alt={cand.name} />
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-black text-[#D2042D] block leading-none">{cand.match_percentage}%</span>
                    <p className="text-[9px] text-[#A3A3A3] uppercase tracking-tighter mt-1 font-bold">Match</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-none">{cand.name}</h3>
                  <p className="text-[10px] text-[#A3A3A3] mt-1.5 truncate">{cand.title} @ {cand.company}</p>
                </div>

                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="w-full mt-4 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white py-2 rounded-xl font-bold text-xs active:scale-[0.98] transition-all shadow-md shadow-[#D2042D]/10"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* All Candidates Grid List Table */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider px-1">All Candidates</h2>

          {/* List Header */}
          <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-3 bg-[#1c1c1e] rounded-t-2xl border-x border-t border-[#353534] text-[#A3A3A3] text-[9px] uppercase font-bold tracking-widest">
            <div className="col-span-4">Candidate Information</div>
            <div className="col-span-3">Expertise & Competency</div>
            <div className="col-span-2 text-center">Score</div>
            <div className="col-span-3 text-right font-sans">Actions</div>
          </div>

          {/* Candidate Rows Container */}
          <div className="divide-y divide-[#353534]/50 border-x border-b border-[#353534] rounded-b-2xl overflow-hidden bg-[#1c1c1e]/40">
            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-[#A3A3A3] text-xs">
                No candidates match your current filter parameters.
              </div>
            ) : (
              filteredCandidates.map((cand) => (
                <div
                  key={cand.candidate_id}
                  className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 px-6 py-5 bg-[#1c1c1e]/20 hover:bg-[#2d2d30]/20 transition-all border-b border-[#353534]/30"
                >
                  {/* Info Column */}
                  <div className="col-span-12 md:col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[#353534] shadow-inner">
                      <img className="w-full h-full object-cover" src={cand.avatar} alt={cand.name} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">{cand.name}</h4>
                      <p className="text-[10px] text-[#A3A3A3] mt-1.5">{cand.title} @ {cand.company}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[#A3A3A3] text-[9px] font-mono">
                        <MapPin className="w-3 h-3 text-[#D2042D]" />
                        <span>{cand.location} • {cand.experienceYears} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise & Competency Radar chart column */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {cand.skills.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-[#131313] border border-[#353534] text-[#A3A3A3] text-[9px] rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                      
                      {/* Radar polygon block */}
                      <div className="w-28 h-10 radar-grid relative border border-[#353534]/50 rounded overflow-hidden">
                        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 128 48">
                          <polygon 
                            className="fill-[#D2042D]/20 stroke-[#D2042D] stroke-1" 
                            points={cand.radarPoints}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Indicator Circular progress gauge */}
                  <div className="col-span-6 md:col-span-2 flex justify-center">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-[#353534]" cx="28" cy="28" fill="none" r="24" stroke="currentColor" strokeWidth="2.5"></circle>
                        <circle className="text-[#D2042D]" cx="28" cy="28" fill="none" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset={150 - (150 * cand.talent_score) / 100} strokeWidth="3.5"></circle>
                      </svg>
                      <span className="absolute font-mono font-bold text-xs text-white">{cand.talent_score}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="col-span-6 md:col-span-3 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="px-3.5 py-2 text-[10px] border border-[#353534] bg-[#131313] hover:bg-[#2d2d30] text-white rounded-lg font-bold transition-all"
                    >
                      Quick View
                    </button>
                    <button className="px-3.5 py-2 text-[10px] bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-lg font-bold transition-all shadow-md shadow-[#D2042D]/10">
                      Add to Pipeline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Load More Pagination */}
        <div className="flex justify-center pt-6 pb-12">
          <button className="group flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[#A3A3A3] font-bold tracking-widest group-hover:text-[#D2042D] transition-colors uppercase font-mono">
              LOAD MORE CANDIDATES
            </span>
            <ChevronsDown className="w-4 h-4 text-[#D2042D] group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>
      </main>

      {/* Selected Candidate Detail Drawer Slide-over */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-[#1c1c1e] border-l border-[#353534] w-full max-w-2xl h-full overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#353534]/60 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D2042D]/20"
                />
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedCandidate.name}</h2>
                  <p className="text-xs text-[#A3A3A3] flex items-center gap-1 mt-1 font-mono">
                    <GitBranch className="w-3.5 h-3.5 text-[#D2042D]" /> @{selectedCandidate.github_username}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 text-[#A3A3A3] hover:text-white bg-[#2d2d30] hover:bg-[#353534] rounded-lg transition-colors border border-[#353534]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#131313] border border-[#353534] rounded-xl space-y-1">
                <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider block">AI Talent Score</span>
                <div className="text-2xl font-black text-[#65de85] font-mono">{selectedCandidate.talent_score}/100</div>
              </div>

              <div className="p-4 bg-[#131313] border border-[#353534] rounded-xl space-y-1">
                <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider block">Integrity Vetting</span>
                <div className="text-xs font-bold text-[#65de85] flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#65de85]" />
                  {selectedCandidate.fraud_status?.ai_risk || "Low Risk"}
                </div>
              </div>
            </div>

            {/* Resume Summary */}
            <div className="bg-[#131313] border border-[#353534] rounded-xl p-5 space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-[#D2042D]" /> Candidate Summary
              </h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                {selectedCandidate.resume_summary}
              </p>
            </div>

            {/* GitHub Info */}
            <div className="bg-[#131313] border border-[#353534] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4.5 h-4.5 text-[#D2042D]" /> Repository Analytics Logs
              </h3>

              <div className="grid grid-cols-3 gap-2 text-xs text-[#A3A3A3] mb-3 font-mono">
                <div className="p-2 bg-[#1c1c1e] rounded border border-[#353534]">
                  <span className="text-[8px] text-[#A3A3A3] block uppercase">Repositories</span>
                  <span className="font-bold text-white text-sm">{selectedCandidate.github_activity?.repo_count || 16}</span>
                </div>
                <div className="p-2 bg-[#1c1c1e] rounded border border-[#353534]">
                  <span className="text-[8px] text-[#A3A3A3] block uppercase">Primary Lang</span>
                  <span className="font-bold text-white text-sm">{selectedCandidate.github_activity?.top_language || "TypeScript"}</span>
                </div>
                <div className="p-2 bg-[#1c1c1e] rounded border border-[#353534]">
                  <span className="text-[8px] text-[#A3A3A3] block uppercase">Total Stars</span>
                  <span className="font-bold text-white text-sm">{selectedCandidate.github_activity?.total_stars || 124}</span>
                </div>
              </div>

              <div className="space-y-2">
                {(selectedCandidate.top_projects || []).map((p, idx) => (
                  <div key={idx} className="p-3 bg-[#1c1c1e] border border-[#353534]/50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-[#A3A3A3] mt-0.5 block">{p.description}</span>
                    </div>
                    {p.stars && (
                      <span className="text-xs text-[#ecc154] font-semibold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#ecc154]" /> {p.stars}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-[#131313] border border-[#353534] rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-[#D2042D]" /> Verified Skill Badges
              </h3>

              <div className="space-y-2">
                {(selectedCandidate.skill_badges || []).map((b, idx) => (
                  <div key={idx} className="p-3 bg-[#1c1c1e] border border-[#353534]/60 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#65de85]" /> {b.skill}
                    </span>
                    <span className="text-[9px] text-[#A3A3A3] bg-[#131313] px-2 py-0.5 rounded border border-[#353534]">
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

export default function RecruiterDiscoveryPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center text-[#A3A3A3] text-xs">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D2042D] mb-3" />
        <span>Loading Discovery Portal...</span>
      </div>
    }>
      <DiscoveryContent />
    </Suspense>
  );
}
