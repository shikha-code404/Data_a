"use client";

import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  Loader2,
  Video,
  FileText,
  ShieldCheck,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Star,
  Brain
} from "lucide-react";

interface ScheduledInterview {
  name: string;
  avatar: string;
  role: string;
  date: string;
  time: string;
  link: string;
  status: "Confirmed" | "Completed" | "Pending";
}

const mockInterviews: ScheduledInterview[] = [
  {
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Product Designer (L5)",
    date: "Today, July 31",
    time: "14:00",
    link: "https://zoom.us/test",
    status: "Confirmed"
  },
  {
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Senior Full Stack Engineer",
    date: "Yesterday, July 30",
    time: "10:30",
    link: "https://zoom.us/completed",
    status: "Completed"
  },
  {
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "VP of Engineering",
    date: "Aug 2, 2026",
    time: "11:00",
    link: "https://zoom.us/pending",
    status: "Pending"
  }
];

interface TranscriptEntry {
  question: string;
  answer: string;
  rating: "Strong" | "Good" | "Weak";
}

interface InterviewReport {
  candidateId: string;
  name: string;
  avatar: string;
  role: string;
  communicationScore: number;
  technicalScore: number;
  overallScore: number;
  summary: string;
  transcript: TranscriptEntry[];
}

const mockReports: InterviewReport[] = [
  {
    candidateId: "cand-report-1",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Senior Full Stack Engineer",
    communicationScore: 91,
    technicalScore: 94,
    overallScore: 93,
    summary: "Exceptional clarity in system design explanations. Demonstrated deep knowledge of Next.js RSC architecture and Supabase RLS. Articulates trade-offs confidently under pressure. Strongly recommend advancing to final round.",
    transcript: [
      {
        question: "Explain how you'd architect a multi-tenant SaaS system with row-level security.",
        answer: "I'd use Postgres RLS policies tied to a JWT claim, scoping every query to the authenticated tenant's org_id. Each service uses a connection pool with per-request SET LOCAL to inject the claim safely.",
        rating: "Strong"
      },
      {
        question: "How would you optimise a Next.js page with 10,000 dynamic rows?",
        answer: "Incremental Static Regeneration with on-demand revalidation for stable rows, combined with React Virtuoso for the scrollable list. Pair this with edge caching at the CDN layer for the static shell.",
        rating: "Strong"
      },
      {
        question: "Describe a time you handled production incident pressure.",
        answer: "During a Redis cache stampede we had a 200ms latency spike. I implemented probabilistic early expiration using a 1% random early refresh pattern which resolved the thundering herd within 15 minutes.",
        rating: "Good"
      }
    ]
  }
];

type TabType = "scheduled" | "reports";

export default function RecruiterInterviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("scheduled");
  const [selectedReport, setSelectedReport] = useState<InterviewReport | null>(null);

  return (
    <div className="space-y-6 bg-[#131313] text-[#F5F5F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white">Interviews</h1>
          <p className="text-xs text-[#A3A3A3] mt-1.5">
            Scheduled sessions and completed AI agent interview reports
          </p>
        </div>
        {/* Internal Tab Switcher */}
        <div className="flex bg-[#1c1c1e] border border-[#353534] rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "scheduled" ? "bg-[#2d2d30] text-white" : "text-[#A3A3A3] hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "reports" ? "bg-[#2d2d30] text-white" : "text-[#A3A3A3] hover:text-white"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI Reports</span>
          </button>
        </div>
      </div>

      {/* === TAB: Scheduled Interviews === */}
      {activeTab === "scheduled" && (
        <section className="space-y-4">
          {/* Stat Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Today", value: "2", color: "text-[#D2042D]", dotColor: "bg-[#D2042D]" },
              { label: "This Week", value: "6", color: "text-[#ecc154]", dotColor: "bg-[#ecc154]" },
              { label: "Completed", value: "14", color: "text-[#64de87]", dotColor: "bg-[#64de87]" }
            ].map(stat => (
              <div key={stat.label} className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stat.dotColor} animate-pulse`} />
                  <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider">{stat.label}</span>
                </div>
                <span className={`text-3xl font-extrabold font-mono ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Interview Cards */}
          <div className="space-y-3">
            {mockInterviews.map((interview, idx) => (
              <div key={idx} className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/25 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all shadow-lg">
                <img
                  src={interview.avatar}
                  alt={interview.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#353534] shrink-0"
                />
                <div className="flex-grow">
                  <p className="text-sm font-bold text-white">{interview.name}</p>
                  <p className="text-[10px] text-[#A3A3A3] mt-1">{interview.role}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-mono">
                      <Calendar className="w-3 h-3 text-[#D2042D]" /> {interview.date}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-mono">
                      <Clock className="w-3 h-3 text-[#ecc154]" /> {interview.time}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                    interview.status === "Confirmed"
                      ? "bg-[#64de87]/10 text-[#64de87] border-[#64de87]/20"
                      : interview.status === "Completed"
                      ? "bg-[#ecc154]/10 text-[#ecc154] border-[#ecc154]/20"
                      : "bg-[#353534] text-[#A3A3A3] border-[#353534]/60"
                  }`}>
                    {interview.status}
                  </span>
                  {interview.status !== "Completed" && (
                    <a
                      href={interview.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-[#D2042D]/10"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </a>
                  )}
                  {interview.status === "Completed" && (
                    <button
                      onClick={() => { setSelectedReport(mockReports[0]); setActiveTab("reports"); }}
                      className="flex items-center gap-1 bg-[#1c1c1e] hover:bg-[#2d2d30] border border-[#353534] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#ecc154]" />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === TAB: AI Interview Reports === */}
      {activeTab === "reports" && (
        <section className="space-y-6">
          {selectedReport ? (
            /* Report Detail View */
            <div className="space-y-5">
              {/* Back Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-1.5 text-[#A3A3A3] hover:text-white text-xs font-semibold transition-colors"
              >
                ← Back to all reports
              </button>

              {/* Report Header */}
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-lg">
                <img
                  src={selectedReport.avatar}
                  alt={selectedReport.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D2042D]/20"
                />
                <div className="flex-grow">
                  <h2 className="text-base font-bold text-white">{selectedReport.name}</h2>
                  <p className="text-xs text-[#A3A3A3] mt-1">{selectedReport.role}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center shrink-0">
                  {[
                    { label: "Communication", value: selectedReport.communicationScore, color: "text-[#ecc154]" },
                    { label: "Technical", value: selectedReport.technicalScore, color: "text-[#64de87]" },
                    { label: "Overall", value: selectedReport.overallScore, color: "text-[#D2042D]" }
                  ].map(metric => (
                    <div key={metric.label} className="bg-[#131313] border border-[#353534] rounded-xl p-3">
                      <p className={`text-xl font-black font-mono ${metric.color}`}>{metric.value}</p>
                      <p className="text-[8px] text-[#A3A3A3] uppercase tracking-wider mt-1 font-bold">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D2042D]" /> AI Recommendation Summary
                </h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">{selectedReport.summary}</p>
              </div>

              {/* Transcript */}
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D2042D]" /> Interview Transcript
                </h3>
                <div className="space-y-4">
                  {selectedReport.transcript.map((entry, idx) => (
                    <div key={idx} className="bg-[#131313] border border-[#353534] rounded-xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-bold text-white leading-snug flex-grow">Q{idx + 1}: {entry.question}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 font-mono ${
                          entry.rating === "Strong"
                            ? "text-[#64de87] border-[#64de87]/20 bg-[#64de87]/10"
                            : entry.rating === "Good"
                            ? "text-[#ecc154] border-[#ecc154]/20 bg-[#ecc154]/10"
                            : "text-[#D2042D] border-[#D2042D]/20 bg-[#D2042D]/10"
                        }`}>
                          {entry.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed border-l-2 border-[#353534] pl-3">{entry.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Report List View */
            <div className="space-y-4">
              <p className="text-xs text-[#A3A3A3] px-1">
                <span className="text-[#D2042D] font-bold font-mono">{mockReports.length}</span> completed AI interview reports
              </p>
              {mockReports.map((report) => (
                <div
                  key={report.candidateId}
                  onClick={() => setSelectedReport(report)}
                  className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all shadow-lg group"
                >
                  <img src={report.avatar} alt={report.name} className="w-12 h-12 rounded-full object-cover border border-[#353534]" />
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-white">{report.name}</p>
                    <p className="text-[10px] text-[#A3A3A3] mt-1">{report.role}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[9px] text-[#64de87] font-mono font-bold">Tech: {report.technicalScore}/100</span>
                      <span className="text-[9px] text-[#ecc154] font-mono font-bold">Comm: {report.communicationScore}/100</span>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-2xl font-black text-[#D2042D] font-mono">{report.overallScore}</p>
                    <p className="text-[9px] text-[#A3A3A3] uppercase tracking-wider">Overall</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A3A3A3] group-hover:text-[#D2042D] transition-colors" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
