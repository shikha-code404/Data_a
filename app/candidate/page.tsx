"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RadarScoreChart } from "@/components/RadarScoreChart";
import { getCandidateProfileData, uploadResume, getCandidateJobMatches, generateTalentScoreAction } from "./actions";
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
  
  // Profile integrations state
  const [profileData, setProfileData] = useState<{
    githubUsername: string | null;
    isGitHubConnected: boolean;
    githubData: unknown;
    resumeData: ResumeData | null;
    resumeNeedsReview: boolean;
    talentScore: any;
    careerRoadmap: any;
    salaryEstimate: any;
  } | null>(null);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([]);
  const [isGeneratingScore, setIsGeneratingScore] = useState(false);

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
        talentScore: res.talentScore ?? null,
        careerRoadmap: res.careerRoadmap ?? null,
        salaryEstimate: res.salaryEstimate ?? null,
      });

      // Map roadmap steps if available
      if (res.careerRoadmap && res.careerRoadmap.career_roadmap) {
        const mapped = res.careerRoadmap.career_roadmap.map((step: any, idx: number) => ({
          id: `step-${idx}`,
          title: step.stage || "Next Phase",
          description: Array.isArray(step.milestones) ? step.milestones.join(". ") : (step.milestones || ""),
          timeEstimate: step.timeframe || "1-3 months",
          status: idx === 0 ? "in_progress" : "next"
        }));
        setRoadmapSteps(mapped);
      }

      // Fetch real jobs
      const jobsRes = await getCandidateJobMatches();
      if (jobsRes.success && jobsRes.jobs) {
        setJobs(jobsRes.jobs);
      }
    }
    setIsLoadingData(false);
  };

  const handleGenerateScore = async () => {
    setIsGeneratingScore(true);
    try {
      const res = await generateTalentScoreAction();
      if (res.success) {
        await loadProfile();
      } else {
        alert(res.error || "Failed to generate talent score.");
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsGeneratingScore(false);
    }
  };

  useEffect(() => {
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
            Welcome back, {profileData?.resumeData?.name?.split(" ")[0] || "Developer"}{" "}
            <Sparkles className="w-6 h-6 text-[#D2042D]" />
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1">Your profile was updated by AI Agent parsing 3 hours ago.</p>
        </div>
      </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Talent Score Analytics Card */}
            <section className="bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col">
              {(() => {
                const talentScoreObj = profileData?.talentScore;
                const overallScore = talentScoreObj?.overall_score || talentScoreObj?.overallScore || null;
                const scoresObj = talentScoreObj?.scores || talentScoreObj?.breakdown || null;

                const radarData = scoresObj ? (
                  scoresObj.coding_ability !== undefined ? [
                    { category: "Coding Ability", value: scoresObj.coding_ability || 0 },
                    { category: "Project Quality", value: scoresObj.project_quality || 0 },
                    { category: "Leadership", value: scoresObj.leadership || 0 },
                    { category: "Problem Solving", value: scoresObj.problem_solving || 0 },
                    { category: "Innovation", value: scoresObj.innovation || 0 },
                    { category: "Community Participation", value: scoresObj.community_participation || 0 },
                    { category: "Technical Consistency", value: scoresObj.technical_consistency || 0 }
                  ] : [
                    { category: "Coding Ability", value: scoresObj.codeQuality || 0 },
                    { category: "Project Quality", value: scoresObj.skillFit || 0 },
                    { category: "Leadership", value: 70 },
                    { category: "Problem Solving", value: 80 },
                    { category: "Innovation", value: 75 },
                    { category: "Community Participation", value: 65 },
                    { category: "Technical Consistency", value: 85 }
                  ]
                ) : [];

                return (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2 text-[#F5F5F5]">
                        <Award className="w-6 h-6 text-[#D2042D]" />
                        <h2 className="text-lg font-bold">Talent Score Analytics</h2>
                      </div>
                      {overallScore !== null && (
                        <div className="flex items-center gap-4 text-right">
                          <button
                            onClick={handleGenerateScore}
                            disabled={isGeneratingScore}
                            className="px-3 py-1.5 rounded-lg border border-[#353535] hover:bg-[#353535] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
                            title="Recalculate Talent Score"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingScore ? "animate-spin text-[#D2042D]" : ""}`} />
                            <span>Recalculate</span>
                          </button>
                          <div>
                            <div className="text-3xl font-extrabold text-[#D2042D] leading-none">
                              {overallScore}
                              <span className="text-lg text-[#A3A3A3] font-normal">/100</span>
                            </div>
                            <div className="text-[10px] font-bold text-[#ecc154] tracking-wider mt-1">
                              {overallScore >= 90 ? "TOP 2% GLOBALLY" : overallScore >= 80 ? "TOP 10% GLOBALLY" : "VERIFIED COMPETENCY"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {overallScore === null ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-4 bg-[#171717] rounded-lg p-6 border border-[#353535]">
                        <Award className="w-12 h-12 text-[#D2042D]/60" />
                        <div>
                          <h3 className="text-sm font-bold text-white">Generate your AI Talent Score</h3>
                          <p className="text-xs text-[#A3A3A3] mt-1 max-w-md">Compute a comprehensive overall competency score using our AI agent analyzing your GitHub and resume.</p>
                        </div>
                        <button 
                          onClick={handleGenerateScore}
                          disabled={isGeneratingScore}
                          className="px-6 py-2.5 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {isGeneratingScore ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Analyzing repositories...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Compute Talent Score</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#171717] rounded-lg p-6 border border-[#353535]">
                        {/* Radar Chart Representation (Using Recharts but styled with brand variables) */}
                        <div style={{ '--primary': '#D2042D', '--secondary': '#D2042D' } as React.CSSProperties} className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center">
                          <RadarScoreChart data={radarData} />
                        </div>
                        
                        {/* Key Strengths */}
                        <div className="flex flex-col gap-6">
                          <h3 className="text-sm font-bold text-[#F5F5F5]">Key Strengths</h3>
                          {radarData.slice(0, 3).map((d: any) => (
                            <div key={d.category} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-[#A3A3A3]">{d.category}</span>
                                <span className="text-[#F5F5F5]">{d.value}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#353535] rounded-full overflow-hidden">
                                <div className="h-full bg-[#D2042D] rounded-full" style={{ width: `${d.value}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
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
                  {profileData.resumeData.projects && profileData.resumeData.projects.length > 0 && (
                    <div className="space-y-1.5 border-t border-[#353535] pt-3">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Extracted Projects</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profileData.resumeData.projects.slice(0, 4).map((proj: any, idx: number) => (
                          <div key={idx} className="bg-[#1e1e1e] p-2.5 rounded border border-[#353535] text-[11px] flex flex-col justify-between">
                            <div>
                              <p className="font-bold text-[#F5F5F5]">{proj.name}</p>
                              <p className="text-[#A3A3A3] mt-0.5 line-clamp-2 leading-relaxed">{proj.description}</p>
                            </div>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {proj.technologies.map((tech: string) => (
                                  <span key={tech} className="text-[9px] px-1 bg-[#262626] text-[#A3A3A3] rounded">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData.resumeData.certifications && profileData.resumeData.certifications.length > 0 && (
                    <div className="space-y-1.5 border-t border-[#353535] pt-3">
                      <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">Extracted Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {profileData.resumeData.certifications.map((cert: any, idx: number) => (
                          <div key={idx} className="bg-[#1e1e1e] px-2.5 py-1.5 rounded border border-[#353535] text-[10px] flex justify-between items-center gap-4">
                            <div>
                              <span className="font-bold text-[#F5F5F5]">{cert.name}</span>
                              <span className="text-[#A3A3A3] ml-1.5">({cert.issuer})</span>
                            </div>
                            {cert.year && <span className="font-mono text-[#D2042D] font-bold">{cert.year}</span>}
                          </div>
                        ))}
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
                {jobs.length === 0 ? (
                  <div className="col-span-3 py-10 text-center text-[#A3A3A3] text-xs bg-[#262626] border border-[#353535] rounded-xl w-full">
                    No job matches found. Complete your profile or sync GitHub to match with open jobs.
                  </div>
                ) : (
                  jobs.slice(0, 3).map((job) => {
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
                            {job.badges.map((tag: string) => (
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
                  })
                )}
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
                
                {roadmapSteps.length === 0 ? (
                  <div className="py-10 text-center text-[#A3A3A3] text-xs">
                    No roadmap steps. Generate your Talent Score to receive recommendations.
                  </div>
                ) : (
                  roadmapSteps.map((step) => {
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
                  })
                )}
              </div>

              {/* Info Box */}
              <div className="bg-[#171717] border border-[#353535] rounded-lg p-4 mt-6 flex gap-3 items-start">
                <Info className="w-5 h-5 text-[#A3A3A3] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-[#A3A3A3]">Completing roadmap steps updates your credentials and broadcasts improvements instantly to relevant recruiters.</p>
              </div>
            </div>
          </aside>
        </div>
    </div>
  );
}
