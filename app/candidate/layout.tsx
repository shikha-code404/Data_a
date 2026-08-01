"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Compass,
  ChevronDown,
  Bell,
  Award,
  Briefcase,
  Trophy,
  FileText
} from "lucide-react";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isJobsOpen, setIsJobsOpen] = useState(false);

  // Determine active states
  const isOverviewActive = pathname === "/candidate";
  const isInsightsActive = pathname === "/candidate/guidance" || pathname === "/candidate/talent-score";
  const isJobsActive = pathname === "/candidate/jobs" || pathname === "/candidate/resume";
  const isHackathonsActive = pathname === "/candidate/hackathons";

  return (
    <div className="flex flex-col min-h-screen bg-[#131313]">
      {/* Top Navigation Bar */}
      <header className="h-[72px] flex items-center bg-[#131313] border-b border-[#353534] sticky top-0 z-50 w-full px-6 md:px-10">
        <div className="flex items-center gap-3 mr-8">
          <img alt="HireSpark Logo" className="h-8 w-8 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLM6HEO2DzrEuWWj176e58UdzEkq8ftj42F0gHojJQreu-uiYIV_xRcXfaKLMbaKB1iJb2YwVg-i_f0zmc19tgpP7bMHUmBzEs4ZM6f-JS1UiRq0IPZoiTZK70PVBjV5ifLTIy1MoCZrJLQFJdQLgtx2ykunE48DwwDfmpK4T7M2bPD3H2CGOWVGfuOntmILvSqIh5ipBg9aweTSheYqk9EhNUrdGQSDdnKNIkHBhyafwAR5fOjXSLtgDFYx31ASJ_Dw" />
          <h1 className="text-xl font-bold text-[#D2042D] tracking-wide font-sans">HireSpark</h1>
        </div>

        <nav className="hidden lg:flex items-center h-full flex-1 text-sm gap-8 font-sans">
          {/* Overview */}
          <Link href="/candidate" className={`flex items-center gap-2 h-full px-3 relative transition-colors ${isOverviewActive ? "text-[#F5F5F5]" : "text-[#A3A3A3] hover:text-[#F5F5F5]"}`}>
            <LayoutDashboard className={`w-5 h-5 ${isOverviewActive ? "text-[#D2042D]" : ""}`} />
            <span>Overview</span>
            {isOverviewActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
          </Link>
          
          {/* Insights Dropdown */}
          <div 
            className={`group relative flex items-center h-full px-3 transition-colors cursor-pointer ${isInsightsActive ? "text-[#F5F5F5]" : "text-[#A3A3A3] hover:text-[#F5F5F5]"}`}
            onMouseEnter={() => setIsInsightsOpen(true)}
            onMouseLeave={() => setIsInsightsOpen(false)}
          >
            <div className="flex items-center gap-2 h-full">
              <Compass className={`w-5 h-5 ${isInsightsActive ? "text-[#D2042D]" : ""}`} />
              <span>Insights</span>
              <ChevronDown className="w-4 h-4" />
              {isInsightsActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
            </div>
            
            {isInsightsOpen && (
              <div className="absolute top-[72px] left-0 mt-0 w-48 bg-[#262626] border border-[#353534] rounded-b-lg shadow-xl py-2 z-50">
                <Link href="/candidate/guidance" className="flex items-center gap-3 px-4 py-2 hover:bg-[#353534] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
                  <Compass className="w-4 h-4" />
                  <span>Career Insights</span>
                </Link>
                <Link href="/candidate/talent-score" className="flex items-center gap-3 px-4 py-2 hover:bg-[#353534] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
                  <Award className="w-4 h-4" />
                  <span>Talent Score</span>
                </Link>
              </div>
            )}
          </div>

          {/* Jobs Dropdown */}
          <div 
            className={`group relative flex items-center h-full px-3 transition-colors cursor-pointer ${isJobsActive ? "text-[#F5F5F5]" : "text-[#A3A3A3] hover:text-[#F5F5F5]"}`}
            onMouseEnter={() => setIsJobsOpen(true)}
            onMouseLeave={() => setIsJobsOpen(false)}
          >
            <div className="flex items-center gap-2 h-full">
              <Briefcase className={`w-5 h-5 ${isJobsActive ? "text-[#D2042D]" : ""}`} />
              <span>Jobs</span>
              <ChevronDown className="w-4 h-4" />
              {isJobsActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
            </div>
            
            {isJobsOpen && (
              <div className="absolute top-[72px] left-0 mt-0 w-48 bg-[#262626] border border-[#353534] rounded-b-lg shadow-xl py-2 z-50">
                <Link href="/candidate/jobs" className="flex items-center gap-3 px-4 py-2 hover:bg-[#353534] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
                  <Briefcase className="w-4 h-4" />
                  <span>Job Matching</span>
                </Link>
                <Link href="/candidate/resume" className="flex items-center gap-3 px-4 py-2 hover:bg-[#353534] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Resume Builder</span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Hackathons */}
          <Link href="/candidate/hackathons" className={`flex items-center gap-2 h-full px-3 relative transition-colors ${isHackathonsActive ? "text-[#F5F5F5]" : "text-[#A3A3A3] hover:text-[#F5F5F5]"}`}>
            <Trophy className={`w-5 h-5 ${isHackathonsActive ? "text-[#D2042D]" : ""}`} />
            <span>Hackathons</span>
            {isHackathonsActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
          </Link>
        </nav>

        <div className="flex items-center gap-6 ml-auto">
          <button className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <div className="h-6 w-[1px] bg-[#353534]"></div>
          
          <div className="flex items-center gap-3 group relative cursor-pointer ml-4">
            <p className="text-sm font-medium text-[#F5F5F5] hidden sm:block">{user?.name || "Candidate"}</p>
            <div className="h-10 w-10 rounded-full bg-[#D2042D] border-transparent flex items-center justify-center text-lg font-bold text-white">
              {user?.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "C"}
            </div>
            <ChevronDown className="w-5 h-5 text-[#A3A3A3]" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto py-8">
        {children}
      </main>
    </div>
  );
}
