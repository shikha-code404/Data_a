"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCandidateProfileData, completeOnboarding } from "../actions";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  User,
  Zap,
  Loader2
} from "lucide-react";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function CandidateOnboarding() {
  const router = useRouter();
  
  // Loading and integration states
  const [profile, setProfile] = useState<{
    githubUsername: string | null;
    isGitHubConnected: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfileData = async () => {
    const res = await getCandidateProfileData();
    if (res.success) {
      // If candidate is already onboarded, redirect straight to dashboard
      if (res.talentProfile) {
        router.push("/candidate");
        return;
      }
      setProfile({
        githubUsername: res.githubUsername,
        isGitHubConnected: !!res.isGitHubConnected,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Only PDF resumes are supported.");
      return;
    }
    setResumeFile(file);
    setErrorMessage(null);
  };

  const handleCompleteOnboarding = async () => {
    if (!profile?.isGitHubConnected) {
      setErrorMessage("Please connect your GitHub account first.");
      return;
    }
    if (!resumeFile) {
      setErrorMessage("Please select your PDF resume file to upload.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await completeOnboarding(formData);
      if (res.success) {
        router.push("/candidate/review");
      } else {
        setErrorMessage(res.error || "An error occurred while compiling your profile.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred.");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#131313] text-[#F5F5F5] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="h-10 w-10 text-[#D2042D] animate-spin" />
        <p className="mt-4 text-xs font-semibold text-[#A3A3A3]">Loading onboarding checklist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2dfff] flex flex-col font-sans relative antialiased p-6 md:p-12">
      {/* Fullscreen processing loader */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#131313]/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="max-w-md w-full p-6 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-[#D2042D] animate-spin absolute" />
              <User className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Creating Talent Profile</h2>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Ingesting GitHub activities and parsing your resume concurrently. This may take a few seconds as the AI models evaluate text.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2.5 items-stretch text-left text-xs bg-[#1c1c1e] border border-[#353534] p-4 rounded-xl">
              <div className="flex items-center gap-2 text-[#A3A3A3]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ecc154]" />
                <span>Running GitHub pipeline ingestion...</span>
              </div>
              <div className="flex items-center gap-2 text-[#A3A3A3]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ecc154]" />
                <span>Parsing resume PDF with Zod validation...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-3xl mx-auto flex-grow flex flex-col justify-between">
        <div>
          {/* Nav Header */}
          <nav className="flex items-center justify-between mb-12 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#D2042D] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">HireSpark</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D2042D] bg-[#D2042D]/10 px-2.5 py-1 rounded-full border border-[#D2042D]/20">
              Secure Onboarding
            </span>
          </nav>

          {/* Header */}
          <header className="text-center mb-10">
            <h1 className="text-3xl font-extrabold mb-2 text-white">Connect Your Profile</h1>
            <p className="text-sm text-[#A3A3A3]">Complete these steps to generate your Talent Pool profile.</p>
          </header>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10 space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#D2042D] flex items-center justify-center text-white font-mono text-sm font-bold">1</div>
              <span className="text-xs font-bold text-white">Data Sources</span>
            </div>
            <div className="w-16 h-[2px] bg-white/10"></div>
            <div className="flex items-center space-x-2 opacity-50">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[#A3A3A3] font-mono text-sm font-bold">2</div>
              <span className="text-xs font-bold text-[#A3A3A3]">Verification</span>
            </div>
          </div>

          {/* Connection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GitHub Card */}
            <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-8 flex flex-col items-center justify-between min-h-[320px] shadow-xl hover:-translate-y-0.5 transition-transform duration-300">
              <div className="w-full flex justify-between items-start mb-6">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D2042D]/10 text-[#D2042D] border border-[#D2042D]/20">
                  Required
                </span>
                <GithubIcon className="w-5 h-5 text-[#A3A3A3]" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-20 h-20 rounded-full bg-[#131313] flex items-center justify-center mb-4 border border-white/5">
                  <GithubIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-2">Connect GitHub</h3>
                <p className="text-xs text-[#A3A3A3] text-center mb-6">Analyze your repository history and coding patterns.</p>
              </div>

              {profile?.isGitHubConnected ? (
                <div className="w-full text-center">
                  <p className="text-xs text-white mb-4">
                    Linked to: <span className="font-extrabold text-[#ecc154]">@{profile.githubUsername}</span>
                  </p>
                  <div className="w-full bg-[#131313] border border-[#353534] text-[#A3A3A3] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#64de87]" />
                    <span>Linked Successfully</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/github";
                  }}
                  className="w-full bg-[#ecc154] hover:bg-[#e5c367] text-[#131313] font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-md shadow-[#ecc154]/15 active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
                >
                  Authenticate
                </button>
              )}
            </div>

            {/* Resume Upload Card */}
            <div className="bg-[#1c1c1e] border-dashed border-2 border-[#353534] hover:border-[#D2042D]/35 rounded-2xl p-8 flex flex-col items-center justify-between min-h-[320px] transition-all duration-300 relative overflow-hidden group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full flex justify-between items-start mb-6 z-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D2042D]/10 text-[#D2042D] border border-[#D2042D]/20">
                  Required
                </span>
                <FileText className="w-5 h-5 text-[#A3A3A3]" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center w-full z-0 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-[#131313] flex items-center justify-center mb-4 border border-white/5 group-hover:bg-[#D2042D]/10 transition-colors">
                  <UploadCloud className="w-8 h-8 text-[#A3A3A3] group-hover:text-[#D2042D] transition-colors" />
                </div>
                {resumeFile ? (
                  <>
                    <h3 className="text-sm font-extrabold text-[#ecc154] mb-2 truncate max-w-[200px]">📄 {resumeFile.name}</h3>
                    <p className="text-xs text-[#A3A3A3] text-center">Click or drag to change resume file.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-base font-extrabold text-white mb-2">Upload Resume</h3>
                    <p className="text-xs text-[#A3A3A3] text-center mb-2">Drag and drop your resume (PDF format)</p>
                    <p className="text-[10px] text-[#A3A3A3] font-mono">Max size: 5MB</p>
                  </>
                )}
              </div>
              <div className="w-full z-0 pointer-events-none mt-6">
                <div className="w-full bg-[#ecc154] hover:bg-[#e5c367] text-[#131313] font-bold py-3 px-4 rounded-xl text-center transition-colors duration-200 shadow-md shadow-[#ecc154]/15 text-xs uppercase tracking-wider">
                  Browse Files
                </div>
              </div>
            </div>

          </div>

          {errorMessage && (
            <div className="mt-8 flex items-start gap-2 bg-[#D2042D]/10 border border-[#D2042D]/20 text-[#D2042D] rounded-xl p-4 text-xs font-bold">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Global Actions */}
        <div className="mt-12 flex justify-between items-center border-t border-[#353534]/50 pt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-[#A3A3A3] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          {profile?.isGitHubConnected && resumeFile ? (
            <button
              onClick={handleCompleteOnboarding}
              className="bg-[#ecc154] hover:bg-[#e5c367] text-[#131313] font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#ecc154]/15 cursor-pointer text-xs uppercase tracking-wider"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="opacity-50 cursor-not-allowed bg-[#ecc154]/20 text-[#ecc154]/50 font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
