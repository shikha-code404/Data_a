"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, LogOut, User as UserIcon, Menu, X, ChevronDown, Award } from "lucide-react";

export const TopNav: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50 hover:opacity-90 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-indigo-900 to-violet-700 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent font-extrabold tracking-tight">
              Antigravity AI
            </span>
            <span className="sm:hidden font-extrabold text-indigo-600 dark:text-indigo-400">AAI</span>
          </Link>
        </div>

        {/* Desktop Navigation / User Info */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse-subtle"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
              >
                <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/40">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-3">
                    {user.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-lg shadow-zinc-100/50 dark:shadow-none z-40">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                      <p className="text-xs text-zinc-400">Signed in as</p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={user.role === "candidate" ? "/candidate" : "/recruiter"}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Award className="h-4 w-4 text-zinc-400" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
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
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/10 transition-colors"
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
            className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 md:hidden animate-in slide-in-from-top-4 duration-200">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2 border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-250">{user.name}</p>
                  <p className="text-xs text-zinc-400 capitalize">{user.role} role</p>
                </div>
              </div>
              <Link
                href={user.role === "candidate" ? "/candidate" : "/recruiter"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/10 rounded"
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
                className="w-full text-center py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-850 rounded-lg"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg"
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

export default TopNav;
