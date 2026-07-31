"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  Calendar, 
  Award, 
  ArrowRight, 
  Shield, 
  BarChart3, 
  Code2, 
  CheckCircle,
  Users
} from "lucide-react";

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
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([
    { id: "fintech", title: "FinTech Innovators", status: "Team matching pending" }
  ]);

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

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Hero & Grids */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Featured Event Hero */}
          <section className="relative bg-[#262626] border border-[#353535] rounded-xl flex flex-col justify-end min-h-[380px] overflow-hidden group p-6 md:p-8">
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/70 to-[#131313]/10 z-10"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                className="w-full h-full object-cover opacity-40 group-hover:scale-102 transition-transform duration-700 ease-out" 
                alt="AI Neural Network Visual" 
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200" 
              />
            </div>

            {/* Hero content */}
            <div className="relative z-20 max-w-2xl">
              <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#D2042D] border border-[#D2042D]/40 px-2 py-0.5 rounded bg-[#131313]/60 backdrop-blur mb-3">
                Featured Event
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] mb-3 tracking-tight">The Generative AI Breakthrough</h2>
              <p className="text-xs md:text-sm text-[#A3A3A3] mb-5 leading-relaxed max-w-xl">
                Push the boundaries of large language models. Build enterprise-grade generative applications and compete for industry recognition.
              </p>
              
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-6 text-xs text-[#ecc154] font-semibold">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#D2042D]" />
                  <span>Oct 15 - Oct 17</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D2042D]" />
                  <span>$10,000 + AI Certification</span>
                </div>
              </div>

              <button 
                onClick={handleRegister}
                disabled={isRegistered}
                className={`px-6 py-2.5 font-bold text-xs rounded transition-all active:scale-[0.98] ${
                  isRegistered 
                    ? "bg-[#064e3b] text-[#34d399] border border-[#059669]/50 flex items-center gap-2 cursor-default" 
                    : "bg-[#D2042D] hover:bg-[#D2042D]/90 text-white"
                }`}
              >
                {isRegistered ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Registered</span>
                  </>
                ) : (
                  "Register Now"
                )}
              </button>
            </div>
          </section>

          {/* Upcoming Hackathons Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#F5F5F5] tracking-tight">Upcoming Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id} 
                  className="bg-[#262626] border border-[#353535] rounded-xl p-5 hover:border-[#D2042D]/40 transition-colors flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base font-bold text-[#F5F5F5]">{challenge.title}</h3>
                    {challenge.icon}
                  </div>
                  <p className="text-xs text-[#A3A3A3] mb-5 leading-relaxed flex-grow">
                    {challenge.description}
                  </p>
                  
                  <div className="border-t border-[#353535] pt-4 mt-auto space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {challenge.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[9px] uppercase tracking-wider font-extrabold bg-[#171717] border border-[#353535] text-[#A3A3A3] px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#ecc154] font-bold">{challenge.prize}</span>
                      <button className="text-[#D2042D] hover:text-[#D2042D]/80 font-bold flex items-center gap-1">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: My Registrations & Past Achievements */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* My Registrations */}
          <div className="bg-[#262626] border border-[#353535] p-5 rounded-xl">
            <h3 className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-4 border-b border-[#353535] pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D2042D]" />
              My Registrations
            </h3>
            <ul className="space-y-4">
              {registrations.map((reg) => (
                <li key={reg.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#D2042D] transition-colors">
                      {reg.title}
                    </span>
                    <span className="text-[10px] text-[#A3A3A3]">
                      {reg.status}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#353535] group-hover:text-[#D2042D] transition-colors" />
                </li>
              ))}
            </ul>
          </div>

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
