"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Video,
  MoreVertical,
  Activity,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Layers
} from "lucide-react";

interface PipelineRow {
  title: string;
  department: string;
  location: string;
  posted: string;
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  health: "High" | "Warning" | "Critical";
  healthPercentage: number;
}

const mockPipelines: PipelineRow[] = [
  {
    title: "Senior Front-End Engineer",
    department: "Engineering",
    location: "London, UK",
    posted: "4d ago",
    applied: 42,
    screening: 12,
    interview: 4,
    offer: 1,
    health: "High",
    healthPercentage: 88
  },
  {
    title: "Product Designer (L5)",
    department: "Design",
    location: "San Francisco, CA",
    posted: "1w ago",
    applied: 18,
    screening: 8,
    interview: 6,
    offer: 0,
    health: "Warning",
    healthPercentage: 45
  },
  {
    title: "Data Platform Architect",
    department: "Data Engineering",
    location: "Remote",
    posted: "2d ago",
    applied: 29,
    screening: 15,
    interview: 2,
    offer: 0,
    health: "High",
    healthPercentage: 92
  }
];

interface ActivityRow {
  initials: string;
  name: string;
  email: string;
  position: string;
  topSkill: string;
  status: string;
  time: string;
}

const mockActivity: ActivityRow[] = [
  {
    initials: "MK",
    name: "Marcus Knight",
    email: "m.knight@cloud.io",
    position: "Senior FE Engineer",
    topSkill: "Next.js Architecture",
    status: "New Applied",
    time: "12m ago"
  },
  {
    initials: "ER",
    name: "Elena Rostova",
    email: "e.rostova@yandex.ru",
    position: "Full Stack Lead",
    topSkill: "Supabase Vector RLS",
    status: "Interviewing",
    time: "2h ago"
  },
  {
    initials: "AR",
    name: "Alex Rivera",
    email: "rivera.a@ml.co",
    position: "ML Engineer",
    topSkill: "Python & PyTorch",
    status: "Offer Extended",
    time: "1d ago"
  }
];

export default function RecruiterDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Fetch predictive analytics on load
  useEffect(() => {
    fetch("/api/recruiter/analytics")
      .then((res) => res.json())
      .then((data) => setAnalyticsData(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 bg-[#131313] text-[#F5F5F5]">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D2042D]">Enterprise Ops</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Hiring Analytics Dashboard</h1>
          <p className="text-sm text-[#A3A3A3] mt-1">
            Predictive talent intelligence logs, active candidate feeds, and real-time conversion rates.
          </p>
        </div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D2042D]/15 self-start md:self-auto"
        >
          <span>Create Job Posting</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Phase 7 Predictive Hiring Analytics Summary Widget */}
      {analyticsData && analyticsData.team_statistics && (
        <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#D2042D]/5 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-[#353534]/60 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#D2042D]/15 border border-[#D2042D]/35 text-[#D2042D] rounded-lg text-[10px] font-bold uppercase tracking-wider">
                AI Predictive Analytics
              </span>
              <h2 className="text-sm font-bold text-white">Pipeline Intelligence Audit Summary</h2>
            </div>
            <span className="text-[10px] font-mono text-[#A3A3A3] bg-[#0c0c0e] border border-[#353534] px-2.5 py-1 rounded">
              GET /api/recruiter/analytics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Stat 1: Funnel */}
            <div className="lg:col-span-2 bg-[#131313]/60 border border-[#353534]/50 rounded-xl p-4">
              <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block mb-3">Hiring Funnel Status</span>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="bg-[#1c1c1e] border border-[#353534] rounded p-2">
                  <span className="text-sm font-bold text-white block">{analyticsData.team_statistics.hiring_funnel?.total_candidates || 12}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-0.5">Total</span>
                </div>
                <div className="bg-[#1c1c1e] border border-[#353534] rounded p-2">
                  <span className="text-sm font-bold text-white block">{analyticsData.team_statistics.hiring_funnel?.screened || 12}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-0.5">Screen</span>
                </div>
                <div className="bg-[#1c1c1e] border border-[#353534] rounded p-2">
                  <span className="text-sm font-bold text-[#D2042D] block">{analyticsData.team_statistics.hiring_funnel?.interviewed || 10}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-0.5">Intvw</span>
                </div>
                <div className="bg-[#1c1c1e] border border-[#353534] rounded p-2">
                  <span className="text-sm font-bold text-[#65de85] block">{analyticsData.team_statistics.hiring_funnel?.verified || 10}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-0.5">Verify</span>
                </div>
                <div className="bg-[#1c1c1e] border border-[#353534] rounded p-2">
                  <span className="text-sm font-bold text-[#ecc154] block">{analyticsData.team_statistics.hiring_funnel?.offer_ready || 3}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-0.5">Offer</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Avg Talent Score & Match */}
            <div className="bg-[#131313]/60 border border-[#353534]/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Average Metrics</span>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-2xl font-extrabold text-[#65de85] block leading-none">{analyticsData.team_statistics.average_talent_score || 86.5}</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-1">Talent Score</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[#ecc154] block leading-none">{analyticsData.team_statistics.average_match_percentage || 89.2}%</span>
                  <span className="text-[9px] text-[#A3A3A3] block mt-1">Match Rate</span>
                </div>
              </div>
            </div>

            {/* Stat 3: Fraud Distribution */}
            <div className="bg-[#131313]/60 border border-[#353534]/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Integrity Risk Logs</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 bg-[#1a2d20] text-[#65de85] border border-[#65de85]/20 text-[10px] font-bold rounded">
                  Low: {analyticsData.team_statistics.fraud_distribution?.low_risk || 9}
                </span>
                <span className="px-2 py-0.5 bg-[#2d251a] text-[#ecc154] border border-[#ecc154]/20 text-[10px] font-bold rounded">
                  Med: {analyticsData.team_statistics.fraud_distribution?.medium_risk || 2}
                </span>
                <span className="px-2 py-0.5 bg-[#2d1b1a] text-[#D2042D] border border-[#d2032c]/20 text-[10px] font-bold rounded">
                  High: {analyticsData.team_statistics.fraud_distribution?.high_risk || 0}
                </span>
              </div>
            </div>

            {/* Stat 4: Interview Conversion */}
            <div className="bg-[#131313]/60 border border-[#353534]/50 rounded-xl p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider block">Conversion Passes</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-extrabold text-[#D2042D]">{analyticsData.team_statistics.interview_conversion_rate || 91}%</span>
                <span className="text-[9px] text-[#65de85] bg-[#1a2d20] px-2 py-0.5 rounded border border-[#65de85]/25">Auto Audit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-[#1c1c1e] border border-[#353534] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D2042D]/40 transition-colors">
          <div className="absolute top-4 right-4 text-[#A3A3A3] opacity-20 group-hover:opacity-40 transition-opacity">
            <Layers className="w-12 h-12" />
          </div>
          <p className="text-[#A3A3A3] font-bold text-[10px] uppercase tracking-widest mb-1.5">Active Pipelines</p>
          <h3 className="text-3xl font-bold text-[#D2042D]">12</h3>
          <div className="mt-4 flex items-center gap-1 text-[#65de85] text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 this week</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1c1c1e] border border-[#353534] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D2042D]/40 transition-colors">
          <div className="absolute top-4 right-4 text-[#A3A3A3] opacity-20 group-hover:opacity-40 transition-opacity">
            <Users className="w-12 h-12" />
          </div>
          <p className="text-[#A3A3A3] font-bold text-[10px] uppercase tracking-widest mb-1.5">Total Candidates</p>
          <h3 className="text-3xl font-bold text-white">1.2k</h3>
          <p className="text-[10px] text-[#A3A3A3] mt-4">Global Registry Sync</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1c1c1e] border border-[#353534] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D2042D]/40 transition-colors">
          <div className="absolute top-4 right-4 text-[#A3A3A3] opacity-20 group-hover:opacity-40 transition-opacity">
            <Calendar className="w-12 h-12" />
          </div>
          <p className="text-[#A3A3A3] font-bold text-[10px] uppercase tracking-widest mb-1.5">Interviews Scheduled</p>
          <h3 className="text-3xl font-bold text-white">08</h3>
          <div className="mt-4 text-[#ecc154] text-xs font-semibold">
            <span>3 remaining today</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1c1c1e] border border-[#353534] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D2042D]/40 transition-colors">
          <div className="absolute top-4 right-4 text-[#A3A3A3] opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles className="w-12 h-12" />
          </div>
          <p className="text-[#A3A3A3] font-bold text-[10px] uppercase tracking-widest mb-1.5">AI-Predicted Hires</p>
          <h3 className="text-3xl font-bold text-[#65de85]">05</h3>
          <p className="text-[10px] text-[#65de85] mt-4">86% Confidence Rating</p>
        </div>
      </section>

      {/* Main Grid Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Pipelines Table */}
        <section className="lg:col-span-8 bg-[#1c1c1e] border border-[#353534] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="px-6 py-4 border-b border-[#353534]/60 flex justify-between items-center bg-[#131313]/30">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-[#D2042D]" /> Active Pipelines
            </h2>
            <Link 
              href="/recruiter/pipeline" 
              className="text-[#D2042D] hover:underline text-xs font-bold flex items-center gap-1 transition-all"
            >
              <span>View Pipeline Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {mockPipelines.map((pipe, idx) => (
              <div 
                key={idx} 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-[#2d2d30]/30 rounded-xl border border-transparent hover:border-[#353534] transition-all"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{pipe.title}</h4>
                  <p className="text-[10px] text-[#A3A3A3]">{pipe.department} · {pipe.location} · Posted {pipe.posted}</p>
                </div>
                
                <div className="flex items-center gap-8 md:justify-end shrink-0">
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className="text-sm font-bold text-white">{pipe.applied}</p>
                      <p className="text-[8px] text-[#A3A3A3] uppercase">Applied</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{pipe.screening}</p>
                      <p className="text-[8px] text-[#A3A3A3] uppercase">Screen</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#D2042D]">{pipe.interview}</p>
                      <p className="text-[8px] text-[#A3A3A3] uppercase">Intvw</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#65de85]">{pipe.offer}</p>
                      <p className="text-[8px] text-[#A3A3A3] uppercase">Offer</p>
                    </div>
                  </div>

                  <div className="w-24">
                    <div className="flex justify-between items-center mb-1 text-[9px]">
                      <span className="text-[#A3A3A3] uppercase">AI Health</span>
                      <span className={`font-bold ${
                        pipe.health === "High" ? "text-[#65de85]" : "text-[#ecc154]"
                      }`}>{pipe.health}</span>
                    </div>
                    <div className="w-full bg-[#131313] h-1 rounded-full overflow-hidden border border-[#353534]/50">
                      <div className={`h-full ${
                        pipe.health === "High" ? "bg-[#65de85]" : "bg-[#ecc154]"
                      }`} style={{ width: `${pipe.healthPercentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Interviews Calendar widget */}
        <section className="lg:col-span-4 bg-[#1c1c1e] border border-[#353534] rounded-2xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-6 py-4 border-b border-[#353534]/60 flex justify-between items-center bg-[#131313]/30">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-[#ecc154]" /> Upcoming Today
            </h2>
            <Link href="/recruiter/interviews" className="text-[#A3A3A3] hover:text-[#F5F5F5]">
              <MoreVertical className="w-4.5 h-4.5" />
            </Link>
          </div>

          <div className="p-6 flex-1 space-y-4">
            <div className="flex gap-4 p-4 bg-[#131313]/55 border border-[#353534]/70 rounded-xl">
              <div className="flex flex-col items-center justify-center bg-[#D2042D]/10 px-3 py-2 rounded-lg border border-[#D2042D]/20 min-w-[70px] shrink-0 font-mono text-center">
                <span className="text-[9px] font-bold text-[#D2042D] uppercase">Today</span>
                <span className="text-sm font-bold text-[#F5F5F5] mt-0.5">14:00</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">Sarah Jenkins</h4>
                <p className="text-[10px] text-[#A3A3A3] truncate">Product Designer (L5)</p>
                <Link
                  href="/recruiter/interviews"
                  className="mt-3.5 w-full py-1.5 bg-[#2d2d30] hover:bg-[#D2042D] hover:text-white transition-all text-white border border-[#353534] rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Join Zoom Call
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Recent Candidate Activity Table */}
      <section className="bg-[#1c1c1e] border border-[#353534] rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-[#353534]/60 flex justify-between items-center bg-[#131313]/30">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Recent Candidate Activity</h2>
            <span className="px-2 py-0.5 bg-[#1a2d20] text-[#65de85] rounded text-[8px] font-black uppercase tracking-widest border border-[#65de85]/20 animate-pulse">
              Real-time
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0">
            <thead>
              <tr className="bg-[#131313]/50 text-[#A3A3A3] border-b border-[#353534] text-[10px] font-semibold uppercase tracking-wider">
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Applied Position</th>
                <th className="px-6 py-3.5">Top Skill (AI Parsed)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Time Log</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#353534]/40 text-xs text-[#F5F5F5]">
              {mockActivity.map((act, idx) => (
                <tr key={idx} className="hover:bg-[#2d2d30]/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#353534] border border-[#353534] flex items-center justify-center font-bold text-[#F5F5F5] uppercase shrink-0 text-xs shadow-inner">
                        {act.initials}
                      </div>
                      <div>
                        <p className="font-bold text-[#F5F5F5] leading-none">{act.name}</p>
                        <p className="text-[10px] text-[#A3A3A3] mt-1">{act.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#F5F5F5]">{act.position}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#D2042D]/5 text-[#D2042D] border border-[#D2042D]/20 rounded-full text-[10px] font-semibold">
                      {act.topSkill}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        act.status === "New Applied" ? "bg-[#ecc154]" :
                        act.status === "Interviewing" ? "bg-[#D2042D]" : "bg-[#65de85]"
                      }`} />
                      <span>{act.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A3A3A3] font-mono text-[10px]">{act.time}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href="/recruiter/discovery"
                      className="p-1.5 hover:bg-[#353534] text-[#A3A3A3] hover:text-[#D2042D] rounded-lg transition-all inline-flex items-center justify-center border border-transparent hover:border-[#353534]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
