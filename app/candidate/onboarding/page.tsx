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
  User,
} from "lucide-react";

const GitHubIcon = ({ className }: { className?: string }) => (
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="mt-4 text-xs font-semibold text-zinc-650 dark:text-zinc-400">Loading onboarding checklist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-zinc-200/20 dark:bg-zinc-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Fullscreen processing loader */}
      {isProcessing && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity">
          <div className="max-w-md w-full p-6 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <RefreshCw className="h-12 w-12 text-indigo-500 animate-spin absolute" />
              <User className="h-5 w-5 text-indigo-300 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Creating Talent Profile</h2>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Ingesting GitHub activities and parsing your resume concurrently. This may take a few seconds as the AI models evaluate text.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2.5 items-stretch text-left text-xs bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-zinc-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                <span>Running GitHub pipeline ingestion...</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                <span>Parsing resume PDF with Zod validation...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-900 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-indigo-650 flex items-center justify-center font-black text-white text-base tracking-tighter">
              T
            </span>
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
              TalentAI Platform
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-full">
            Onboarding Stage
          </span>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-md rounded-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome, Developer!
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We need to sync your GitHub account and ingest your resume. Once both are completed, we will combine them to build your custom talent profile.
            </p>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Onboarding Checklist Card */}
          <div className="space-y-4">
            
            {/* Step 1: GitHub Connection */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                    <GitHubIcon className="h-4 w-4" />
                    Step 1: Connect GitHub (Mandatory)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Required to import repositories, language profiles, and commit metrics.
                  </p>
                </div>
                {profile?.isGitHubConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                )}
              </div>
              
              {profile?.isGitHubConnected ? (
                <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Linked to user: <span className="font-extrabold text-indigo-650 dark:text-indigo-400">@{profile.githubUsername}</span>
                </p>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = "/api/auth/github";
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold transition-all shadow-sm shadow-zinc-900/10"
                >
                  <GitHubIcon className="w-4 h-4" />
                  Link GitHub Account
                </button>
              )}
            </div>

            {/* Step 2: Resume PDF Upload */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Step 2: Upload Resume (Mandatory)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                    Upload your latest CV in PDF format for AI extraction of skills and history.
                  </p>
                </div>
                {resumeFile && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Ready
                  </span>
                )}
              </div>

              {resumeFile ? (
                <div className="flex items-center justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 px-3 py-2 rounded-xl text-[11px]">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                    📄 {resumeFile.name}
                  </span>
                  <label className="cursor-pointer font-bold text-indigo-650 hover:underline">
                    Change File
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-250 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-650 transition-colors rounded-xl p-4 bg-white dark:bg-zinc-950/50">
                  <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-2">
                    <UploadCloud className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Click to upload PDF resume</span>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              )}
            </div>

          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl p-3 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleCompleteOnboarding}
            disabled={!profile?.isGitHubConnected || !resumeFile}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
              profile?.isGitHubConnected && resumeFile
                ? "bg-indigo-650 text-white hover:bg-indigo-500 shadow-indigo-900/10 hover:scale-[1.01]"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
            }`}
          >
            Complete Onboarding & Merge Profile
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
