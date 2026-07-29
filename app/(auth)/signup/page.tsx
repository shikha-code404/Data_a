"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Connect to real Supabase Auth signup endpoints
    // Currently stubbed with simulation redirect
    setTimeout(() => {
      signup(name, email, role);
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
            Create Platform Account
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Join the AI Talent Intelligence & Recruitment ecosystem
          </p>
        </div>

        {/* Role Toggle Choice */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-350">
            Choose Your Workspace Context
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${
                role === "candidate"
                  ? "border-indigo-500 bg-indigo-50/20 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-950/10 dark:text-indigo-400 font-bold"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              }`}
            >
              <UserIcon className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
              <div className="text-xs font-semibold">I&apos;m a Candidate</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-center ${
                role === "recruiter"
                  ? "border-violet-500 bg-violet-50/20 text-violet-700 dark:border-violet-600 dark:bg-violet-950/10 dark:text-violet-400 font-bold"
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-850"
              }`}
            >
              <Sparkles className="h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
              <div className="text-xs font-semibold">I&apos;m a Recruiter</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-450/10 dark:focus:border-indigo-450 transition-all text-zinc-905 dark:text-zinc-100"
              />
              <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:ring-indigo-450/10 dark:focus:border-indigo-450 transition-all text-zinc-905 dark:text-zinc-100"
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
            {isLoading ? "Creating Profile..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-405 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
