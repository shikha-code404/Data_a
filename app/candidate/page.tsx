"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockTalentScore, mockJobs, mockRoadmapSteps } from "@/lib/mock-data";
import { RadarScoreChart } from "@/components/RadarScoreChart";
import { getCandidateProfileData, uploadResume } from "./actions";
import { ResumeData } from "@/lib/resume/parser";
import {
  Sparkles,
  Award,
  Compass,
  CheckCircle2,
  TrendingUp,
  Info,
  FileText,
  UploadCloud,
  RefreshCw,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowUpRight,
  AlertTriangle,
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
    githubData: unknown;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Skill badges checklist (mock verified skills removed as not used in new design)

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] font-sans">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#353534]/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F5] flex items-center gap-2">
            Welcome back, {profileData?.resumeData?.name?.split(" ")[0] || "Elena"}{" "}
            <Sparkles className="w-6 h-6 text-[#D2042D]" />
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1">Your profile was updated by AI Agent parsing 3 hours ago.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#262626] px-4 py-2 rounded-full border border-[#353535]">
          <span className="text-xs font-semibold text-[#A3A3A3]">Show Loading State:</span>
          <button 
            onClick={() => setIsLoadingState(!isLoadingState)}
            className={`w-10 h-6 rounded-full relative transition-colors duration-250 focus:outline-none ${isLoadingState ? "bg-[#D2042D]" : "bg-[#353535]"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-[#F5F5F5] rounded-full transition-transform duration-250 ${isLoadingState ? "left-5" : "left-1"}`}></span>
          </button>
        </div>
      </header>

      {isLoadingState ? (
        // ================= LOADING SKELETON STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Talent Score Analytics Card Skeleton */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col gap-6 animate-pulse-subtle">
              <div className="flex justify-between items-center">
                <div className="h-6 w-48 bg-[#353535] rounded"></div>
                <div className="h-10 w-24 bg-[#353535] rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#171717] rounded-lg p-6 border border-[#353535]">
                <div className="h-56 bg-[#262626] rounded-full w-56 mx-auto"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-[#262626] rounded w-1/3"></div>
                      <div className="h-2 bg-[#262626] rounded-full w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Resume Parsing Card Skeleton */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col gap-4 animate-pulse-subtle">
              <div className="h-5 bg-[#353535] rounded w-1/4"></div>
              <div className="h-3 bg-[#353535] rounded w-2/3"></div>
              <div className="h-32 bg-[#171717] rounded-lg border-2 border-dashed border-[#353535]"></div>
            </div>

            {/* Top Job Matches Skeleton */}
            <div className="space-y-4">
              <div className="h-6 bg-[#353535] rounded w-1/3 animate-pulse-subtle"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#262626] border border-[#353535] rounded-xl p-6 h-80 flex flex-col justify-between animate-pulse-subtle">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="h-5 bg-[#353535] rounded w-2/3"></div>
                        <div className="h-6 bg-[#353535] rounded-full w-12"></div>
                      </div>
                      <div className="h-4 bg-[#353535] rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-[#353535] rounded w-full"></div>
                        <div className="h-3 bg-[#353535] rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-[#353535] rounded-lg flex-1"></div>
                      <div className="h-10 bg-[#353535] rounded-lg flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1/3) */}
          <div className="lg:col-span-4 flex flex-col gap-6 animate-pulse-subtle">
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6 h-96">
              <div className="h-5 bg-[#353535] rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-[#353535] rounded w-3/4 mb-6"></div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#353535]"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-[#353535] rounded w-1/3"></div>
                      <div className="h-3 bg-[#353535] rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ================= LOADED VIEW STATE =================
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Talent Score Analytics Card */}
            <section className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 text-[#F5F5F5]">
                  <Award className="w-6 h-6 text-[#D2042D]" />
                  <h2 className="text-lg font-bold">Talent Score Analytics</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[#D2042D] leading-none">
                    {mockTalentScore.overall}
                    <span className="text-lg text-[#A3A3A3] font-normal">/100</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#ecc154] tracking-wider mt-1">TOP 2% GLOBALLY</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#171717] rounded-lg p-6 border border-[#353535]">
                {/* Radar Chart Representation (Using Recharts but styled with brand variables) */}
                <div style={{ '--primary': '#D2042D', '--secondary': '#D2042D' } as React.CSSProperties} className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
                  <RadarScoreChart data={mockTalentScore.subScores} />
                </div>
                
                {/* Key Strengths */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-sm font-bold text-[#F5F5F5]">Key Strengths</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#A3A3A3]">Problem Solving</span>
                      <span className="text-[#F5F5F5]">95%</span>
                    </div>
                    <div className="w-full h-2 bg-[#353535] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D2042D] rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#A3A3A3]">Coding Ability</span>
                      <span className="text-[#F5F5F5]">92%</span>
                    </div>
                    <div className="w-full h-2 bg-[#353535] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D2042D] rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#A3A3A3]">Technical Consistency</span>
                      <span className="text-[#F5F5F5]">88%</span>
                    </div>
                    <div className="w-full h-2 bg-[#353535] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D2042D] rounded-full" style={{ width: "88%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Resume Parsing & Extraction Card */}
            <section className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col relative">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-[#F5F5F5]">
                  <FileText className="w-5 h-5 text-[#A3A3A3]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">AI Resume Parsing &amp; Extraction</h2>
                </div>
                {profileData?.resumeNeedsReview && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#ecc154] border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3 h-3" />
                    Needs Review
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A3A3A3] mb-4">Upload your resume to automatically extract skills, projects, and work history.</p>

              {isUploading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-center border-2 border-dashed border-[#353535] rounded-lg bg-[#171717]/50">
                  <RefreshCw className="h-8 w-8 text-[#D2042D] animate-spin" />
                  <p className="text-xs font-semibold text-[#F5F5F5]">Extracting and running AI parsing...</p>
                  <p className="text-[10px] text-[#A3A3A3]">This may take a few seconds as the model reviews the text.</p>
                </div>
              ) : profileData?.resumeData ? (
                <div className="space-y-4 bg-[#171717] border border-[#353535] p-4 rounded-lg">
                  <div className="flex justify-between items-center border-b border-[#353535] pb-3">
                    <div>
                      <p className="text-xs font-bold text-[#F5F5F5]">{profileData.resumeData.name}</p>
                      <p className="text-[10px] text-[#A3A3A3]">
                        {profileData.resumeData.email || "No email"} • {profileData.resumeData.phone || "No phone"}
                      </p>
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#353535] hover:bg-[#353535] text-xs font-semibold text-[#F5F5F5] transition-colors">
                      <UploadCloud className="w-4 h-4 text-[#A3A3A3]" />
                      Update PDF
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Latest Experience</p>
                      {profileData.resumeData.experience?.[0] ? (
                        <div>
                          <p className="font-bold text-[#F5F5F5]">{profileData.resumeData.experience[0].role}</p>
                          <p className="text-[#A3A3A3] text-[11px]">
                            {profileData.resumeData.experience[0].company} • {profileData.resumeData.experience[0].start_date} - {profileData.resumeData.experience[0].end_date || "Present"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[#A3A3A3] italic">No experience found</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Latest Education</p>
                      {profileData.resumeData.education?.[0] ? (
                        <div>
                          <p className="font-bold text-[#F5F5F5]">
                            {profileData.resumeData.education[0].degree} in {profileData.resumeData.education[0].field}
                          </p>
                          <p className="text-[#A3A3A3] text-[11px]">
                            {profileData.resumeData.education[0].institution}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[#A3A3A3] italic">No education found</p>
                      )}
                    </div>
                  </div>
                  
                  {profileData.resumeData.skills && profileData.resumeData.skills.length > 0 && (
                    <div className="space-y-1.5 border-t border-[#353535] pt-3">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Extracted Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profileData.resumeData.skills.slice(0, 10).map((skill: string) => (
                          <span key={skill} className="text-[10px] font-semibold px-2 py-0.5 bg-[#262626] text-[#F5F5F5] rounded border border-[#353535]">
                            {skill}
                          </span>
                        ))}
                        {profileData.resumeData.skills.length > 10 && (
                          <span className="text-[10px] text-[#A3A3A3] font-semibold px-1 py-0.5">
                            +{profileData.resumeData.skills.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full border-2 border-dashed border-[#353535] hover:border-[#D2042D] transition-colors bg-[#171717] rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-3 text-center">
                    <UploadCloud className="w-10 h-10 text-[#A3A3A3] group-hover:text-[#D2042D] transition-colors" />
                    <span className="text-sm font-bold text-[#F5F5F5] group-hover:text-[#D2042D] transition-colors">Click to Upload Resume (PDF)</span>
                    <span className="text-xs text-[#A3A3A3]">Standard PDF formats are processed securely.</span>
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  </label>
                  {uploadError && (
                    <p className="mt-2 text-xs font-semibold text-red-500">{uploadError}</p>
                  )}
                </div>
              )}
            </section>

            {/* Developer Integrations / GitHub Connection */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-1.5">
                  <GitHubIcon className="h-4.5 w-4.5 text-[#F5F5F5]" />
                  GitHub Integration
                </h3>
                {isLoadingData ? (
                  <p className="text-xs text-[#A3A3A3]">Checking connection status...</p>
                ) : profileData?.isGitHubConnected ? (
                  <p className="text-xs text-[#A3A3A3]">
                    Connected as <span className="font-bold text-[#D2042D]">@{profileData.githubUsername}</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#A3A3A3]">
                    Sync your GitHub repositories to showcase coding activity and build dynamic portfolio scores.
                  </p>
                )}
              </div>
              
              {!isLoadingData && (
                profileData?.isGitHubConnected ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#19a566]/20 text-[#61dd98] border border-[#19a566]/30 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      window.location.href = "/api/auth/github";
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#F5F5F5] hover:bg-[#F5F5F5]/90 text-[#131313] text-xs font-bold transition-all"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    Connect GitHub
                  </button>
                )
              )}
            </div>

            {/* Top AI-Generated Job Matches Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#F5F5F5] mb-2">
                <TrendingUp className="w-5 h-5 text-[#D2042D]" />
                <h2 className="text-lg font-bold">Top AI-Generated Job Matches</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockJobs.map((job) => {
                  const isHighMatch = job.matchScore >= 90;
                  const isMedMatch = job.matchScore >= 80 && job.matchScore < 90;
                  const badgeColorClass = isHighMatch 
                    ? "bg-[#19a566]/20 text-[#61dd98]" 
                    : isMedMatch 
                      ? "bg-[#b18c22]/20 text-[#ecc154]" 
                      : "bg-[#353535] text-[#A3A3A3]";
                  const badgeDotClass = isHighMatch 
                    ? "bg-[#61dd98]" 
                    : isMedMatch 
                      ? "bg-[#ecc154]" 
                      : "bg-[#A3A3A3]";

                  return (
                    <div key={job.id} className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col justify-between hover:border-[#D2042D] transition-colors hover:bg-[#2b2b2b]">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-base font-bold text-[#F5F5F5] leading-tight pr-2">{job.title}</h3>
                          <span className={`font-semibold text-xs px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 ${badgeColorClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeDotClass}`}></span> 
                            {job.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#A3A3A3] mb-4">{job.company}</p>
                        
                        <div className="flex flex-col gap-2 mb-4 text-xs text-[#A3A3A3]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#A3A3A3]" /> 
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-[#A3A3A3]" /> 
                            <span>{job.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-[#A3A3A3]" /> 
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#A3A3A3] line-clamp-2 mb-4">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.badges.map((tag) => (
                            <span key={tag} className="bg-[#353535] text-[#F5F5F5] text-[10px] font-semibold px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={() => router.push(`/candidate/jobs`)}
                          className="flex-1 bg-transparent border border-[#353535] text-[#F5F5F5] hover:bg-[#353535] transition-colors text-xs font-bold rounded-lg py-2 flex justify-center items-center"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => router.push(`/candidate/jobs`)}
                          className="flex-1 bg-[#D2042D] text-white hover:bg-[#D2042D]/90 transition-colors text-xs font-bold rounded-lg py-2 flex justify-center items-center gap-1"
                        >
                          Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column (1/3) */}
          <aside className="lg:col-span-4 h-full">
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col h-full sticky top-[92px]">
              <div className="flex items-center gap-2 text-[#F5F5F5] mb-2">
                <Compass className="w-5 h-5 text-[#D2042D]" />
                <h2 className="text-base font-bold">Your AI Career Roadmap</h2>
              </div>
              <p className="text-xs text-[#A3A3A3] mb-6 pb-4 border-b border-[#353535]">AI suggestions to boost match percentages and fill missing gaps.</p>
              
              {/* Roadmap Timeline */}
              <div className="flex flex-col gap-6 relative flex-grow">
                {/* Timeline Line */}
                <div className="absolute left-[11px] top-2 bottom-6 w-[2px] bg-[#353535] rounded-full"></div>
                
                {mockRoadmapSteps.map((step) => {
                  const isInProgress = step.status === "in_progress";
                  return (
                    <div key={step.id} className="flex gap-4 relative z-10">
                      <div className={`w-6 h-6 rounded-full bg-[#131313] border-2 flex-shrink-0 flex items-center justify-center mt-1 ${isInProgress ? "border-[#D2042D]" : "border-[#353535]"}`}>
                        {isInProgress && <div className="w-2 h-2 rounded-full bg-[#D2042D]"></div>}
                      </div>
                      <div className="flex flex-col gap-1 w-full text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-[#F5F5F5] text-sm leading-snug">{step.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${isInProgress ? "bg-[#b18c22]/20 text-[#ecc154]" : "bg-[#353535] text-[#F5F5F5] border border-[#353535]"}`}>
                            {isInProgress ? "In Progress" : "Up Next"}
                          </span>
                        </div>
                        <p className="text-[#A3A3A3] mt-1 leading-relaxed">{step.description}</p>
                        <span className="text-[10px] text-[#A3A3A3] mt-1">Est: {step.timeEstimate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <div className="bg-[#171717] border border-[#353535] rounded-lg p-4 mt-6 flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#A3A3A3] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-[#A3A3A3]">Completing roadmap steps updates your credentials and broadcasts improvements instantly to relevant recruiters.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
