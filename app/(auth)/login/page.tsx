"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, Shield } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(email, password, role);
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to sign in. Please verify credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#221f1f_0%,_#161312_100%)] text-[#e9e1e0] font-sans w-full">
      <div className="w-full max-w-md mx-auto">
        {/* Logo Area */}
        <div className="text-center mb-10">
          <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-[#D2042D] tracking-tight mb-1">
            HireSpark
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A3A3A3] font-semibold opacity-85">
            Enterprise Talent Intelligence
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1e1b1b] border border-[#383433] rounded-xl p-8 shadow-2xl">
          <h2 className="font-sans text-2xl md:text-3xl font-extrabold text-[#e9e1e0] mb-6">
            Welcome back
          </h2>

          {/* Role Toggle for login context */}
          <div className="flex bg-[#100e0d] p-1 rounded border border-[#383433] mb-6">
            <button
              type="button"
              onClick={() => setRole("candidate")}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${
                role === "candidate"
                  ? "bg-[#D2042D] text-white shadow-md shadow-[#D2042D]/15"
                  : "text-[#A3A3A3] hover:text-[#e9e1e0]"
              }`}
            >
              Candidate Portal
            </button>
            <button
              type="button"
              onClick={() => setRole("recruiter")}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${
                role === "recruiter"
                  ? "bg-[#D2042D] text-white shadow-md shadow-[#D2042D]/15"
                  : "text-[#A3A3A3] hover:text-[#e9e1e0]"
              }`}
            >
              Recruiter Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-[#D2042D]/10 border border-[#D2042D]/20 text-[#D2042D] text-xs font-bold rounded">
                {errorMsg}
              </div>
            )}
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-[#A3A3A3]" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="bg-[#100e0d] border border-[#383433] text-[#e9e1e0] block w-full pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-[#D2042D] focus:ring-1 focus:ring-[#D2042D] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A3A3A3]" htmlFor="password">
                  Password
                </label>
                <a className="text-xs text-[#D2042D] hover:underline" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-[#A3A3A3]" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-[#100e0d] border border-[#383433] text-[#e9e1e0] block w-full pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-[#D2042D] focus:ring-1 focus:ring-[#D2042D] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#D2042D] hover:opacity-90 text-white w-full flex justify-center py-3.5 px-4 rounded text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-opacity"
              >
                {isLoading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </div>
          </form>

          {/* Social Sign In Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#383433]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#1e1b1b] text-[#A3A3A3] text-xs font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="bg-[#ecc154] hover:brightness-105 text-[#161312] w-full inline-flex justify-center items-center py-2.5 px-4 rounded text-xs font-bold tracking-wide cursor-pointer transition-all gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-6.886 4.113-4.832 0-8.761-3.929-8.761-8.761s3.929-8.761 8.761-8.761c2.193 0 4.017.805 5.424 2.128l3.14-3.14a13.914 13.914 0 00-8.564-3.21C5.39 0 0 5.39 0 12.012s5.39 12.012 12.012 12.012c6.91 0 11.492-4.86 11.492-11.7 0-.79-.092-1.393-.205-2.039H12.24z"/>
                </svg>
                <span>GOOGLE</span>
              </button>
              <button className="bg-[#ecc154] hover:brightness-105 text-[#161312] w-full inline-flex justify-center items-center py-2.5 px-4 rounded text-xs font-bold tracking-wide cursor-pointer transition-all gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                </svg>
                <span>LINKEDIN</span>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#A3A3A3]">
            Don&apos;t have an account?
            <Link href="/signup" className="text-[#D2042D] font-bold hover:underline ml-1">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-[#A3A3A3]/60 text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Enterprise Access • © 2024 HireSpark</span>
          </p>
        </div>
      </div>
    </div>
  );
}
