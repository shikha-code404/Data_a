"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, LogOut, User as UserIcon, Menu, X, ChevronDown, Award } from "lucide-react";

export const TopNav: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#353534]/50 bg-[#131313]/90 backdrop-blur-md text-[#F5F5F5]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <img 
              alt="HireSpark Logo" 
              className="h-8 w-8 object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLM6HEO2DzrEuWWj176e58UdzEkq8ftj42F0gHojJQreu-uiYIV_xRcXfaKLMbaKB1iJb2YwVg-i_f0zmc19tgpP7bMHUmBzEs4ZM6f-JS1UiRq0IPZoiTZK70PVBjV5ifLTIy1MoCZrJLQFJdQLgtx2ykunE48DwwDfmpK4T7M2bPD3H2CGOWVGfuOntmILvSqIh5ipBg9aweTSheYqk9EhNUrdGQSDdnKNIkHBhyafwAR5fOjXSLtgDFYx31ASJ_Dw" 
            />
            <span className="hidden sm:inline text-lg font-bold text-[#D2042D] tracking-wide font-sans">
              HireSpark
            </span>
            <span className="sm:hidden text-lg font-extrabold text-[#D2042D]">HS</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8 text-xs font-semibold text-[#A3A3A3]">
          <Link href="/#portals" className="hover:text-[#F5F5F5] transition-colors duration-200">
            Portals
          </Link>
          <Link href="/#features" className="hover:text-[#F5F5F5] transition-colors duration-200">
            Features
          </Link>
          <Link href="/#intelligence" className="hover:text-[#F5F5F5] transition-colors duration-200">
            Intelligence
          </Link>
          <Link href="/#pricing" className="hover:text-[#F5F5F5] transition-colors duration-200">
            Pricing
          </Link>
        </nav>



        {/* Desktop Navigation / User Info */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 rounded bg-zinc-800 animate-pulse-subtle"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-[#353534] bg-[#262626]/50 hover:bg-[#353534]/50 transition-all duration-200"
              >
                <div className="h-7 w-7 rounded-full bg-[#D2042D] text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-[#F5F5F5] leading-3">
                    {user.name}
                  </p>
                  <span className="text-[10px] text-[#A3A3A3] font-medium capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 text-[#A3A3A3] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-[#353534] bg-[#262626] p-1.5 shadow-xl z-40">
                    <div className="px-3 py-2 border-b border-[#353534] mb-1">
                      <p className="text-xs text-[#A3A3A3]">Signed in as</p>
                      <p className="text-xs font-bold text-[#F5F5F5] truncate">{user.email}</p>
                    </div>

                    <Link
                      href={user.role === "candidate" ? "/candidate" : "/recruiter"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#A3A3A3] hover:bg-[#353534] hover:text-[#F5F5F5] transition-colors"
                    >
                      <Award className="h-4 w-4 text-[#A3A3A3]" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-450 hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>

                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors font-sans"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-xs font-bold bg-[#D2042D] text-white hover:bg-[#D2042D]/90 rounded-lg shadow-sm shadow-[#D2042D]/20 transition-all hover:scale-[1.02] font-sans"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#262626] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#353534] bg-[#131313] px-4 py-4 md:hidden animate-in slide-in-from-top-4 duration-200">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 border-b border-[#353534] pb-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#D2042D] text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5F5F5]">{user.name}</p>
                  <p className="text-xs text-[#A3A3A3] capitalize">{user.role} role</p>
                </div>
              </div>
              <Link
                href={user.role === "candidate" ? "/candidate" : "/recruiter"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-[#D2042D] hover:bg-red-950/10 rounded"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-[#A3A3A3] border border-[#353534] rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold bg-[#D2042D] text-white rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export const ConditionalTopNav: React.FC = () => {
  const pathname = usePathname();
  const hideNav = pathname?.startsWith("/candidate") || pathname?.startsWith("/recruiter") || pathname?.startsWith("/internal");

  if (hideNav) return null;

  return <TopNav />;
};

export default TopNav;
