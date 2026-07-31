"use client";

import React, { useState, useEffect } from "react";
import { Award, TrendingUp, Code, FileText, CheckCircle2, Layers, Star, RefreshCw, Sparkles } from "lucide-react";
import { getCandidateProfileData, generateTalentScoreAction } from "../actions";

export default function TalentScorePage() {
  const [talentScore, setTalentScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    const res = await getCandidateProfileData();
    if (res.success) {
      if (res.talentScore) {
        setTalentScore(res.talentScore);
        if (res.talentScore.reasoning) {
          setHighlights([res.talentScore.reasoning]);
        }
      }
      if (res.talentProfile?.resume?.skills) {
        setSkills(res.talentProfile.resume.skills);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const res = await generateTalentScoreAction();
    if (res.success) {
      await loadData();
    } else {
      alert(res.error || "Failed to generate talent score.");
    }
    setIsGenerating(false);
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] font-sans flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D2042D] mb-4" />
        <p className="text-xs text-[#A3A3A3]">Loading score analytics...</p>
      </div>
    );
  }

  const overall = talentScore?.overall_score || talentScore?.overallScore || null;
  const breakdown = talentScore?.scores || talentScore?.breakdown || null;

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] font-sans">
      {/* Header */}
      <header className="flex flex-col gap-2 border-b border-[#353534]/50 pb-6">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-[#D2042D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F5]">AI Talent Score &amp; Analysis</h1>
        </div>
        <p className="text-sm text-[#A3A3A3] max-w-3xl">
          Comprehensive evaluation generated from your GitHub repositories, code quality, and parsed resume.
        </p>
      </header>

      {overall === null ? (
        {/* Hero Section - Empty CTA State */}
        <div className="bg-[#262626] border border-[#353535] rounded-xl p-10 flex flex-col items-center justify-center text-center gap-6">
          <Award className="w-16 h-16 text-[#D2042D] animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Generate your AI Talent Score</h2>
            <p className="text-sm text-[#A3A3A3] max-w-xl mx-auto">
              Your profile has no talent score computed yet. Click the button below to trigger our AI agents to audit your code repositories and resume, then calculate your standardized competency score.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing repositories & resume...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Compute Talent Score Now</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Overall Score */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 lg:col-span-4 flex flex-col items-center justify-center text-center min-h-[240px]">
              <h2 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">OVERALL TALENT SCORE</h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[72px] leading-[80px] text-[#D2042D] font-extrabold tracking-tighter">{overall}</span>
                <span className="text-lg text-[#A3A3A3]">/100</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#064e3b]/30 border border-[#059669]/50 text-[#34d399] text-xs font-semibold">
                <TrendingUp className="w-4 h-4" />
                <span>{overall >= 90 ? "Top 2% Talent Match" : overall >= 80 ? "Top 10% Talent Match" : "Verified Competency"}</span>
              </div>
            </div>

            {/* Right Card: Score Breakdown */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 lg:col-span-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#D2042D]" />
                <h2 className="text-lg font-bold text-[#F5F5F5]">Score Breakdown</h2>
              </div>
              
              <div className="space-y-6">
                {/* Code Quality */}
                <div>
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-[#F5F5F5]">
                      <Code className="w-4 h-4 text-[#38bdf8]" />
                      <span>Code Quality &amp; GitHub Activity</span>
                    </div>
                    <span className="text-[#38bdf8] font-bold">{(breakdown?.coding_ability || breakdown?.codeQuality || 70)} / 100</span>
                  </div>
                  <div className="w-full bg-[#171717] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] h-2 rounded-full" style={{ width: `${(breakdown?.coding_ability || breakdown?.codeQuality || 70)}%` }}></div>
                  </div>
                </div>

                {/* Skill Relevance */}
                <div>
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-[#F5F5F5]">
                      <FileText className="w-4 h-4 text-[#f472b6]" />
                      <span>Resume &amp; Skill Relevance</span>
                    </div>
                    <span className="text-[#f472b6] font-bold">{(breakdown?.project_quality || breakdown?.skillFit || 70)} / 100</span>
                  </div>
                  <div className="w-full bg-[#171717] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#d946ef] to-[#f43f5e] h-2 rounded-full" style={{ width: `${(breakdown?.project_quality || breakdown?.skillFit || 70)}%` }}></div>
                  </div>
                </div>

                {/* Project Complexity */}
                <div>
                  <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                    <div className="flex items-center gap-2 text-[#F5F5F5]">
                      <Layers className="w-4 h-4 text-[#34d399]" />
                      <span>Project Complexity &amp; Architecture</span>
                    </div>
                    <span className="text-[#34d399] font-bold">{(breakdown?.technical_consistency || breakdown?.projectComplexity || 70)} / 100</span>
                  </div>
                  <div className="w-full bg-[#171717] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#059669] to-[#14b8a6] h-2 rounded-full" style={{ width: `${(breakdown?.technical_consistency || breakdown?.projectComplexity || 70)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Verified Technical Skills */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-[#34d399]" />
                <h3 className="text-base font-bold text-[#F5F5F5]">Verified Technical Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1.5 bg-[#2B2B2B] border border-[#353535] text-[#A3A3A3] hover:text-[#F5F5F5] rounded text-xs font-semibold hover:bg-[#353535] transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#A3A3A3] italic">No skills registered yet.</p>
                )}
              </div>
            </div>

            {/* Right Column: AI Highlights & Strengths */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-[#fbbf24]" />
                <h3 className="text-base font-bold text-[#F5F5F5]">AI Highlights &amp; Strengths</h3>
              </div>
              <ul className="space-y-4">
                {highlights.length > 0 ? (
                  highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
                      <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">{h}</p>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
                      <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">Audited full-stack JavaScript and TypeScript repositories.</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
                      <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">Demonstrated serverless architecture capabilities.</p>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
