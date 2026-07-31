"use client";

import React, { useState } from "react";
import { Briefcase, Bookmark, CheckCircle2, ArrowRight } from "lucide-react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  type: string;
  description: string;
  matchedSkills: string[];
  skillGaps: string[];
}

const mockJobs: JobMatch[] = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    company: "TechFlow Systems",
    location: "Remote",
    salary: "$140,000 - $175,000",
    matchScore: 94,
    type: "Full-time",
    description: "You have strong alignment with their React and Node.js architecture requirements. Your experience with scalable cloud deployments directly matches their core infrastructure goals for Q3.",
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    skillGaps: ["AWS Lambda"],
  },
  {
    id: "2",
    title: "Frontend Architect",
    company: "Nexus Data Labs",
    location: "Seattle, WA (Hybrid)",
    salary: "$150,000 - $185,000",
    matchScore: 78,
    type: "Full-time",
    description: "Your UI component library experience is a solid fit. However, they prioritize extensive experience with WebGL and complex data visualization which appears limited in your recent projects.",
    matchedSkills: ["React", "TypeScript", "Tailwind CSS"],
    skillGaps: ["WebGL", "Three.js", "D3.js"],
  },
  {
    id: "3",
    title: "Backend Systems Engineer",
    company: "FinCore Solutions",
    location: "New York, NY (On-site)",
    salary: "$130,000 - $160,000",
    matchScore: 35,
    type: "Full-time",
    description: "Your profile indicates a frontend/full-stack leaning, whereas this role demands deep expertise in low-latency systems programming and financial compliance frameworks.",
    matchedSkills: [],
    skillGaps: ["C++", "Rust", "Kafka", "FIX Protocol"],
  },
];

export default function JobsPage() {
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const handleApply = (id: string) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs([...appliedJobs, id]);
    }
  };

  const handleSave = (id: string) => {
    if (savedJobs.includes(id)) {
      setSavedJobs(savedJobs.filter(jId => jId !== id));
    } else {
      setSavedJobs([...savedJobs, id]);
    }
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] font-sans">
      {/* Page Header */}
      <header className="flex flex-col gap-2 border-b border-[#353534]/50 pb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-[#D2042D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F5]">Jobs Matched to You</h1>
        </div>
        <p className="text-sm text-[#A3A3A3] max-w-3xl">
          Ranked by compatibility with your talent profile.
        </p>
      </header>

      {/* Ranked List of Job Matches */}
      <div className="flex flex-col gap-6">
        {mockJobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          const isSaved = savedJobs.includes(job.id);
          
          const isHighMatch = job.matchScore >= 80;
          const strokeColor = isHighMatch ? "#D2042D" : "#A3A3A3";
          const scoreTextColor = isHighMatch ? "text-[#D2042D]" : "text-[#A3A3A3]";
          
          const circumference = 282.7;
          const strokeDashoffset = circumference - (circumference * job.matchScore) / 100;

          return (
            <article 
              key={job.id} 
              className="bg-[#262626] border border-[#353535] rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start transition-all hover:bg-[#2B2B2B]"
            >
              {/* Match Indicator (Visual Hierarchy Focus) */}
              <div className="flex-shrink-0 flex items-center gap-4 md:flex-col md:w-32 md:items-center md:justify-center border-b border-[#353535] md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-8">
                <div className="relative flex items-center justify-center w-16 h-16 md:w-24 md:h-24">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="transparent" r="45" stroke="#353535" strokeWidth="8"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      fill="transparent" 
                      r="45" 
                      stroke={strokeColor} 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round" 
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <span className={`absolute font-extrabold text-lg md:text-2xl ${scoreTextColor}`}>
                    {job.matchScore}<span className="text-xs md:text-sm font-semibold">%</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider text-center hidden md:block mt-1">Match</span>
              </div>

              {/* Job Details */}
              <div className="flex-grow flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#F5F5F5] mb-1">{job.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#A3A3A3]">
                    <span className="text-[#F5F5F5]">{job.company}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#353535]"></span>
                    <span>{job.location}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#353535]"></span>
                    <span>{job.salary}</span>
                  </div>
                </div>

                <p className="text-sm text-[#F5F5F5] leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  {/* Matching Skills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[#61dd98] mr-2">Matched Skills:</span>
                    {job.matchedSkills.length > 0 ? (
                      job.matchedSkills.map((skill) => (
                        <span key={skill} className="bg-[#2B2B2B] text-[#61dd98] text-[10px] font-bold px-2 py-0.5 rounded border border-[#353535]">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-[#A3A3A3]">No overlapping skills yet</span>
                    )}
                  </div>
                  
                  {/* Missing Skills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-[#A3A3A3] mr-2">Skill Gaps:</span>
                    {job.skillGaps.map((skill) => (
                      <span key={skill} className="bg-[#2B2B2B] text-[#B5B5B5] text-[10px] font-bold px-2 py-0.5 rounded border border-[#353535]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Actions */}
              <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-row md:flex-col justify-end md:justify-start gap-2.5">
                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={isApplied}
                  className={`font-bold text-xs px-4 py-2.5 rounded transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                    isApplied 
                      ? "bg-[#064e3b]/30 border border-[#059669]/50 text-[#34d399] cursor-default" 
                      : "bg-[#ecc154] hover:bg-[#ecc154]/90 text-[#131313]"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleSave(job.id)}
                  className={`border border-[#353535] text-[#F5F5F5] font-semibold text-xs px-4 py-2.5 rounded hover:bg-[#2B2B2B] transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] ${isSaved ? "bg-[#353535]" : "bg-transparent"}`}
                >
                  <span>{isSaved ? "Saved" : "Save"}</span>
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#F5F5F5]" : ""}`} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
