"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Calendar, 
  Award, 
  ArrowRight, 
  Shield, 
  BarChart3, 
  Code2, 
  CheckCircle,
  Users,
  Loader2,
  X,
  Sparkles,
  IndianRupee,
  Clock,
  Target
} from "lucide-react";
import { getCandidateHackathons } from "../actions";
import { useAuth } from "@/lib/auth-context";

interface Challenge {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  schedule: string;
  icon: React.ReactNode;
  tags: string[];
  prize: string;
  prizesBreakdown: string[];
  judgingCriteria: string[];
}

interface Registration {
  id: string;
  title: string;
  status: string;
}

export default function HackathonsPage() {
  const { candidate_id } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Modal State for "Learn Mode / Learn More"
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const fetchRegs = async () => {
    setLoading(true);
    try {
      const res = await getCandidateHackathons();
      if (res.success && res.registrations) {
        setRegistrations(res.registrations);
        if (res.registrations.length > 0) {
          setSelectedHackathonId(res.registrations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (id: string) => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/hackathons/${id}/leaderboard`);
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      } else {
        setLeaderboard([]);
      }
    } catch (e) {
      console.error(e);
      setLeaderboard([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchRegs();
    }
  }, [candidate_id]);

  useEffect(() => {
    if (selectedHackathonId) {
      fetchLeaderboard(selectedHackathonId);
    } else {
      setLeaderboard([]);
    }
  }, [selectedHackathonId]);

  const handleRegister = () => {
    if (!isRegistered) {
      setIsRegistered(true);
      setRegistrations([
        { id: "genai", title: "The Generative AI Breakthrough", status: "Starts in 14 days" },
        ...registrations
      ]);
    }
  };

  const heroHackathon: Challenge = {
    id: "genai",
    title: "The Generative AI Breakthrough",
    description: "Build autonomous AI agents or fine-tune models to solve real-world productivity hurdles. Top submissions will be reviewed by venture partners and highlighted in recruiter directories.",
    problemStatement: "Create an end-to-end multi-agent workflow system using LLMs, vector search, and tool-calling that solves complex domain automation in healthcare, fintech, or developer tooling.",
    schedule: "Oct 15 - Oct 17, 2026",
    icon: <Sparkles className="w-5 h-5 text-[#ecc154]" />,
    tags: ["Python", "PyTorch", "Next.js", "LangChain", "LLMs"],
    prize: "₹25,00,000 Cash Pool + Cloud Credits",
    prizesBreakdown: [
      "🥇 1st Place: ₹15,00,000 Cash + VC Mentorship Fast-Track",
      "🥈 2nd Place: ₹7,00,000 Cash + $10,000 Cloud Credits",
      "🥉 3rd Place: ₹3,00,000 Cash + Featured Profile Badge"
    ],
    judgingCriteria: [
      "AI Agent Capability & Tool Accuracy (35%)",
      "Production Readiness & Latency (30%)",
      "UX Design & Real-time Responsiveness (35%)"
    ]
  };

  const challenges: Challenge[] = [
    {
      id: "fullstack",
      title: "Full-Stack Speedrun",
      description: "Architect and deploy a highly scalable microservices platform under intense time constraints. Show your end-to-end mastery.",
      problemStatement: "Build a real-time collaborative workspace with zero-latency state synchronization, offline cache support, and automated CI/CD pipeline deployments.",
      schedule: "Nov 02 - Nov 04, 2026",
      icon: <Code2 className="w-5 h-5 text-[#D2042D]" />,
      tags: ["React", "Node.js", "AWS", "Next.js", "PostgreSQL"],
      prize: "₹5,00,000 Prize Pool",
      prizesBreakdown: [
        "🥇 1st Place: ₹3,00,000 Cash + Direct Recruiter Fast-Track",
        "🥈 2nd Place: ₹1,50,000 Cash + Tech Gear",
        "🥉 3rd Place: ₹50,000 Cash + Hirespark Partner Badge"
      ],
      judgingCriteria: [
        "Code Architecture & Cleanliness (40%)",
        "API Latency & Scalability Benchmarks (30%)",
        "UI Polish & Design System Fidelity (30%)"
      ]
    },
    {
      id: "security",
      title: "Cybersecurity Forge",
      description: "Identify vulnerabilities in complex enterprise systems. A rigorous test of defensive and offensive security protocols.",
      problemStatement: "Audit and harden distributed smart contracts and OAuth2 token verification engines against SQL injection, spoofing, and DDoS vector attacks.",
      schedule: "Nov 12 - Nov 14, 2026",
      icon: <Shield className="w-5 h-5 text-[#D2042D]" />,
      tags: ["Python", "Rust", "Network Sec", "OAuth2"],
      prize: "Security Cert + ₹3,00,000 Pool",
      prizesBreakdown: [
        "🥇 1st Place: ₹2,00,000 Cash + Global Security Certification",
        "🥈 2nd Place: ₹1,00,000 Cash + Security Audit Tool Suite"
      ],
      judgingCriteria: [
        "Vulnerability Discovery Count & Severity (50%)",
        "Mitigation Code Quality (30%)",
        "Penetration Report Quality (20%)"
      ]
    },
    {
      id: "dataviz",
      title: "Data Viz Masters",
      description: "Transform massive, unstructured datasets into elegant, actionable visual narratives for executive decision-making.",
      problemStatement: "Design a high-performance interactive WebGL / D3 dashboard rendering 10M+ streaming financial data points at 60fps with zero frame drops.",
      schedule: "Dec 01 - Dec 03, 2026",
      icon: <BarChart3 className="w-5 h-5 text-[#D2042D]" />,
      tags: ["D3.js", "SQL", "TypeScript", "Canvas"],
      prize: "₹2,00,000 Prize Pool",
      prizesBreakdown: [
        "🥇 1st Place: ₹1,20,000 Cash + Featured Recruiter Spotlight",
        "🥈 2nd Place: ₹80,000 Cash"
      ],
      judgingCriteria: [
        "Visualization Fluidity & FPS (40%)",
        "Insights Depth & Analytical Clarity (40%)",
        "UI Elegance (20%)"
      ]
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#D2042D] mb-4" />
        <p className="text-xs text-[#A3A3A3]">Loading hackathon dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full text-[#e5e2e1] font-sans pb-12">
      {/* Header */}
      <header className="border-b border-[#353534]/50 pb-6">
        <h1 className="text-3xl font-bold text-[#F5F5F5] flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[#D2042D]" />
          Hackathons &amp; Challenges
        </h1>
        <p className="text-[#A3A3A3] mt-1 text-sm">
          Push your coding skills, earn cash prizes in Indian Rupees (₹), and showcase your profile directly to top recruiters.
        </p>
      </header>

      {/* Hero: Active Event Banner */}
      <div className="bg-[#262626] border border-[#353535] rounded-xl p-8 relative overflow-hidden shadow-lg hover:border-[#4d4d4d] transition-colors duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D2042D]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="text-[10px] font-bold tracking-widest text-[#D2042D] uppercase bg-[#D2042D]/10 px-3 py-1 rounded-full border border-[#D2042D]/20">Active Global Hackathon</span>
            <h2 className="text-2xl font-extrabold text-[#F5F5F5] leading-tight font-sans">The Generative AI Breakthrough</h2>
            <p className="text-sm text-[#A3A3A3] max-w-2xl leading-relaxed">
              Build autonomous AI agents or fine-tune models to solve real-world productivity hurdles. Top submissions will be reviewed by venture partners and highlighted in recruiter directories.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#A3A3A3]">
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#D2042D]" /> <span>Oct 15 - Oct 17, 2026</span></div>
              <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#ecc154]" /> <span>₹25,00,000 Cash Pool + Cloud Credits</span></div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 self-start lg:self-center shrink-0">
            <button 
              onClick={() => setSelectedChallenge(heroHackathon)}
              className="px-5 py-3 rounded border border-[#353535] bg-[#1a1a1a] hover:bg-[#222222] text-[#F5F5F5] font-bold text-xs shadow transition-all duration-150 flex items-center justify-center gap-1.5"
            >
              <span>Learn Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRegister}
              disabled={isRegistered}
              className="px-8 py-3.5 rounded bg-[#D2042D] hover:bg-[#D2042D]/90 text-white font-bold text-sm shadow-lg tracking-wide transition-all active:scale-95 duration-150 disabled:bg-[#353535] disabled:text-[#A3A3A3] disabled:cursor-default"
            >
              {isRegistered ? "Registered" : "Register Event"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Challenges Feed */}
        <section className="lg:col-span-8 space-y-6">
          <h3 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2 border-b border-[#353535] pb-2">Upcoming Challenges</h3>
          
          <div className="flex flex-col gap-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-[#262626] border border-[#353535] rounded-xl p-6 hover:border-[#4d4d4d] transition-colors duration-300 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#171717] rounded-lg border border-[#353535] flex items-center justify-center shrink-0">
                    {challenge.icon}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-[#F5F5F5]">{challenge.title}</h4>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-xl">{challenge.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {challenge.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold px-2.5 py-0.5 bg-[#171717] text-[#A3A3A3] rounded border border-[#353535]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-between items-end shrink-0 text-right">
                  <div>
                    <span className="text-[10px] font-bold text-[#ecc154] uppercase tracking-wider block">Reward</span>
                    <span className="text-sm font-bold text-[#F5F5F5]">{challenge.prize}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedChallenge(challenge)}
                    className="text-xs font-bold text-[#D2042D] hover:underline flex items-center gap-1 group/link mt-2 md:mt-0"
                  >
                    Learn Mode <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Sidebar: My Registrations & Past Achievements */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* My Registrations */}
          <div className="bg-[#262626] border border-[#353535] p-5 rounded-xl">
            <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-4 border-b border-[#353535] pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D2042D]" />
              My Registrations
            </h3>
            {registrations.length === 0 ? (
              <p className="text-xs text-[#A3A3A3] italic py-2">Not registered for any hackathons.</p>
            ) : (
              <ul className="space-y-4">
                {registrations.map((reg) => (
                  <li 
                    key={reg.id} 
                    onClick={() => setSelectedHackathonId(reg.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${selectedHackathonId === reg.id ? "bg-[#D2042D]/10 border border-[#D2042D]/30" : "hover:bg-[#1a1a1a]"}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-[#F5F5F5]">
                        {reg.title}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3]">
                        {reg.status}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A3A3A3]" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Leaderboard Standings Card */}
          {selectedHackathonId && (
            <div className="bg-[#262626] border border-[#353535] p-5 rounded-xl">
              <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-4 border-b border-[#353535] pb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#ecc154]" />
                Standings Leaderboard
              </h3>
              {loadingLeaderboard ? (
                <div className="py-8 flex justify-center items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#D2042D]" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-xs text-[#A3A3A3] italic text-center py-4">No team rankings posted yet.</p>
              ) : (
                <ul className="space-y-3 font-sans">
                  {leaderboard.map((team, idx) => (
                    <li key={team.team_id || idx} className="flex items-center justify-between p-2.5 bg-[#171717] border border-[#353535] rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#D2042D] font-mono">#{team.rank || (idx + 1)}</span>
                        <span className="text-xs font-bold text-white truncate max-w-[120px]">{team.team_name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#ecc154] font-mono">{Math.round(team.composite_score || team.pitch_score || 80)} pts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Past Achievements */}
          <div className="bg-[#262626] border border-[#353535] p-5 rounded-xl">
            <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-4 border-b border-[#353535] pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D2042D]" />
              Past Achievements
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group cursor-pointer">
                <Trophy className="w-4 h-4 text-[#ecc154] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#D2042D] transition-colors">
                    1st Place - Cloud Native Hack 2025
                  </span>
                  <span className="text-[10px] text-[#A3A3A3]">
                    Architected serverless voting platform (Prize: ₹5,00,000).
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3 group cursor-pointer border-t border-[#353535] pt-3">
                <CheckCircle className="w-4 h-4 text-[#D2042D] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#D2042D] transition-colors">
                    Finalist - Web3 Winter Jam
                  </span>
                  <span className="text-[10px] text-[#A3A3A3]">
                    Smart contract optimization challenge.
                  </span>
                </div>
              </li>
            </ul>
          </div>
          
        </aside>
      </div>

      {/* Learn Mode / Challenge Details Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e1e] border border-[#353535] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#353535] flex items-start justify-between gap-4 bg-[#262626]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#171717] rounded-xl border border-[#353535]">
                  {selectedChallenge.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedChallenge.title}</h3>
                  <span className="text-xs font-semibold text-[#ecc154] mt-0.5 block">{selectedChallenge.prize}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="p-1.5 rounded-lg hover:bg-[#353535] text-[#A3A3A3] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-sans text-xs text-[#d4d4d4]">
              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#D2042D]" />
                  Schedule & Duration
                </h4>
                <p className="text-sm font-semibold text-white bg-[#171717] p-3 rounded-lg border border-[#353535]/70">
                  {selectedChallenge.schedule}
                </p>
              </div>

              {/* Problem Statement */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#D2042D]" />
                  Problem Statement
                </h4>
                <p className="text-xs leading-relaxed bg-[#171717] p-4 rounded-lg border border-[#353535]/70 text-[#e5e2e1]">
                  {selectedChallenge.problemStatement}
                </p>
              </div>

              {/* Prize Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-[#ecc154]" />
                  Prize Pool Breakdown (Rupees)
                </h4>
                <div className="bg-[#171717] p-4 rounded-lg border border-[#353535]/70 space-y-2">
                  {selectedChallenge.prizesBreakdown.map((pb, idx) => (
                    <div key={idx} className="text-xs font-bold text-[#F5F5F5]">{pb}</div>
                  ))}
                </div>
              </div>

              {/* Judging Criteria */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">Judging Criteria</h4>
                <ul className="space-y-1.5 bg-[#171717] p-4 rounded-lg border border-[#353535]/70">
                  {selectedChallenge.judgingCriteria.map((jc, idx) => (
                    <li key={idx} className="text-xs text-[#A3A3A3] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D2042D]"></span>
                      <span className="text-white font-medium">{jc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Tech Stack */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] mb-2">Target Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedChallenge.tags.map((t) => (
                    <span key={t} className="px-3 py-1 bg-[#171717] border border-[#353535] text-white rounded-md font-bold text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#353535] bg-[#262626] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 rounded-lg border border-[#353535] hover:bg-[#353535] text-xs font-bold text-white transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleRegister();
                  setSelectedChallenge(null);
                }}
                className="px-6 py-2 rounded-lg bg-[#D2042D] hover:bg-[#D2042D]/90 text-xs font-bold text-white shadow transition-all active:scale-95"
              >
                {isRegistered ? "Registered" : "Register For Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
