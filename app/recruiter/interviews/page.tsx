"use client";

import React, { useState, useEffect } from "react";
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

interface InterviewReport {
  id: string;
  candidateId: string;
  name: string;
  avatar: string | null;
  role: string;
  communicationScore: number;
  technicalScore: number;
  overallScore: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  concerns: string[];
  questions: any;
  answers: any;
  needsReview: boolean;
  createdAt: string;
}

type TabType = "scheduled" | "reports";

export default function RecruiterInterviewsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("reports");
  const [selectedReport, setSelectedReport] = useState<InterviewReport | null>(null);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview/reports");
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to load interview reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = reports.length;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Build Q&A transcript from questions + answers
  const buildTranscript = (report: InterviewReport) => {
    const allQuestions = [
      ...(report.questions?.technical_questions || []),
      ...(report.questions?.behavioral_questions || [])
    ];
    return allQuestions.map((q: string, i: number) => ({
      question: q,
      answer: report.answers?.[q] || report.answers?.[`q${i}`] || "No answer recorded.",
      rating: i < (report.questions?.technical_questions?.length || 0) 
        ? (report.technicalScore >= 80 ? "Strong" : report.technicalScore >= 60 ? "Good" : "Weak")
        : (report.communicationScore >= 80 ? "Strong" : report.communicationScore >= 60 ? "Good" : "Weak")
    }));
  };

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
              { label: "Today", value: "0", color: "text-[#D2042D]", dotColor: "bg-[#D2042D]" },
              { label: "This Week", value: "0", color: "text-[#ecc154]", dotColor: "bg-[#ecc154]" },
              { label: "Completed", value: String(completedCount), color: "text-[#64de87]", dotColor: "bg-[#64de87]" }
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

          {/* Completed interview cards from real data */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#D2042D]" />
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-8 text-center">
                <p className="text-xs text-[#A3A3A3]">No interview sessions yet. Use AI Shortlisting to generate interviews.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/25 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all shadow-lg">
                  {report.avatar ? (
                    <img src={report.avatar} alt={report.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#353534] shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#D2042D] flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {report.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-white">{report.name}</p>
                    <p className="text-[10px] text-[#A3A3A3] mt-1">{report.role}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-mono">
                        <Calendar className="w-3 h-3 text-[#D2042D]" /> {formatDate(report.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#A3A3A3] font-mono">
                        <Award className="w-3 h-3 text-[#ecc154]" /> Score: {report.overallScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider font-mono bg-[#ecc154]/10 text-[#ecc154] border-[#ecc154]/20">
                      Completed
                    </span>
                    <button
                      onClick={() => { setSelectedReport(report); setActiveTab("reports"); }}
                      className="flex items-center gap-1 bg-[#1c1c1e] hover:bg-[#2d2d30] border border-[#353534] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#ecc154]" />
                      <span>View Report</span>
                    </button>
                  </div>
                </div>
              ))
            )}
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
                {selectedReport.avatar ? (
                  <img src={selectedReport.avatar} alt={selectedReport.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#D2042D]/20" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#D2042D] flex items-center justify-center text-white font-bold text-xl">
                    {selectedReport.name.charAt(0)}
                  </div>
                )}
                <div className="flex-grow">
                  <h2 className="text-base font-bold text-white">{selectedReport.name}</h2>
                  <p className="text-xs text-[#A3A3A3] mt-1">{selectedReport.role}</p>
                  <p className="text-[10px] text-[#A3A3A3] mt-1 font-mono">{formatDate(selectedReport.createdAt)}</p>
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

              {/* Recommendation Badge */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedReport.recommendation === "strong_yes" ? "bg-[#64de87]/15 text-[#64de87] border border-[#64de87]/30" :
                  selectedReport.recommendation === "yes" ? "bg-[#ecc154]/15 text-[#ecc154] border border-[#ecc154]/30" :
                  selectedReport.recommendation === "maybe" ? "bg-[#A3A3A3]/15 text-[#A3A3A3] border border-[#A3A3A3]/30" :
                  "bg-[#D2042D]/15 text-[#D2042D] border border-[#D2042D]/30"
                }`}>
                  {selectedReport.recommendation.replace("_", " ")}
                </span>
                {selectedReport.needsReview && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecc154]/15 text-[#ecc154] border border-[#ecc154]/30">
                    Needs Review
                  </span>
                )}
              </div>

              {/* AI Summary */}
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D2042D]" /> AI Recommendation Summary
                </h3>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">{selectedReport.summary}</p>
              </div>

              {/* Strengths & Concerns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#64de87]" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedReport.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#A3A3A3]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#64de87] mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#D2042D]" /> Concerns
                  </h3>
                  <ul className="space-y-2">
                    {selectedReport.concerns.length > 0 ? selectedReport.concerns.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#A3A3A3]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D2042D] mt-1.5 shrink-0" />
                        {c}
                      </li>
                    )) : (
                      <li className="text-xs text-[#A3A3A3]">No concerns flagged.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Transcript */}
              <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-5 shadow-lg space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D2042D]" /> Interview Transcript
                </h3>
                <div className="space-y-4">
                  {buildTranscript(selectedReport).map((entry, idx) => (
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
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D2042D]" />
                </div>
              ) : reports.length === 0 ? (
                <div className="bg-[#1c1c1e] border border-[#353534] rounded-2xl p-8 text-center">
                  <Brain className="w-8 h-8 text-[#A3A3A3] mx-auto mb-3" />
                  <p className="text-xs text-[#A3A3A3]">No AI interview reports yet. Generate interviews from the shortlisting page.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[#A3A3A3] px-1">
                    <span className="text-[#D2042D] font-bold font-mono">{reports.length}</span> completed AI interview reports
                  </p>
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="bg-[#1c1c1e] border border-[#353534] hover:border-[#D2042D]/30 rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all shadow-lg group"
                    >
                      {report.avatar ? (
                        <img src={report.avatar} alt={report.name} className="w-12 h-12 rounded-full object-cover border border-[#353534]" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#D2042D] flex items-center justify-center text-white font-bold text-lg">
                          {report.name.charAt(0)}
                        </div>
                      )}
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
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
