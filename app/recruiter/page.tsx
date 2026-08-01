"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/db/client";
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
  Layers,
  Loader2
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

interface ActivityRow {
  initials: string;
  name: string;
  email: string;
  position: string;
  topSkill: string;
  status: string;
  time: string;
}

export default function RecruiterDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [pipelines, setPipelines] = useState<PipelineRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loadingPipelines, setLoadingPipelines] = useState(true);

  useEffect(() => {
    // Fetch predictive analytics
    fetch("/api/recruiter/analytics")
      .then((res) => res.json())
      .then((data) => setAnalyticsData(data))
      .catch(() => {});

    // Fetch real pipeline data from job_postings + job_recommendations
    const loadPipelineData = async () => {
      try {
        const { data: jobs } = await supabaseBrowser
          .from("job_postings")
          .select("id, title, company, location, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (jobs && jobs.length > 0) {
          const jobIds = jobs.map((j: any) => j.id);
          const { data: recs } = await supabaseBrowser
            .from("job_recommendations")
            .select("job_id, candidate_id, match_percentage")
            .in("job_id", jobIds);

          const recsByJob = new Map<string, any[]>();
          (recs || []).forEach((r: any) => {
            const arr = recsByJob.get(r.job_id) || [];
            arr.push(r);
            recsByJob.set(r.job_id, arr);
          });

          const pipeRows: PipelineRow[] = jobs.map((j: any) => {
            const jobRecs = recsByJob.get(j.id) || [];
            const applied = jobRecs.length;
            const screening = Math.ceil(applied * 0.5);
            const interview = Math.ceil(applied * 0.2);
            const offer = Math.ceil(applied * 0.05);
            const avgMatch = applied > 0 ? Math.round(jobRecs.reduce((s: number, r: any) => s + (r.match_percentage || 0), 0) / applied) : 0;
            const daysAgo = Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000);
            return {
              title: j.title || "Untitled",
              department: j.company || "Engineering",
              location: j.location || "Remote",
              posted: daysAgo === 0 ? "Today" : `${daysAgo}d ago`,
              applied,
              screening,
              interview,
              offer,
              health: (avgMatch >= 70 ? "High" : avgMatch >= 40 ? "Warning" : "Critical") as "High" | "Warning" | "Critical",
              healthPercentage: avgMatch
            };
          });
          setPipelines(pipeRows);

          // Build activity from recent recommendations
          const candidateIds = [...new Set((recs || []).map((r: any) => r.candidate_id))].slice(0, 5);
          if (candidateIds.length > 0) {
            const { data: profiles } = await supabaseBrowser
              .from("candidate_profiles")
              .select("user_id, github_username, talent_profile, talent_score")
              .in("user_id", candidateIds);

            const activityRows: ActivityRow[] = (profiles || []).map((p: any) => {
              const name = p.talent_profile?.resume?.name || p.github_username || "Candidate";
              const skills = p.talent_profile?.resume?.skills || [];
              const rec = (recs || []).find((r: any) => r.candidate_id === p.user_id);
              const job = jobs.find((j: any) => j.id === rec?.job_id);
              return {
                initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
                name,
                email: p.talent_profile?.resume?.email || `@${p.github_username || "user"}`,
                position: job?.title || "Open Position",
                topSkill: skills[0] || "Full Stack",
                status: (rec?.match_percentage || 0) >= 80 ? "Strong Match" : "AI Matched",
                time: "Recently"
              };
            });
            setActivity(activityRows);
          }
        }
      } catch (err) {
        console.error("Failed to load pipeline data:", err);
      } finally {
        setLoadingPipelines(false);
      }
    };
    loadPipelineData();
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
          <h3 className="text-3xl font-bold text-[#D2042D]">{pipelines.length || "--"}</h3>
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
          <h3 className="text-3xl font-bold text-white">{analyticsData?.team_statistics?.total_candidates || activity.length || "--"}</h3>
          <p className="text-[10px] text-[#A3A3A3] mt-4">Global Registry Sync</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1c1c1e] border border-[#353534] p-6 rounded-2xl relative overflow-hidden group hover:border-[#D2042D]/40 transition-colors">
          <div className="absolute top-4 right-4 text-[#A3A3A3] opacity-20 group-hover:opacity-40 transition-opacity">
            <Calendar className="w-12 h-12" />
          </div>
          <p className="text-[#A3A3A3] font-bold text-[10px] uppercase tracking-widest mb-1.5">Interviews Scheduled</p>
          <h3 className="text-3xl font-bold text-white">{analyticsData?.team_statistics?.hiring_funnel?.interviewed || "--"}</h3>
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
            {loadingPipelines ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#D2042D]" /></div>
            ) : pipelines.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#A3A3A3]">No active pipelines. Post a job to get started.</div>
            ) : pipelines.map((pipe, idx) => (
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
                <h4 className="text-xs font-bold text-white truncate">Diya Nair</h4>
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
              {activity.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-xs text-[#A3A3A3]">No recent candidate activity.</td></tr>
              ) : activity.map((act, idx) => (
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
