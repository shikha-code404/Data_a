"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Brain, 
  Layers, 
  Play, 
  TrendingUp, 
  Compass, 
  Globe, 
  Code
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#F5F5F5] overflow-x-hidden font-sans pb-16">
      {/* Grain Overlay */}
      <div className="grain-overlay" />
      
      {/* Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2d0f0f_1px,transparent_1px),linear-gradient(to_bottom,#2d0f0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 -z-10 pointer-events-none" />

      {/* Translucent Animated Background Image */}
      <div 
        className="absolute top-0 left-0 w-full h-[750px] sm:h-[950px] bg-no-repeat bg-cover bg-center opacity-30 mix-blend-screen -z-10 pointer-events-none animate-slow-pan" 
        style={{ backgroundImage: "url('/tech_bg.png')" }} 
      />

      {/* Floating Glowing Orbs */}
      <div className="absolute top-12 left-[15%] w-[600px] h-[600px] bg-[#D2042D]/20 rounded-full blur-[140px] -z-10 pointer-events-none animate-float-1" />
      <div className="absolute top-[250px] right-[10%] w-[500px] h-[500px] bg-[#ecc154]/10 rounded-full blur-[130px] -z-10 pointer-events-none animate-float-2" />
      <div className="absolute top-[850px] left-[20%] w-[450px] h-[450px] bg-[#D2042D]/15 rounded-full blur-[125px] -z-10 pointer-events-none animate-float-1" />
      <div className="absolute bottom-[300px] right-[15%] w-[550px] h-[550px] bg-[#D2042D]/10 rounded-full blur-[140px] -z-10 pointer-events-none animate-float-2" />

      {/* Glowing Neon Line Header Transition */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D2042D]/40 to-transparent" />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6 sm:px-8 max-w-6xl mx-auto text-center z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2d1b1a]/90 text-[#ffb3b0] border border-[#d2032c]/40 text-xs font-semibold mb-8 shadow-[0_0_25px_rgba(210,4,45,0.25)] backdrop-blur-sm animate-pulse-subtle">
          <Sparkles className="h-3.5 w-3.5 text-[#ecc154]" />
          <span>Next-Gen AI Talent Vetting & Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-[#F5F5F5] mb-6">
          Decode the Anatomy of <br />
          <span className="bg-gradient-to-r from-[#D2042D] via-[#ecc154] to-[#D2042D] bg-clip-text text-transparent text-glow-crimson">
            Top Tech Talent
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-[#A3A3A3] max-w-3xl mx-auto leading-relaxed font-normal mb-10">
          Accelerate screening and engineering growth. HireSpark connects developers with high-performance organizations through deterministic skill radar mapping, automated repo analysis, and sandboxed coding assessments.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#portals"
            className="flex items-center gap-2 px-8 py-4 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-[#D2042D]/35 hover:scale-[1.02] transition-all cursor-pointer font-sans"
          >
            <span>Explore Portals</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#features"
            className="flex items-center justify-center gap-2 px-8 py-4 border border-[#353534] bg-[#1a1a1a]/60 hover:bg-[#262626]/80 text-[#F5F5F5] rounded-xl text-sm font-bold transition-all hover:scale-[1.02] font-sans"
          >
            <Play className="h-4 w-4 text-[#ecc154] fill-[#ecc154]" />
            <span>Watch Demo</span>
          </a>
        </div>
      </section>

      {/* Dual Context Entry Section */}
      <section id="portals" className="py-16 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
            Choose Your Gateway
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2">
            Select your context to access dashboards, workflows, and insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Candidate Card */}
          <div className="glass-card-dark p-8 rounded-2xl border border-[#353534] shadow-2xl flex flex-col justify-between hover:border-[#D2042D]/60 hover:shadow-[0_0_35px_rgba(210,4,45,0.15)] transition-all duration-500 group relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#D2042D]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#D2042D]/10 transition-colors" />
            
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d1b1a] text-[#D2042D] border border-[#d2032c]/20 mb-6 shadow-[0_0_15px_rgba(210,4,45,0.2)] group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-3 font-sans group-hover:text-glow-crimson transition-all">
                Candidate Growth Portal
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#A3A3A3] mb-6">
                Understand your sub-scores via automated repo analytics, browse curated matching jobs, build structured resumes, and complete roadmap goals.
              </p>
              
              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm font-medium text-[#A3A3A3]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#D2042D]" />
                  <span>Visual Talent Radar Graphs & scores</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#D2042D]" />
                  <span>Dynamic AI Job Matches & applications</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#D2042D]" />
                  <span>Tailored Roadmaps & verified skill upgrades</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#353534]/50">
              <Link
                href="/candidate"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md"
              >
                <span>Enter Candidate Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex gap-3 justify-center text-xs text-[#A3A3A3] mt-2">
                <span>New here?</span>
                <Link href="/signup" className="text-[#ecc154] hover:underline font-semibold">
                  Register Account
                </Link>
              </div>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="glass-card-dark p-8 rounded-2xl border border-[#353534] shadow-2xl flex flex-col justify-between hover:border-[#ecc154]/60 hover:shadow-[0_0_35px_rgba(236,193,84,0.08)] transition-all duration-500 group relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#ecc154]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#ecc154]/10 transition-colors" />
            
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#2d251a] text-[#ecc154] border border-[#ecc154]/20 mb-6 shadow-[0_0_15px_rgba(236,193,84,0.2)] group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-3 font-sans group-hover:text-[#ecc154] transition-all">
                Recruiting Operations Center
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-[#A3A3A3] mb-6">
                Query developers using natural language Copilot, track applicants along visual pipeline stages, and manage metrics using real-time graphs.
              </p>

              <ul className="space-y-3.5 mb-8 text-xs sm:text-sm font-medium text-[#A3A3A3]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ecc154]" />
                  <span>AI Natural Language Candidate Search</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ecc154]" />
                  <span>Drag-and-Drop Kanban Vetting Board</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ecc154]" />
                  <span>Talent Score Heatmaps & Sourcing Metrics</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#353534]/50">
              <Link
                href="/recruiter"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#ecc154] hover:bg-[#ecc154]/95 text-zinc-950 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-md"
              >
                <span>Enter Recruiter Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex gap-3 justify-center text-xs text-[#A3A3A3] mt-2">
                <span>Enterprise?</span>
                <Link href="/signup" className="text-[#D2042D] hover:underline font-semibold">
                  Start Vetting Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid Section */}
      <section id="features" className="py-16 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-16">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
            Precision Hiring Infrastructure
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2">
            Automated intelligence tools to evaluate, map, and predict engineering success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Predictive Analytics */}
          <div className="md:col-span-8 glass-card-dark rounded-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative group hover:border-[#D2042D]/40 transition-all duration-300">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#D2042D] mb-4">
                <TrendingUp className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Real-Time Data Mapping</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">Predictive Talent Analytics</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-md leading-relaxed">
                Utilize high-density radar mapping to forecast candidate success based on 150+ behavioral and technical data points.
              </p>
            </div>
            
            <div className="relative h-48 sm:h-64 w-full mt-6 flex items-center justify-center">
              <div className="absolute w-[240px] h-[240px] border border-[#353534]/50 rounded-full flex items-center justify-center">
                <div className="w-[180px] h-[180px] border border-[#353534]/80 rounded-full flex items-center justify-center">
                  <div className="w-[120px] h-[120px] border border-[#D2042D]/30 rounded-full flex items-center justify-center bg-[#D2042D]/5">
                    <Brain className="h-10 w-10 text-[#D2042D] animate-pulse" />
                  </div>
                </div>
              </div>
              <img 
                className="absolute inset-0 w-full h-full object-contain opacity-70 mix-blend-screen transition-opacity duration-500 group-hover:opacity-90 animate-pulse-subtle"
                alt="Talent Radar Chart Visual" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ2e3rg7ukwvydKFbptlxmSGYEkKNgVme404WNxYevqsu7PAL3NiH6NwnyNijpGc0yn6Z2sNngDoEb6YNYv8AK1e7dpUPwHO4TmjA9Wid5nPGiroh7OavgmDMMqMLLZhtu-Hu-jMVsczA34cjUgbojtbTho4WwOwPZAmrJfNMcNFT_anrRHB7suQtNoJr-bVrrTNOWyAlJLPx0rmso91JaRwKyFJmFoXfXS6Ulpl3l9h4UVEiJGaYc" 
              />
            </div>
          </div>

          {/* Card 2: Developer Skill Assessments */}
          <div className="md:col-span-4 glass-card-dark rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-l-4 border-l-[#ecc154] hover:border-[#ecc154]/55 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 text-[#ecc154] mb-4">
                <Code className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Verified Skills</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-3">Technical Verification</h3>
            </div>

            <div className="flex-grow bg-[#09090b] rounded-lg p-4 font-mono text-[11px] text-[#65de85]/80 border border-[#353534]/50 overflow-hidden select-none">
              <div className="flex gap-1.5 items-center mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
              </div>
              <p className="text-[#A3A3A3]">function validateTalent(candidate) &#123;</p>
              <p className="pl-4">const score = candidate.assess();</p>
              <p className="pl-4 text-[#D2042D]">if (score.quality &gt; 0.98) &#123;</p>
              <p className="pl-8 text-[#ecc154]">return HireSpark.match(candidate);</p>
              <p className="pl-4 text-[#D2042D]">&#125;</p>
              <p className="text-[#A3A3A3]">&#125;</p>
              <div className="mt-6 h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent flex items-end">
                <div className="w-full h-1 bg-[#007938] relative">
                  <div className="absolute inset-0 bg-[#65de85] animate-pulse shadow-[0_0_10px_#65de85]"></div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A3A3A3] mt-4 leading-relaxed">
              Automated sandboxed assessments for dev roles with secure, live behavioral playback.
            </p>
          </div>

          {/* Card 3: AI Career Roadmaps */}
          <div className="md:col-span-5 glass-card-dark rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-b-4 border-b-[#D2042D] hover:border-[#D2042D]/55 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 text-[#D2042D] mb-4">
                <Compass className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Retention & growth</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">AI Growth Roadmaps</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
                Dynamic retention strategies powered by automatic career path simulation & skill-gap analysis.
              </p>
            </div>

            <div className="mt-6 space-y-3.5">
              <div>
                <div className="flex justify-between text-[10px] text-[#A3A3A3] mb-1.5 font-mono">
                  <span>SYSTEM ARCHITECTURE</span>
                  <span className="text-[#D2042D] font-bold">85% COMPLETED</span>
                </div>
                <div className="h-2 w-full bg-[#1c1c1e] rounded-full overflow-hidden border border-[#353534]/50">
                  <div className="h-full w-[85%] bg-[#D2042D] rounded-full shadow-[0_0_10px_rgba(210,4,45,0.3)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[#A3A3A3] mb-1.5 font-mono">
                  <span>AI / TRANSFORMERS</span>
                  <span className="text-[#ecc154] font-bold">60% IN PROGRESS</span>
                </div>
                <div className="h-2 w-full bg-[#1c1c1e] rounded-full overflow-hidden border border-[#353534]/50">
                  <div className="h-full w-[60%] bg-[#ecc154] rounded-full shadow-[0_0_10px_rgba(236,193,84,0.3)]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-[#A3A3A3] mb-1.5 font-mono">
                  <span>SECURE WEB DEV</span>
                  <span className="text-[#65de85] font-bold">45% ASSIGNED</span>
                </div>
                <div className="h-2 w-full bg-[#1c1c1e] rounded-full overflow-hidden border border-[#353534]/50">
                  <div className="h-full w-[45%] bg-[#65de85] rounded-full shadow-[0_0_10px_rgba(101,222,133,0.3)]"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Global Talent Pool */}
          <div className="md:col-span-7 glass-card-dark rounded-2xl p-6 sm:p-8 overflow-hidden relative group hover:border-[#ecc154]/40 transition-all duration-300 min-h-[250px]">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-[#ecc154] mb-4">
                <Globe className="h-5 w-5" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">Global Reach</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-2">Universal Sourcing Nodes</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-sm leading-relaxed">
                Connect directly into dynamic global talent registries with verified scoring logs.
              </p>
            </div>

            <div className="absolute inset-0 z-0">
              <div 
                className="w-full h-full opacity-20 grayscale hover:grayscale-0 hover:opacity-30 transition-all duration-700 bg-cover bg-center" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQRwwOgOzmVzs4MkBKHaHar5ByfzgaMrdBDnMH9RouftCTtWUoA6Aein-y6UgOk2gBizqrq7ggMaaUKMvcS0TilBuaS--Bffe8C5dKEFUK1XvCXnDliECJQEAeK9AHTAsRvKDp-dcQOKYFRmEr2x4xA0I8LfxX_aoiCtycXc6TCt7VatCKvEU7vx1ugAMxcB-J9okSPdkLsCvQW6dNu6TzFACAO9labwFZj8sRWlkz4Xv39O3pajrv')` }}
              />
            </div>
            
            <div className="absolute bottom-6 right-6 z-10 flex gap-2">
              <div className="bg-[#1c1c1e]/85 backdrop-blur px-3 py-1.5 rounded border border-[#353534] text-[9px] text-[#A3A3A3] font-mono">
                ACTIVE_NODES: 14,293
              </div>
              <div className="bg-[#D2042D]/15 backdrop-blur px-3 py-1.5 rounded border border-[#D2042D]/40 text-[9px] text-[#D2042D] font-mono animate-pulse">
                LIVE_SYNC
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" className="py-20 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-16">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
            Deterministic AI Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2 max-w-xl mx-auto">
            Deep vetting infrastructure analyzing raw repositories, keystrokes, and coding authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info cards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card-dark p-6 rounded-xl border border-[#353534]/80 flex gap-4 hover:border-[#D2042D]/40 transition-colors">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#2d1b1a] border border-[#d2032c]/20 flex items-center justify-center text-[#D2042D]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F5F5F5] mb-1">Automated Repo Analytics</h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Evaluates historical git contributions, commit frequencies, complexity indicators, and code quality sub-scores automatically to generate developer scores.
                </p>
              </div>
            </div>

            <div className="glass-card-dark p-6 rounded-xl border border-[#353534]/80 flex gap-4 hover:border-[#ecc154]/40 transition-colors">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#2d251a] border border-[#ecc154]/20 flex items-center justify-center text-[#ecc154]">
                <Play className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F5F5F5] mb-1">Behavioral Sandbox Playback</h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Every keystroke in the coding assessment is registered. Hiring managers can play back code construction stroke-by-stroke to verify developer reasoning.
                </p>
              </div>
            </div>

            <div className="glass-card-dark p-6 rounded-xl border border-[#353534]/80 flex gap-4 hover:border-[#65de85]/40 transition-colors">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-[#1a2d20] border border-[#65de85]/20 flex items-center justify-center text-[#65de85]">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F5F5F5] mb-1">Authenticity & Fraud Vetting</h4>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Monitors tab shifts, clipboard modifications, copy-paste events, and assessment anomalies. Highlights cheating or generative copypasting instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Right graphics panel */}
          <div className="lg:col-span-6 glass-card-dark p-8 rounded-2xl border border-[#353534] shadow-2xl relative overflow-hidden h-[380px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D2042D]/5 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="flex justify-between items-center pb-4 border-b border-[#353534]/50">
              <div>
                <p className="text-[10px] text-[#A3A3A3] font-mono">ASSESSMENT INSTANCE: #9832</p>
                <h4 className="text-sm font-bold text-[#F5F5F5] mt-0.5">Integrity & Authenticity Log</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#1a2d20] text-[#65de85] text-[10px] font-mono border border-[#65de85]/25 animate-pulse">
                SECURE_RUN
              </span>
            </div>

            <div className="space-y-3.5 my-6 font-mono text-[10px] text-[#A3A3A3] flex-grow overflow-hidden pr-2">
              <div className="flex justify-between items-center border-b border-[#353534]/30 pb-2">
                <span>Assess.Init()</span>
                <span className="text-[#65de85]">SUCCESS (0.01s)</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#353534]/30 pb-2">
                <span>Tab Focus Shift Checked</span>
                <span className="text-[#65de85]">0 Anomalies</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#353534]/30 pb-2">
                <span>Clipboard Write Lock</span>
                <span className="text-[#65de85]">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#353534]/30 pb-2">
                <span>Copy-Paste Triggers</span>
                <span className="text-[#D2042D] font-bold">1 BLOCK BLOCKED</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#353534]/30 pb-2">
                <span>Keystroke Rhythm Signature</span>
                <span className="text-[#ecc154]">98.2% Human Match</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#353534]/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#65de85] animate-ping" />
                <span className="text-[#F5F5F5] font-semibold">Active Integrity Score</span>
              </div>
              <span className="text-[#65de85] font-bold text-sm">99.4/100</span>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="border-y border-[#353534]/50 bg-[#0f0f10] py-16 relative z-10">
        <div className="px-6 sm:px-8 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-[#D2042D] text-glow-crimson font-mono">99.8%</p>
            <p className="text-[10px] sm:text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Placement Accuracy</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-[#ecc154] font-mono">1.2s</p>
            <p className="text-[10px] sm:text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Matching Latency</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-[#65de85] font-mono">40%</p>
            <p className="text-[10px] sm:text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Retention Uplift</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-[#F5F5F5] font-mono">500+</p>
            <p className="text-[10px] sm:text-xs font-bold text-[#A3A3A3] uppercase tracking-widest">Fortune Entities</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 sm:px-8 max-w-6xl mx-auto relative z-10 scroll-mt-16">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
            Transparent Pricing Models
          </h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-2 max-w-xl mx-auto">
            Choose the package tailored to your career growth or recruitment volume requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tier 1: Developer */}
          <div className="glass-card-dark p-8 rounded-2xl border border-[#353534] flex flex-col justify-between hover:border-[#A3A3A3]/50 transition-colors group">
            <div>
              <p className="text-xs font-bold text-[#A3A3A3] tracking-widest uppercase mb-1">Developer Portal</p>
              <h3 className="text-2xl font-black text-[#F5F5F5] mb-4">Always Free</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-6">
                Perfect for engineers seeking to vet their skills, earn score badges, and discover jobs.
              </p>
              <div className="w-full h-[1px] bg-[#353534]/50 my-4" />
              <ul className="space-y-3.5 text-xs text-[#A3A3A3] mb-8 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Build 1 Professional Resume</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Interactive Skill Radar Map</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Generate Career Roadmap Goals</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Submit to 10 Job Matches / mo</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 text-center border border-[#353534] bg-[#1a1a1a]/40 hover:bg-[#262626]/80 text-[#F5F5F5] rounded-xl text-xs font-bold hover:scale-[1.02] transition-transform"
            >
              Sign Up As Candidate
            </Link>
          </div>

          {/* Tier 2: Recruiter Growth */}
          <div className="glass-card-dark p-8 rounded-2xl border-2 border-[#D2042D] flex flex-col justify-between hover:shadow-[0_0_30px_rgba(210,4,45,0.08)] transition-all group relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-[#D2042D] text-white text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow">
              Popular
            </div>
            <div>
              <p className="text-xs font-bold text-[#ffb3b0] tracking-widest uppercase mb-1">Growth Vetting</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-[#F5F5F5]">$199</span>
                <span className="text-xs text-[#A3A3A3]">/ month</span>
              </div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-6">
                Designed for expanding startups seeking deterministic coding evaluation and pipeline sync.
              </p>
              <div className="w-full h-[1px] bg-[#D2042D]/20 my-4" />
              <ul className="space-y-3.5 text-xs text-[#A3A3A3] mb-8 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span className="text-[#F5F5F5]">50 Candidate Copilot Searches</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Keystroke & Sandbox Replays</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Visual Kanban Pipeline Sync</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#D2042D]" />
                  <span>Detailed Radar Sub-Score Audits</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 text-center bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs font-bold shadow-lg shadow-[#D2042D]/15 hover:scale-[1.02] transition-transform"
            >
              Get Started Free Trial
            </Link>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="glass-card-dark p-8 rounded-2xl border border-[#353534] flex flex-col justify-between hover:border-[#ecc154]/50 transition-colors group">
            <div>
              <p className="text-xs font-bold text-[#ecc154] tracking-widest uppercase mb-1">Enterprise Intelligence</p>
              <h3 className="text-2xl font-black text-[#F5F5F5] mb-4">Custom Quote</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-6">
                Complete intelligence suite with advanced anti-fraud filters, heatmaps, and API hooks.
              </p>
              <div className="w-full h-[1px] bg-[#353534]/50 my-4" />
              <ul className="space-y-3.5 text-xs text-[#A3A3A3] mb-8 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ecc154]" />
                  <span>Unlimited Natural Language Queries</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ecc154]" />
                  <span>Multi-Tab & Copy-Paste Fraud Flags</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ecc154]" />
                  <span>Team-Level Contribution Heatmaps</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#ecc154]" />
                  <span>Custom ATS & Slack API Webhooks</span>
                </li>
              </ul>
            </div>
            <Link
              href="/signup"
              className="w-full py-3 text-center border border-[#353534] bg-[#1a1a1a]/40 hover:bg-[#262626]/80 text-[#F5F5F5] rounded-xl text-xs font-bold hover:scale-[1.02] transition-transform"
            >
              Contact Recruiting Ops
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 text-center relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D2042D]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black leading-tight text-[#F5F5F5]">
            Ready to ignite your pipeline?
          </h2>
          <p className="text-xs sm:text-base text-[#A3A3A3] leading-relaxed max-w-xl mx-auto">
            Join thousands of elite organizations and developers using HireSpark to eliminate hiring bias and maximize potential.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-[#D2042D] text-white hover:bg-[#D2042D]/90 rounded-xl font-bold text-sm shadow-xl shadow-[#D2042D]/15 hover:scale-[1.02] transition-transform font-sans"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 border border-[#353534] bg-[#1a1a1a]/40 hover:bg-[#262626]/60 text-[#F5F5F5] rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform font-sans"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#353534]/50 bg-[#070708] mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 sm:px-8 py-8 max-w-6xl mx-auto gap-6 z-10 relative">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="text-base font-bold text-[#F5F5F5]">HireSpark</div>
            <p className="text-[10px] text-[#A3A3A3]">© {new Date().getFullYear()} HireSpark AI. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-xs text-[#A3A3A3] hover:text-[#ecc154] transition-colors" href="#">Privacy Policy</a>
            <a className="text-xs text-[#A3A3A3] hover:text-[#ecc154] transition-colors" href="#">Terms of Service</a>
            <a className="text-xs text-[#A3A3A3] hover:text-[#ecc154] transition-colors" href="#">Security</a>
            <a className="text-xs text-[#A3A3A3] hover:text-[#ecc154] transition-colors" href="#">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


