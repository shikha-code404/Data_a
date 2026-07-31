"use client";

import React from "react";
import { Award, TrendingUp, Code, FileText, CheckCircle2, Layers, Star } from "lucide-react";

export default function TalentScorePage() {
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

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Overall Score */}
        <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 lg:col-span-4 flex flex-col items-center justify-center text-center min-h-[240px]">
          <h2 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">OVERALL TALENT SCORE</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-[72px] leading-[80px] text-[#D2042D] font-extrabold tracking-tighter">88.5</span>
            <span className="text-lg text-[#A3A3A3]">/100</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#064e3b]/30 border border-[#059669]/50 text-[#34d399] text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Top 5% Talent Match</span>
          </div>
        </div>

        {/* Right Card: Score Breakdown */}
        <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 lg:col-span-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#D2042D]" />
            <h2 className="text-lg font-bold text-[#F5F5F5]">Score Breakdown</h2>
          </div>
          
          <div className="space-y-6">
            {/* Breakdown Item 1 */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                <div className="flex items-center gap-2 text-[#F5F5F5]">
                  <Code className="w-4 h-4 text-[#38bdf8]" />
                  <span>Code Quality &amp; GitHub Activity</span>
                </div>
                <span className="text-[#38bdf8] font-bold">92 / 100</span>
              </div>
              <div className="w-full bg-[#171717] rounded-full h-2">
                <div className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
            </div>

            {/* Breakdown Item 2 */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                <div className="flex items-center gap-2 text-[#F5F5F5]">
                  <FileText className="w-4 h-4 text-[#f472b6]" />
                  <span>Resume &amp; Skill Relevance</span>
                </div>
                <span className="text-[#f472b6] font-bold">85 / 100</span>
              </div>
              <div className="w-full bg-[#171717] rounded-full h-2">
                <div className="bg-gradient-to-r from-[#d946ef] to-[#f43f5e] h-2 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>

            {/* Breakdown Item 3 */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                <div className="flex items-center gap-2 text-[#F5F5F5]">
                  <Layers className="w-4 h-4 text-[#34d399]" />
                  <span>Project Complexity &amp; Architecture</span>
                </div>
                <span className="text-[#34d399] font-bold">88 / 100</span>
              </div>
              <div className="w-full bg-[#171717] rounded-full h-2">
                <div className="bg-gradient-to-r from-[#059669] to-[#14b8a6] h-2 rounded-full" style={{ width: "88%" }}></div>
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
            {["TypeScript", "React", "Next.js", "Node.js", "Python", "Supabase", "TailwindCSS", "REST APIs", "Git"].map((skill) => (
              <span 
                key={skill} 
                className="px-3 py-1.5 bg-[#2B2B2B] border border-[#353535] text-[#A3A3A3] hover:text-[#F5F5F5] rounded text-xs font-semibold hover:bg-[#353535] transition-colors cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: AI Highlights & Strengths */}
        <div className="bg-[#262626] border border-[#353535] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-[#fbbf24]" />
            <h3 className="text-base font-bold text-[#F5F5F5]">AI Highlights &amp; Strengths</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
              <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">Strong consistency in full-stack JavaScript and TypeScript repositories.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
              <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">Demonstrated capability building serverless applications with Supabase.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-2 flex-shrink-0"></div>
              <p className="text-xs font-semibold text-[#A3A3A3] leading-relaxed">High repository documentation standards and modular code architecture.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
