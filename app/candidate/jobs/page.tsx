"use client";

import React, { useState } from "react";
import { Briefcase, Building2, MapPin, DollarSign, Sparkles, Filter, CheckCircle2 } from "lucide-react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  tags: string[];
  type: string;
}

const mockJobs: JobMatch[] = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    company: "TechSpark Inc.",
    location: "Remote / San Francisco, CA",
    salary: "$140,000 - $175,000",
    matchScore: 95,
    tags: ["React", "Next.js", "TypeScript", "Node.js", "Supabase"],
    type: "Full-time",
  },
  {
    id: "2",
    title: "Frontend Developer (Next.js)",
    company: "Nexus AI Lab",
    location: "Remote",
    salary: "$120,000 - $150,000",
    matchScore: 91,
    tags: ["Next.js", "TailwindCSS", "TypeScript", "GraphQL"],
    type: "Full-time",
  },
  {
    id: "3",
    title: "AI Integrations Engineer",
    company: "HyperScale Data",
    location: "Hybrid / New York, NY",
    salary: "$150,000 - $185,000",
    matchScore: 86,
    tags: ["Python", "TypeScript", "LLM APIs", "Vector DB"],
    type: "Full-time",
  },
];

export default function JobsPage() {
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const handleApply = (id: string) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs([...appliedJobs, id]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            AI-Matched Jobs
          </h1>
          <p className="text-slate-400 mt-1">
            Handpicked opportunities based on your Talent Score and verified tech stack.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors">
            <Filter className="w-4 h-4" /> Filter Matches
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {mockJobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          return (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/30 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-100">{job.title}</h3>
                    <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {job.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" /> {job.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-500" /> {job.salary}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplied}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                      isApplied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Applied
                      </>
                    ) : (
                      "One-Click Apply"
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-md text-slate-300 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
