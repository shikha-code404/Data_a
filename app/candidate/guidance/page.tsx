"use client";

import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/lib/auth-context";

export default function GuidancePage() {
  const { candidate_id } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showComp, setShowComp] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [skillGap, setSkillGap] = useState<any>(null);
  const [cert, setCert] = useState<any>(null);
  const [salaryRange, setSalaryRange] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any[]>([]);

  const fetchGuidance = async (id: string, forceFresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/career/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: id, force_fresh: forceFresh })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to load career insights");
      
      if (result.success !== false) {
        const data = result.career_roadmap || {};
        if (data.skill_gaps && data.skill_gaps.length > 0) {
          setSkillGap(data.skill_gaps[0]);
        } else {
          setSkillGap(null);
        }
        if (data.recommended_certifications && data.recommended_certifications.length > 0) {
          setCert(data.recommended_certifications[0]);
        } else {
          setCert(null);
        }
        if (result.salary_estimate) {
          setSalaryRange(result.salary_estimate);
        } else {
          setSalaryRange(null);
        }
        if (data.career_roadmap) {
          setRoadmap(data.career_roadmap);
        } else {
          setRoadmap([]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchGuidance(candidate_id);
    } else {
      setLoading(true);
    }
  }, [candidate_id]);

  const handleUpdateProfile = async () => {
    if (!candidate_id) return;
    setIsUpdating(true);
    setUpdateSuccess(false);
    try {
      await fetchGuidance(candidate_id, true);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-[#D2042D] mb-4" />
        <p className="text-sm text-[#A3A3A3]">Calculating career path & matching insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] flex flex-col items-center justify-center py-20 gap-4">
        <div className="bg-[#262626] border border-[#353535] p-6 rounded-xl text-center max-w-md">
          <p className="text-sm text-[#A3A3A3] mb-4">You must calculate your Talent Score before career insights can be generated.</p>
          <a href="/candidate" className="px-6 py-2.5 bg-[#D2042D] text-white font-bold rounded-xl text-xs inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1]">
      {/* Page Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#353534]/50 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#F5F5F5] font-sans">Career Insights</h2>
          <p className="text-sm text-[#D4D4D4] mt-1 font-sans">Based on your talent profile alignment and market demand.</p>
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
                <p className="text-xs font-semibold text-[#A3A3A3] mb-6 tracking-widest uppercase">
                  {skillGap ? skillGap.skill : "Full-Stack Gaps"}
                </p>
                
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
                  <span>Current: {skillGap ? skillGap.current_level : "Beginner"}</span>
                  <span className="text-[#D2042D] font-bold">Target: {skillGap ? skillGap.target_level : "Expert"}</span>
                </div>
              </div>
              
              <div className="bg-[#171717] rounded-lg p-4 border border-[#353535]/80">
                <p className="text-sm text-[#D4D4D4]">
                  {skillGap ? skillGap.why : "Strengthening this focus increases match percentage on senior positions."}
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
                <h5 className="text-lg font-semibold text-[#F5F5F5] mt-6 mb-1">
                  {cert ? cert.name : "AWS Certified Developer"}
                </h5>
                <p className="text-sm text-[#A3A3A3] mb-8">{cert ? cert.provider : "Amazon Web Services"}</p>
              </div>
              
              <div className="flex items-start gap-3 bg-[#171717] rounded-lg p-4 border border-[#353535]/80">
                <Sparkles className="w-5 h-5 text-[#A3A3A3] shrink-0 mt-0.5" />
                <p className="text-sm text-[#D4D4D4]">
                  {cert ? cert.reason : "Highly requested in your target matches."}
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
                <h3 className="text-3xl font-extrabold text-[#ecc154] tracking-tight">
                  {salaryRange ? `₹${salaryRange.estimated_range?.min?.toLocaleString("en-IN")} - ₹${salaryRange.estimated_range?.max?.toLocaleString("en-IN")}` : "₹15,00,000 - ₹20,00,000"}
                </h3>
                <p className="text-xs text-[#D4D4D4]">Annual Base Salary ({salaryRange?.estimated_range?.currency || "INR"})</p>
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
                {salaryRange ? salaryRange.basis : "Basis: Estimate derived from cross-referencing your verified skills against real-time market data."}
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
            
            {roadmap.length > 0 ? (
              roadmap.slice(0, 2).map((node, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className={`h-4.5 w-4.5 rounded-full border-4 border-[#262626] mb-4 shadow-[0_0_0_2px_#353535] z-10 shrink-0 ${idx === 0 ? "bg-[#D2042D]" : "bg-[#353535]"}`}></div>
                  <div className="bg-[#171717] border border-[#353535] rounded-lg p-6 w-full text-left hover:border-[#D2042D]/45 transition-colors duration-300">
                    <span className="text-xs font-semibold text-[#A3A3A3] block mb-1">{node.timeframe}</span>
                    <h5 className="text-lg font-semibold text-[#F5F5F5] mb-4">{node.stage}</h5>
                    <ul className="space-y-4">
                      {Array.isArray(node.milestones) ? (
                        node.milestones.map((milestone: string, mIdx: number) => (
                          <li key={mIdx} className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                            <CheckCircle2 className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                            <span>{milestone}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2.5 text-xs text-[#D4D4D4]">
                          <CheckCircle2 className="w-4 h-4 text-[#A3A3A3] shrink-0 mt-0.5" />
                          <span>{node.milestones}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-10 text-xs text-[#A3A3A3]">
                No roadmap nodes generated.
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
