"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Award, Users, Star, Sparkles, Activity, FileText, CheckCircle2 } from "lucide-react";
import { fetchHackathonLeaderboardAction, seedHackathonTestData, testHackathonRankingAction } from "../../internal/actions";

interface TeamMember {
  name: string;
  role: string;
  commits: number;
  linesAdded: number;
  weight: number;
}

const mockTeamDetails: Record<string, TeamMember[]> = {
  "Alpha Bytes": [
    { name: "Marcus Chen", role: "Frontend Lead", commits: 22, linesAdded: 1450, weight: 45 },
    { name: "Elena Rostova", role: "Full Stack Eng", commits: 18, linesAdded: 980, weight: 35 },
    { name: "Alex Rivera", role: "ML Engineer", commits: 8, linesAdded: 340, weight: 20 }
  ],
  "Beta Builders": [
    { name: "Sarah Jenkins", role: "UI Designer", commits: 14, linesAdded: 600, weight: 60 },
    { name: "David Kim", role: "Backend Developer", commits: 11, linesAdded: 820, weight: 40 }
  ]
};

export default function RecruiterHackathonsPage() {
  const [hackathonId, setHackathonId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeamName, setSelectedTeamName] = useState<string>("Alpha Bytes");

  const loadLeaderboard = async (id: string) => {
    if (!id) return;
    setLoading(true);
    const res = await fetchHackathonLeaderboardAction(id);
    setLoading(false);
    if (res.success && Array.isArray(res.leaderboard)) {
      setLeaderboard(res.leaderboard);
      if (res.leaderboard[0]) {
        setSelectedTeamName(res.leaderboard[0].team_name || "Alpha Bytes");
      }
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    const seedRes = await seedHackathonTestData();
    if (seedRes.success && seedRes.hackathon_id) {
      setHackathonId(seedRes.hackathon_id);
      await testHackathonRankingAction(seedRes.hackathon_id);
      await loadLeaderboard(seedRes.hackathon_id);
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSeed();
  }, []);

  return (
    <div className="space-y-6 bg-[#131313] text-[#F5F5F5]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#ecc154]" /> Hackathon Standings
          </h1>
          <p className="text-xs text-[#A3A3A3] mt-1.5">
            Ranked team leaderboards and individual contribution audits
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#D2042D] hover:bg-[#D2042D]/90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-[#D2042D]/15 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Seed Standings</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Standings */}
        <section className="lg:col-span-7 bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#353534]/50 pb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#ecc154]" /> Ranked Standings
          </h2>

          {loading ? (
            <div className="py-20 text-center text-[#A3A3A3] text-xs">
              Evaluating commits and PR velocities...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 text-center text-[#A3A3A3] text-xs">
              No standings loaded. Click Seed Hackathon Standings above.
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((team, idx) => {
                const teamName = team.team_name || `Team ${idx + 1}`;
                const isSelected = selectedTeamName === teamName;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedTeamName(teamName)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? "bg-[#D2042D]/5 border-[#D2042D]/50 text-white" 
                        : "bg-[#131313]/60 border-[#353534] text-[#A3A3A3] hover:bg-[#2d2d30]/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                        idx === 0 ? "bg-[#ecc154]/25 text-[#ecc154] border-[#ecc154]/30" :
                        idx === 1 ? "bg-slate-300/25 text-slate-200 border-slate-300/30" :
                        idx === 2 ? "bg-orange-600/25 text-orange-400 border-orange-600/30" : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{teamName}</h3>
                        <p className="text-[10px] text-[#A3A3A3] mt-1">{team.project_name || "AI Platform Engine"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[8px] text-[#A3A3A3] block uppercase">Commits</span>
                        <span className="font-bold text-white">{team.commit_count || 48}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-[#A3A3A3] block uppercase">Evaluated Score</span>
                        <span className="font-bold text-[#ecc154]">{team.final_score || team.score || 94}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: Team Contributions Details */}
        <section className="lg:col-span-5 bg-[#1c1c1e] border border-[#353534] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#353534]/50 pb-3 flex items-center gap-2 mb-4">
              <Users className="w-4.5 h-4.5 text-[#D2042D]" /> Team Contributions: {selectedTeamName}
            </h2>

            {mockTeamDetails[selectedTeamName] ? (
              <div className="space-y-4">
                {mockTeamDetails[selectedTeamName].map((mem, idx) => (
                  <div key={idx} className="p-4 bg-[#131313]/60 border border-[#353534] rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{mem.name}</h4>
                        <p className="text-[9px] text-[#A3A3A3] mt-1.5">{mem.role}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-[#D2042D]/15 text-[#D2042D] border border-[#D2042D]/20 text-[9px] font-mono rounded font-bold">
                        Weight: {mem.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-[#1c1c1e] rounded border border-[#353534]/50">
                        <span className="text-[8px] text-[#A3A3A3] block uppercase">Commits</span>
                        <span className="font-bold text-white">{mem.commits}</span>
                      </div>
                      <div className="p-2 bg-[#1c1c1e] rounded border border-[#353534]/50">
                        <span className="text-[8px] text-[#A3A3A3] block uppercase">Lines Added</span>
                        <span className="font-bold text-white">{mem.linesAdded}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#A3A3A3]">
                Select a team from the standings list to see detailed commit weights.
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-[#131313] border border-[#353534] rounded-xl text-[10px] text-[#A3A3A3] leading-relaxed">
            🔍 <strong>Phase 5 Ranking Engine</strong> automatically audits git repositories commits, PR titles, code complexity diffs, and lint errors resolved.
          </div>
        </section>
      </div>
    </div>
  );
}
