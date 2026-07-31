"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  ChevronDown,
  Bell,
  LogOut,
  Search,
  Briefcase,
  Layers,
  Calendar,
  Trophy,
  Users,
  Award
} from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Dropdown States
  const [isTalentOpen, setIsTalentOpen] = useState(false);
  const [isHiringOpen, setIsHiringOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Copilot persistent header search query
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopilotSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recruiter/discovery?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Active state flags
  const isDashboardActive = pathname === "/recruiter";
  const isTalentActive = pathname === "/recruiter/discovery" || pathname === "/recruiter/shortlisting";
  const isHiringActive = pathname === "/recruiter/jobs" || pathname === "/recruiter/pipeline" || pathname === "/recruiter/interviews";
  const isHackathonsActive = pathname === "/recruiter/hackathons";

  return (
    <div className="flex flex-col min-h-screen bg-[#131313] text-[#F5F5F5] font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-[72px] flex items-center bg-[#131313] border-b border-[#353534] sticky top-0 z-50 w-full px-6 lg:px-8">
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center gap-3 mr-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img 
              alt="HireSpark Logo" 
              className="h-8 w-8 object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLM6HEO2DzrEuWWj176e58UdzEkq8ftj42F0gHojJQreu-uiYIV_xRcXfaKLMbaKB1iJb2YwVg-i_f0zmc19tgpP7bMHUmBzEs4ZM6f-JS1UiRq0IPZoiTZK70PVBjV5ifLTIy1MoCZrJLQFJdQLgtx2ykunE48DwwDfmpK4T7M2bPD3H2CGOWVGfuOntmILvSqIh5ipBg9aweTSheYqk9EhNUrdGQSDdnKNIkHBhyafwAR5fOjXSLtgDFYx31ASJ_Dw" 
            />
            <div className="hidden md:block text-left">
              <h1 className="text-sm font-bold text-[#D2042D] tracking-wide font-sans leading-none">HireSpark</h1>
              <span className="text-[9px] text-[#A3A3A3] font-medium uppercase tracking-wider">Recruiter Pro</span>
            </div>
          </Link>
        </div>

        {/* Middle: Recruiter Copilot Persistent Header Search */}
        <form onSubmit={handleCopilotSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-sm mx-4 relative group">
          <div className="absolute inset-0 bg-[#D2042D]/5 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-300 pointer-events-none" />
          <div className="relative flex items-center w-full bg-[#1c1c1e] border border-[#353534] rounded-lg px-3 py-1.5 gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-[#A3A3A3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Copilot..."
              className="bg-transparent border-none text-[#F5F5F5] placeholder-[#A3A3A3] focus:outline-none w-full text-xs animate-pulse-subtle"
            />
            <button type="submit" className="hidden" />
          </div>
        </form>

        {/* Right: Dropdowns & Navigation Menu */}
        <nav className="flex items-center gap-6 text-sm font-medium ml-auto">
          {/* Dashboard Item */}
          <Link 
            href="/recruiter" 
            className={`flex items-center gap-1.5 h-[72px] relative transition-colors ${
              isDashboardActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            <span>Overview</span>
            {isDashboardActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
          </Link>

          {/* Talent Dropdown Menu */}
          <div 
            className={`group relative flex items-center h-[72px] transition-colors cursor-pointer ${
              isTalentActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
            onMouseEnter={() => setIsTalentOpen(true)}
            onMouseLeave={() => setIsTalentOpen(false)}
          >
            <div className="flex items-center gap-1.5 h-full">
              <span>Talent</span>
              <ChevronDown className="w-3.5 h-3.5" />
              {isTalentActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
            </div>
            
            {isTalentOpen && (
              <div className="absolute top-[72px] left-0 mt-0 w-44 bg-[#1c1c1e] border border-[#353534] rounded-b-lg shadow-xl py-1.5 z-50 text-xs">
                <Link 
                  href="/recruiter/discovery" 
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#2d2d30] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                >
                  <Users className="w-4 h-4 text-[#D2042D]" />
                  <span>Talent Pool</span>
                </Link>
                <Link 
                  href="/recruiter/shortlisting" 
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#2d2d30] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                >
                  <Award className="w-4 h-4 text-[#D2042D]" />
                  <span>AI Shortlisting</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hiring Dropdown Menu */}
          <div 
            className={`group relative flex items-center h-[72px] transition-colors cursor-pointer ${
              isHiringActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
            onMouseEnter={() => setIsHiringOpen(true)}
            onMouseLeave={() => setIsHiringOpen(false)}
          >
            <div className="flex items-center gap-1.5 h-full">
              <span>Hiring</span>
              <ChevronDown className="w-3.5 h-3.5" />
              {isHiringActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
            </div>
            
            {isHiringOpen && (
              <div className="absolute top-[72px] left-0 mt-0 w-44 bg-[#1c1c1e] border border-[#353534] rounded-b-lg shadow-xl py-1.5 z-50 text-xs">
                <Link 
                  href="/recruiter/jobs" 
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#2d2d30] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-[#ecc154]" />
                  <span>Job Postings</span>
                </Link>
                <Link 
                  href="/recruiter/pipeline" 
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#2d2d30] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                >
                  <Layers className="w-4 h-4 text-[#ecc154]" />
                  <span>Pipeline Board</span>
                </Link>
                <Link 
                  href="/recruiter/interviews" 
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#2d2d30] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                >
                  <Calendar className="w-4 h-4 text-[#ecc154]" />
                  <span>Interviews</span>
                </Link>
              </div>
            )}
          </div>

          {/* Hackathons Item */}
          <Link 
            href="/recruiter/hackathons" 
            className={`flex items-center gap-1.5 h-[72px] relative transition-colors ${
              isHackathonsActive ? "text-[#F5F5F5] font-semibold" : "text-[#A3A3A3] hover:text-[#F5F5F5]"
            }`}
          >
            <span>Hackathons</span>
            {isHackathonsActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D2042D]"></div>}
          </Link>

          {/* Separation Border */}
          <div className="h-6 w-px bg-[#353534] mx-2 shrink-0"></div>

          {/* User Settings Dropdown */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer relative"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="h-9 w-9 rounded-full bg-[#D2042D] border border-[#353534] flex items-center justify-center text-sm font-bold text-white uppercase shadow-md shadow-[#D2042D]/10">
              {user?.name ? user.name.charAt(0) : "AM"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#F5F5F5] leading-none">{user?.name || "Alex Mercer"}</p>
              <span className="text-[9px] text-[#A3A3A3] uppercase tracking-wide">Sr. Recruiter</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); }} />
                <div className="absolute right-0 top-[45px] w-48 bg-[#1c1c1e] border border-[#353534] rounded-lg shadow-xl py-1.5 z-40 text-xs">
                  <div className="px-4 py-2 border-b border-[#353534] mb-1">
                    <p className="text-[10px] text-[#A3A3A3]">Email Identity</p>
                    <p className="text-xs font-bold text-[#F5F5F5] truncate">{user?.email || "recruiter@hirespark.io"}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#2d2d30] text-red-400 hover:text-red-300 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Recruiter Work Area Canvas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto py-8 px-6 sm:px-8">
        {children}
      </main>
    </div>
  );
}
