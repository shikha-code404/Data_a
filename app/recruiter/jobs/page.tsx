"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Plus,
  Users,
  Search,
  ArrowUpDown,
  TrendingDown,
  AlertCircle,
  Wand2,
  ExternalLink,
  X,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import { testCreateJobFlowAction } from "../../internal/actions";

interface JobItem {
  id: string;
  req_id: string;
  title: string;
  company: string;
  status: "Active" | "Urgent" | "Draft" | "On Hold";
  candidatesCount: number;
  interviewingCount: number;
  pipelineWidths: {
    applied: number;
    screening: number;
    interviewing: number;
    offered: number;
  };
  hiringTeamName: string;
  hiringTeamInitials: string;
  hiringTeamAvatar?: string;
  postedDate: string;
  aiMatchRating: "High" | "Fair" | "N/A";
  aiMatchPercentage?: number;
  description: string;
  skills: string[];
  location: string;
}

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "templates" | "archived">("all");

  // Form Modal Toggles
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");

  // Matching results modal / panel
  const [selectedJobMatches, setSelectedJobMatches] = useState<any[] | null>(null);
  const [activeJobTitle, setActiveJobTitle] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        const mapped: JobItem[] = data.jobs.map((j: any) => ({
          id: j.id,
          req_id: `REQ-2026-${j.id.slice(0, 3).toUpperCase()}`,
          title: j.title || "Untitled Position",
          company: j.company || "Partner Company",
          status: "Active",
          candidatesCount: 5,
          interviewingCount: 1,
          pipelineWidths: { applied: 40, screening: 25, interviewing: 15, offered: 20 },
          hiringTeamName: "Sarah Miller",
          hiringTeamInitials: "SM",
          postedDate: "Just now",
          aiMatchRating: "High",
          aiMatchPercentage: 85,
          description: j.description || "",
          skills: j.skills_required || [],
          location: j.location || "Remote"
        }));
        setJobs(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsPosting(true);
    try {
      const res = await testCreateJobFlowAction(
        title,
        description,
        skills,
        location || "Remote"
      );

      if (res.success && res.job) {
        await fetchJobs();
        setIsPostModalOpen(false);

        // Pop up the matching results automatically
        if (Array.isArray(res.matchedCandidates)) {
          setSelectedJobMatches(res.matchedCandidates);
          setActiveJobTitle(res.job.title);
        }

        // Clear Form
        setTitle("");
        setDescription("");
        setSkills("");
        setLocation("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  // Filter Jobs list
  const filteredJobs = jobs.filter((j) => {
    if (activeTab === "templates") return false; // Mock template placeholder
    if (activeTab === "archived") return false; // Mock archived placeholder

    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.req_id.toLowerCase().includes(q) ||
        j.hiringTeamName.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 bg-[#131313] text-[#F5F5F5] relative">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Jobs Dashboard</h1>
          <p className="text-xs text-[#A3A3A3] flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-[#64de87] animate-pulse"></span>
            <span>{jobs.filter(j => j.status !== "Draft").length} Active Openings</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#1c1c1e] p-1 rounded-xl border border-[#353534] text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "all" ? "bg-[#2d2d30] text-white" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "templates" ? "bg-[#2d2d30] text-white" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "archived" ? "bg-[#2d2d30] text-white" : "text-[#A3A3A3] hover:text-white"
              }`}
            >
              Archived
            </button>
          </div>
          
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-[#D2042D]/15"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-[#1c1c1e] border border-[#353534] p-5 rounded-2xl flex flex-col justify-between h-[120px] shadow-lg">
          <span className="text-[10px] font-bold text-[#A3A3A3] tracking-wider uppercase">Avg. Time to Fill</span>
          <div className="flex items-end gap-1 font-mono mt-2">
            <span className="text-3xl font-extrabold text-white leading-none">18</span>
            <span className="text-[10px] text-[#A3A3A3] pb-1 font-bold">days</span>
          </div>
          <span className="text-[#64de87] text-[9px] font-bold flex items-center gap-1 mt-2">
            <TrendingDown className="w-3.5 h-3.5" /> -2.4% from last month
          </span>
        </div>

        <div className="bg-[#1c1c1e] border border-[#353534] p-5 rounded-2xl flex flex-col justify-between h-[120px] shadow-lg">
          <span className="text-[10px] font-bold text-[#A3A3A3] tracking-wider uppercase">Total Candidates</span>
          <div className="flex items-end mt-2 font-mono">
            <span className="text-3xl font-extrabold text-white leading-none">842</span>
          </div>
          <span className="text-[#ecc154] text-[9px] font-bold flex items-center gap-1 mt-2">
            <Users className="w-3.5 h-3.5" /> 124 in final stages
          </span>
        </div>

        <div className="bg-[#1c1c1e] border border-[#353534] p-5 rounded-2xl flex flex-col justify-between h-[120px] shadow-lg">
          <span className="text-[10px] font-bold text-[#A3A3A3] tracking-wider uppercase">AI Match Quality</span>
          <div className="flex items-end gap-1 mt-2 font-mono">
            <span className="text-3xl font-extrabold text-[#64de87] leading-none">92</span>
            <span className="text-sm text-[#A3A3A3] pb-1">%</span>
          </div>
          <span className="text-[#A3A3A3] text-[9px] mt-2">
            Across all active pipelines
          </span>
        </div>

        <div className="bg-[#1c1c1e] border border-[#D2042D]/20 bg-[#D2042D]/5 p-5 rounded-2xl flex flex-col justify-between h-[120px] shadow-lg">
          <span className="text-[10px] font-bold text-[#D2042D] tracking-wider uppercase">Urgent Roles</span>
          <div className="flex items-end mt-2 font-mono">
            <span className="text-3xl font-extrabold text-[#D2042D] leading-none">03</span>
          </div>
          <span className="text-[#D2042D] text-[9px] font-bold flex items-center gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5 animate-bounce" /> High priority status
          </span>
        </div>
      </section>

      {/* Main Jobs Table Container */}
      <section className="bg-[#1c1c1e] rounded-2xl border border-[#353534] overflow-hidden shadow-lg">
        {/* Table Controls */}
        <div className="px-6 py-4 border-b border-[#353534]/60 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#131313]/20">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by title or team..."
                className="bg-[#131313] border border-[#353534] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F5F5F5] w-full focus:outline-none focus:border-[#D2042D]"
              />
            </div>
            <button className="flex items-center gap-1 text-[#A3A3A3] hover:text-white text-xs font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
          </div>
          <div className="text-[#A3A3A3] text-xs font-mono">
            Viewing 1-{filteredJobs.length} of {filteredJobs.length}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#131313]/40 border-b border-[#353534]">
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">Job Title & ID</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">Pipeline</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">Hiring Team</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">Posted</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider">AI Match</th>
                <th className="px-6 py-4 font-bold text-[#A3A3A3] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353534]/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#A3A3A3]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D2042D] mb-2" />
                    <span>Loading jobs...</span>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#A3A3A3]">
                    <span>No job postings found. Click "Post New Job" to create one.</span>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#2d2d30]/20 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-[#D2042D] transition-colors cursor-pointer text-sm">
                        {job.title}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3] mt-1 font-mono">{job.req_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                      job.status === "Active" 
                        ? "bg-[#64de87]/10 text-[#64de87] border-[#64de87]/20"
                        : job.status === "Urgent"
                        ? "bg-[#D2042D]/10 text-[#D2042D] border-[#D2042D]/20 animate-pulse"
                        : job.status === "Draft"
                        ? "bg-[#353534] text-[#A3A3A3] border-[#353534]/50"
                        : "bg-[#ecc154]/10 text-[#ecc154] border-[#ecc154]/20"
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-48 space-y-1.5">
                      <div className="flex justify-between text-[9px] text-[#A3A3A3] font-mono">
                        <span>{job.candidatesCount} Candidates</span>
                        {job.interviewingCount > 0 && <span>{job.interviewingCount} Intvw</span>}
                      </div>
                      <div className="flex w-full h-1.5 overflow-hidden bg-[#131313] rounded-full">
                        {job.pipelineWidths.applied > 0 && (
                          <div className="bg-[#ecc154] h-full" style={{ width: `${job.pipelineWidths.applied}%` }} />
                        )}
                        {job.pipelineWidths.screening > 0 && (
                          <div className="bg-[#64de87] h-full" style={{ width: `${job.pipelineWidths.screening}%` }} />
                        )}
                        {job.pipelineWidths.interviewing > 0 && (
                          <div className="bg-[#D2042D] h-full" style={{ width: `${job.pipelineWidths.interviewing}%` }} />
                        )}
                        {job.pipelineWidths.offered > 0 && (
                          <div className="bg-[#353534] h-full" style={{ width: `${job.pipelineWidths.offered}%` }} />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      {job.hiringTeamAvatar ? (
                        <img src={job.hiringTeamAvatar} alt={job.hiringTeamName} className="w-6 h-6 rounded-full object-cover border border-[#353534]" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#353534] flex items-center justify-center text-[9px] font-extrabold text-[#A3A3A3]">
                          {job.hiringTeamInitials}
                        </div>
                      )}
                      <span className="font-semibold text-white">{job.hiringTeamName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[#A3A3A3] font-mono">{job.postedDate}</td>
                  <td className="px-6 py-5">
                    {job.aiMatchRating !== "N/A" ? (
                      <div className="flex items-center gap-1 font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          job.aiMatchRating === "High" ? "bg-[#64de87]" : "bg-[#ecc154]"
                        }`} />
                        <span className={job.aiMatchRating === "High" ? "text-[#64de87]" : "text-[#ecc154]"}>
                          {job.aiMatchRating} ({job.aiMatchPercentage}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#A3A3A3] font-mono">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button className="p-1 text-[#A3A3A3] hover:text-[#D2042D] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-[#A3A3A3] hover:text-[#D2042D] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-[#A3A3A3] hover:text-[#D2042D] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 border-t border-[#353534]/50 flex justify-between items-center bg-[#131313]/10 text-xs">
          <div className="flex items-center gap-1.5 text-[#A3A3A3]">
            <span>Rows per page:</span>
            <span className="text-white font-bold font-mono">12</span>
          </div>
          <div className="flex items-center gap-3 text-[#A3A3A3] font-mono">
            <span>1-12 of 12</span>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1c1c1e] border border-[#353534] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-[#64de87]/10 flex items-center justify-center shrink-0">
            <Wand2 className="w-6 h-6 text-[#64de87]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-none">AI Recommendation</h4>
            <p className="text-[11px] text-[#A3A3A3] mt-1.5 leading-relaxed">
              The <span className="text-[#ecc154] font-semibold">VP of Engineering</span> pipeline has 3 high-probability matches that haven't been reviewed in 48h.
            </p>
          </div>
          <button className="ml-auto text-[#D2042D] font-bold text-xs underline whitespace-nowrap shrink-0 hover:text-white transition-colors">
            Review Now
          </button>
        </div>

        <div className="bg-[#1c1c1e] border border-[#353534] p-5 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-[#ecc154]/10 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-[#ecc154]" />
          </div>
          <div className="flex-grow">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-none">Source Performance</h4>
            <p className="text-[11px] text-[#A3A3A3] mt-1.5 leading-relaxed truncate max-w-sm">
              LinkedIn remains your top-performing channel with a <span className="text-[#64de87] font-semibold">12% higher</span> offer acceptance rate.
            </p>
          </div>
          <button className="ml-auto p-1.5 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-[#2d2d30] shrink-0 border border-[#353534] transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Post New Job Overlay Dialog Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-[#353534] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#353534] flex justify-between items-center bg-[#131313]/30">
              <div>
                <span className="text-[9px] font-bold text-[#D2042D] uppercase tracking-wider block">Hiring Listings</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Post New Job Opening</h3>
              </div>
              <button 
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 hover:bg-[#353534] rounded-lg border border-[#353534] text-[#A3A3A3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Job Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Cloud Architect"
                  className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D2042D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Location / Work Mode</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / London, UK"
                  className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D2042D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Skills Required (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Go, Kubernetes, Redis, AWS"
                  className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D2042D]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail role technical parameters and expectations..."
                  className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D2042D] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 border border-[#353534] bg-[#131313] hover:bg-[#2d2d30] text-white rounded-lg text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Embedding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Create & Match</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Results Modal */}
      {selectedJobMatches && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] border border-[#353534] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#353534] flex justify-between items-center bg-[#131313]/30">
              <div>
                <span className="text-[9px] font-bold text-[#D2042D] uppercase tracking-wider">AI Matching Results</span>
                <h3 className="text-sm font-bold text-white mt-0.5">Matched Candidates: {activeJobTitle}</h3>
              </div>
              <button 
                onClick={() => setSelectedJobMatches(null)}
                className="p-1.5 hover:bg-[#353534] rounded-lg border border-[#353534] text-[#A3A3A3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedJobMatches.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#A3A3A3]">
                  No candidate matches found in registry yet.
                </div>
              ) : (
                selectedJobMatches.map((cand, idx) => (
                  <div key={idx} className="bg-[#131313] border border-[#353534] rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center font-bold text-xs text-white font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Candidate ID: {cand.candidate_id?.slice(0, 8)}...</h4>
                        <p className="text-[10px] text-[#A3A3A3] mt-1 font-mono">Cosine Similarity: <strong className="text-[#65de85]">{Math.round((cand.similarity_score || 0.8) * 100)}% Match</strong></p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#D2042D] bg-[#D2042D]/10 px-2 py-0.5 rounded border border-[#d2032c]/20 font-mono">
                      Score: {cand.talent_score || 80}/100
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#353534] bg-[#131313]/30 text-right">
              <button
                onClick={() => setSelectedJobMatches(null)}
                className="px-4 py-2 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-[#D2042D]/15"
              >
                Close Matches
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
