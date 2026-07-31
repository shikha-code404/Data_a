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
  Loader2
} from "lucide-react";
import { getCandidateHackathons } from "../actions";
import { useAuth } from "@/lib/auth-context";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  prize: string;
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

  const challenges: Challenge[] = [
    {
      id: "fullstack",
      title: "Full-Stack Speedrun",
      description: "Architect and deploy a highly scalable microservices platform under intense time constraints. Show your end-to-end mastery.",
      icon: <Code2 className="w-5 h-5 text-[#D2042D]" />,
      tags: ["React", "Node.js", "AWS"],
      prize: "$5,000 Prize Pool"
    },
    {
      id: "security",
      title: "Cybersecurity Forge",
      description: "Identify vulnerabilities in complex enterprise systems. A rigorous test of defensive and offensive security protocols.",
      icon: <Shield className="w-5 h-5 text-[#D2042D]" />,
      tags: ["Python", "Rust", "Network Sec"],
      prize: "Security Cert + $3k"
    },
    {
      id: "dataviz",
      title: "Data Viz Masters",
      description: "Transform massive, unstructured datasets into elegant, actionable visual narratives for executive decision-making.",
      icon: <BarChart3 className="w-5 h-5 text-[#D2042D]" />,
      tags: ["D3.js", "SQL", "Tableau"],
      prize: "Featured Portfolio"
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
          Push your coding skills, earn industry certifications, and showcase your profile directly to top-tier recruiters.
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
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> <span>Oct 15 - Oct 17, 2026</span></div>
              <div className="flex items-center gap-1.5"><Award className="w-4 h-4" /> <span>$25,000 Cash Pool + Cloud Credits</span></div>
            </div>
          </div>
          
          <button 
            onClick={handleRegister}
            disabled={isRegistered}
            className="px-8 py-3.5 rounded bg-[#D2042D] hover:bg-[#D2042D]/90 text-white font-bold text-sm shadow-lg tracking-wide transition-all active:scale-95 duration-150 shrink-0 self-start lg:self-center disabled:bg-[#353535] disabled:text-[#A3A3A3] disabled:cursor-default"
          >
            {isRegistered ? "Registered" : "Register Event"}
          </button>
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
                  <button className="text-xs font-bold text-[#D2042D] hover:underline flex items-center gap-1 group/link mt-2 md:mt-0">
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
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
                    1st Place - Cloud Native Hack 2023
                  </span>
                  <span className="text-[10px] text-[#A3A3A3]">
                    Architected serverless voting platform.
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
    </div>
  );
}
