"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Connect to real Supabase Auth endpoint
    // Currently stubbed with simulation redirect
    setTimeout(() => {
      login(email, role);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-8 shadow-xl shadow-zinc-150/10 dark:shadow-none">
        {/* Branding & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome Back
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Log in to manage your AI Talent Profiles or Pipeline
          </p>
        </div>

        {/* Role Toggle for simulated login context */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg mb-6 border border-zinc-200/40 dark:border-zinc-850">
          <button
            type="button"
            onClick={() => setRole("candidate")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              role === "candidate"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Candidate Portal
          </button>
          <button
            type="button"
            onClick={() => setRole("recruiter")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              role === "recruiter"
                ? "bg-white dark:bg-zinc-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Recruiter Portal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-450/10 dark:focus:border-indigo-450 transition-all text-zinc-905 dark:text-zinc-100"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                Password
              </label>
              <a href="#" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-405 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-450/10 dark:focus:border-indigo-450 transition-all text-zinc-905 dark:text-zinc-100"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
              role === "candidate"
                ? "bg-indigo-600 hover:bg-indigo-705 shadow-indigo-500/10"
                : "bg-violet-600 hover:bg-violet-705 shadow-violet-500/10"
            }`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-405 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
