"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockTalentScore, mockJobs, mockRoadmapSteps } from "@/lib/mock-data";
import { JobCard } from "@/components/JobCard";
import { RadarScoreChart } from "@/components/RadarScoreChart";
import { getCandidateProfileData, uploadResume } from "./actions";
import { ResumeData } from "@/lib/resume/parser";
import {
  Sparkles,
  Award,
  Compass,
  CheckCircle2,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Info,
  FileText,
  UploadCloud,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function CandidateDashboard() {
  const router = useRouter();
  const [isLoadingState, setIsLoadingState] = useState(false);
  
  // Profile integrations state
  const [profileData, setProfileData] = useState<{
    githubUsername: string | null;
    isGitHubConnected: boolean;
    githubData: any | null;
    resumeData: ResumeData | null;
    resumeNeedsReview: boolean;
  } | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Load profile data on mount
  const loadProfile = async () => {
    const res = await getCandidateProfileData();
    if (res.success) {
      if (!res.talentProfile) {
        router.push("/candidate/onboarding");
        return;
      }
      setProfileData({
        githubUsername: res.githubUsername ?? null,
        isGitHubConnected: !!res.isGitHubConnected,
        githubData: res.githubData ?? null,
        resumeData: res.resumeData ?? null,
        resumeNeedsReview: res.resumeNeedsReview ?? false,
      });
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle PDF Resume Upload
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a valid PDF file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadResume(formData);
      if (res.success) {
        await loadProfile();
      } else {
        setUploadError(res.error || "Failed to process resume.");
      }
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Skill badges checklist (mock verified skills)
  const verifiedSkills = [
    "React (Expert)",
    "TypeScript (Expert)",
    "Next.js (Advanced)",
    "GraphQL (Intermediate)",
    "System Design (Intermediate)",
    "PostgreSQL (Intermediate)",
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header and Loading Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span>Welcome back, Elena</span>
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your profile was updated by AI Agent parsing 3 hours ago.
          </p>
        </div>

        {/* Loading State Toggle */}
        <button
          onClick={() => setIsLoadingState(!isLoadingState)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <span>Show Loading State:</span>
          {isLoadingState ? (
            <ToggleRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-zinc-400" />
          )}
        </button>
      </div>

      {isLoadingState ? (
        // ================= LOADING SKELETON STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Talent Score Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 animate-pulse-subtle">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-8 w-16 bg-zinc-250 dark:bg-zinc-800 rounded-full"></div>
              </div>
              <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-lg flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700"></div>
              </div>
            </div>

            {/* Verified Skills Skeleton */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 animate-pulse-subtle">
              <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Top Job Matches Skeleton */}
            <div className="space-y-4">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse-subtle"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 h-72 flex flex-col justify-between animate-pulse-subtle"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                        <div className="h-5 w-16 bg-zinc-250 dark:bg-zinc-800 rounded-full"></div>
                      </div>
                      <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
                      <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                      <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                      <div className="h-8 flex-1 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Roadmap Skeleton */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 animate-pulse-subtle">
              <div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-850 rounded"></div>
                      <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ================= LOADED VIEW STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Talent Score & Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Talent Score summary card */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-indigo-500" />
                    Talent Score Analytics
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Evaluated based on projects, skills, and community footprint.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400">
                    {mockTalentScore.overall}
                    <span className="text-xs text-zinc-400 font-medium">/100</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wide">
                    Top 2% Globally
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Radar chart component */}
                <div className="md:col-span-2 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-zinc-100 dark:border-zinc-900/60 p-2">
                  <RadarScoreChart data={mockTalentScore.subScores} />
                </div>

                {/* Score breakdown metrics list */}
                <div className="space-y-3.5 pl-2">
                  <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Key Strengths
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Problem Solving</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">95%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Coding Ability</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">92%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Technical Consistency</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">88%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Skill Badges chip list */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Verified Skill Credentials
              </h3>
              <div className="flex flex-wrap gap-2">
                {verifiedSkills.map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-semibold px-3 py-1 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-1 shadow-sm"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Developer Integrations / GitHub Connection */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                  <GitHubIcon className="h-4.5 w-4.5 text-zinc-900 dark:text-zinc-50" />
                  GitHub Integration
                </h3>
                {isLoadingData ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Checking connection status...</p>
                ) : profileData?.isGitHubConnected ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Connected as <span className="font-bold text-indigo-650 dark:text-indigo-400">@{profileData.githubUsername}</span>
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Sync your GitHub repositories to showcase coding activity and build dynamic portfolio scores.
                  </p>
                )}
              </div>
              
              {!isLoadingData && (
                profileData?.isGitHubConnected ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100/55 dark:border-emerald-900/30 text-xs font-semibold shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      window.location.href = "/api/auth/github";
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold transition-all shadow-sm shadow-zinc-900/10 hover:scale-[1.01]"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    Connect GitHub
                  </button>
                )
              )}
            </div>

            {/* Resume Vetting Section */}
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-zinc-900 dark:text-zinc-50" />
                    AI Resume Parsing & Extraction
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Upload your resume to automatically extract skills, projects, and work history.
                  </p>
                </div>
                {profileData?.resumeNeedsReview && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border border-amber-200 dark:border-amber-900/30 text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" />
                    Needs Review
                  </span>
                )}
              </div>

              {isUploading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
                  <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Extracting and running AI parsing...</p>
                  <p className="text-[10px] text-zinc-400">This may take a few seconds as the model reviews the text.</p>
                </div>
              ) : profileData?.resumeData ? (
                <div className="space-y-4 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900/60 p-4 rounded-xl">
                  <div className="flex justify-between items-center border-b border-zinc-155 dark:border-zinc-850 pb-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{profileData.resumeData.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {profileData.resumeData.email || "No email"} • {profileData.resumeData.phone || "No phone"}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors">
                      <UploadCloud className="w-3.5 h-3.5" />
                      Update PDF
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Latest Experience</p>
                      {profileData.resumeData.experience?.[0] ? (
                        <div>
                          <p className="font-bold text-zinc-750 dark:text-zinc-350">{profileData.resumeData.experience[0].role}</p>
                          <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                            {profileData.resumeData.experience[0].company} • {profileData.resumeData.experience[0].start_date} - {profileData.resumeData.experience[0].end_date || "Present"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-zinc-450 dark:text-zinc-550 italic">No experience found</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Latest Education</p>
                      {profileData.resumeData.education?.[0] ? (
                        <div>
                          <p className="font-bold text-zinc-750 dark:text-zinc-350">
                            {profileData.resumeData.education[0].degree} in {profileData.resumeData.education[0].field}
                          </p>
                          <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                            {profileData.resumeData.education[0].institution}
                          </p>
                        </div>
                      ) : (
                        <p className="text-zinc-450 dark:text-zinc-550 italic">No education found</p>
                      )}
                    </div>
                  </div>
                  
                  {profileData.resumeData.skills && profileData.resumeData.skills.length > 0 && (
                    <div className="space-y-1.5 border-t border-zinc-150 dark:border-zinc-850 pt-3">
                      <p className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Extracted Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.resumeData.skills.slice(0, 10).map((skill: string) => (
                          <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-350 rounded border border-zinc-200/50 dark:border-zinc-800/40">
                            {skill}
                          </span>
                        ))}
                        {profileData.resumeData.skills.length > 10 && (
                          <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold px-1 py-0.5">
                            +{profileData.resumeData.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-zinc-250 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-650 transition-colors p-6 rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-900/10">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <UploadCloud className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-750 dark:text-zinc-300">Click to Upload Resume (PDF)</span>
                    <span className="text-[10px] text-zinc-400">Standard PDF formats are processed securely</span>
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  {uploadError && (
                    <p className="mt-2 text-xs font-semibold text-red-650 dark:text-red-400">{uploadError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Top Job Matches */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                Top AI-Generated Job Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Roadmap / Next steps */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm h-full">
              <div className="mb-6">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-indigo-500" />
                  Your AI Career Roadmap
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  AI suggestions to boost match percentages and fill missing gaps.
                </p>
              </div>

              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-155 dark:before:bg-zinc-850">
                {mockRoadmapSteps.map((step) => (
                  <div key={step.id} className="relative flex gap-4 pl-8 group">
                    {/* Circle Node */}
                    <div className="absolute left-[3px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-indigo-650 flex items-center justify-center shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {step.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            step.status === "in_progress"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-zinc-400"
                          }`}
                        >
                          {step.status === "in_progress" ? "In Progress" : "Up Next"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-relaxed">
                        {step.description}
                      </p>
                      <div className="text-[10px] font-semibold text-zinc-400">
                        Est: {step.timeEstimate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informational callout card */}
              <div className="mt-8 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850 flex gap-2">
                <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-medium">
                  Completing roadmap steps updates your credentials and broadcasts improvements instantly to relevant recruiters.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
