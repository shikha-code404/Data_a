"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  Sparkles,
  Briefcase
} from "lucide-react";

export default function GuidancePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showComp, setShowComp] = useState(false);

  const handleUpdateProfile = () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1]">
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#353534]/50 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#F5F5F5] font-sans">Career Insights</h2>
          <p className="text-sm text-[#D4D4D4] mt-1 font-sans">Based on your 92% talent score and market demand.</p>
        </div>
        <button 
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className="px-6 py-2.5 rounded transition-all duration-200 inline-flex items-center gap-2 bg-[#ecc154] hover:bg-[#ecc154]/90 text-[#131313] font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
        >
          <RefreshCw className={`w-[18px] h-[18px] ${isUpdating ? "animate-spin" : ""}`} />
          <span>{isUpdating ? "Updating..." : updateSuccess ? "Profile Updated!" : "Update Profile"}</span>
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Skill Focus & Certifications (Spans 8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            
            {/* Skill Gap Card */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-[#4d4d4d] transition-colors duration-300">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-[#D2042D]" />
                  <h4 className="text-xl font-semibold text-[#F5F5F5]">Skill Focus</h4>
                </div>
                <p className="text-xs font-semibold text-[#A3A3A3] mb-6 tracking-widest uppercase">Cloud Deployment &amp; DevOps</p>
                
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 bg-[#171717] rounded-full h-3 relative">
                    <div className="absolute left-0 top-0 h-full w-1/3 bg-[#353535] rounded-l-full"></div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#A3A3A3] shrink-0" />
                  <div className="flex-1 bg-[#171717] rounded-full h-3 relative">
                    <div className="absolute left-0 top-0 h-full w-2/3 bg-[#D2042D] rounded-full shadow-[0_0_8px_rgba(210,4,45,0.5)]"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs font-semibold text-[#A3A3A3] mb-8">
                  <span>Beginner</span>
                  <span className="text-[#D2042D] font-bold">Intermediate</span>
                </div>
              </div>
              
              <div className="bg-[#171717] rounded-lg p-4 border border-[#353535]/80">
                <p className="text-sm text-[#D4D4D4]">
                  Closing this gap increases your match rate for Senior positions by <span className="text-white font-semibold">34%</span>.
                </p>
              </div>
            </div>

            {/* Certification Card */}
            <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-[#4d4d4d] transition-colors duration-300">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-[#D2042D]" />
                  <h4 className="text-xl font-semibold text-[#F5F5F5]">Recommended Cert</h4>
                </div>
                <h5 className="text-lg font-semibold text-[#F5F5F5] mt-6 mb-1">AWS Certified Developer - Associate</h5>
                <p className="text-sm text-[#A3A3A3] mb-8">Amazon Web Services</p>
              </div>
              
              <div className="flex items-start gap-3 bg-[#171717] rounded-lg p-4 border border-[#353535]/80">
                <Sparkles className="w-5 h-5 text-[#A3A3A3] shrink-0 mt-0.5" />
                <p className="text-sm text-[#D4D4D4]">
                  Highly requested in <span className="text-white font-semibold">85%</span> of your target job matches.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Secondary Compensation Info (Spans 4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#262626] border border-[#353535] rounded-xl p-6 flex flex-col justify-between shadow-lg hover:border-[#4d4d4d] transition-colors duration-300 min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#353535]">
              <DollarSign className="w-5 h-5 text-[#A3A3A3]" />
              <h4 className="text-lg font-semibold text-[#F5F5F5]">Compensation</h4>
            </div>
            
            {!showComp ? (
              <button 
                onClick={() => setShowComp(true)}
                className="w-full py-4 px-6 border border-[#353535] hover:border-[#ecc154]/50 rounded-lg text-[#F5F5F5] font-semibold bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] group/btn"
              >
                <Briefcase className="w-5 h-5 text-[#A3A3A3] group-hover/btn:text-[#ecc154] transition-colors" />
                <span>Get Estimated Compensation Range</span>
              </button>
            ) : (
              <div className="bg-[#171717] rounded-lg p-6 border border-[#ecc154]/20 shadow-inner text-center animate-fade-in space-y-2">
                <p className="text-xs text-[#A3A3A3] uppercase tracking-wider font-semibold">Estimated Market Range</p>
                <h3 className="text-3xl font-extrabold text-[#ecc154] tracking-tight">$145,000 - $175,000</h3>
                <p className="text-xs text-[#D4D4D4]">Annual Base Salary (USD)</p>
                <button 
                  onClick={() => setShowComp(false)}
                  className="text-xs text-[#A3A3A3] hover:text-white underline mt-2 block mx-auto"
                >
                  Reset Estimate
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#171717] border border-[#353535] rounded-lg p-4 mt-6">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
              <p className="text-xs text-[#D4D4D4] leading-relaxed">
                Basis: Estimate derived from cross-referencing your verified skills in React and Node.js against real-time market data for Senior Frontend roles in remote US hubs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Career Roadmap Timeline */}
      <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 shadow-lg relative">
        <h4 className="text-xl font-semibold text-[#F5F5F5] mb-8">Career Roadmap</h4>
        
        <div className="relative pt-2">
          {/* Connecting line for desktop */}
          <div className="absolute top-[24px] left-[15%] right-[15%] h-[2px] bg-[#353535] hidden md:block z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Node 1 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-4.5 w-4.5 rounded-full bg-[#D2042D] border-4 border-[#262626] mb-4 shadow-[0_0_0_2px_#353535] z-10 shrink-0"></div>
              <div className="bg-[#171717] border border-[#353535] rounded-lg p-6 w-full text-left hover:border-[#D2042D]/45 transition-colors duration-300">
                <span className="text-xs font-semibold text-[#A3A3A3] block mb-1">Months 1 - 3</span>
                <h5 className="text-lg font-semibold text-[#F5F5F5] mb-4">Skill Deepening &amp; Gaps</h5>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                    <CheckCircle2 className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                    <span>Complete Advanced React Patterns course.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                    <CheckCircle2 className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                    <span>Initiate Docker/Kubernetes basics.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Node 2 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-4.5 w-4.5 rounded-full bg-[#353535] border-4 border-[#262626] mb-4 shadow-[0_0_0_2px_#353535] z-10 shrink-0"></div>
              <div className="bg-[#171717] border border-[#353535] rounded-lg p-6 w-full text-left hover:border-[#353535]/80 transition-colors duration-300">
                <span className="text-xs font-semibold text-[#A3A3A3] block mb-1">Months 4 - 6</span>
                <h5 className="text-lg font-semibold text-[#F5F5F5] mb-4">Professional Certification</h5>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                    <Circle className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                    <span>Study for AWS Developer Associate.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                    <Circle className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                    <span>Build serverless demo project.</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
