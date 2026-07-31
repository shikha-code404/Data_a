"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Award, Users, Star, Sparkles } from "lucide-react";
import { fetchHackathonLeaderboardAction, seedHackathonTestData, testHackathonRankingAction } from "../../internal/actions";

export default function RecruiterHackathonsPage() {
  const [hackathonId, setHackathonId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadLeaderboard = async (id: string) => {
    if (!id) return;
    setLoading(true);
    const res = await fetchHackathonLeaderboardAction(id);
    setLoading(false);
    if (res.success && Array.isArray(res.leaderboard)) {
      setLeaderboard(res.leaderboard);
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
    // Auto seed on load if empty
    handleSeed();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Phase 5 Hackathon Engine</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2 mt-1">
            <Trophy className="w-8 h-8 text-amber-400" /> Hackathon Leaderboard & Team Ranking
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ranked hackathon team contributions evaluated deterministically by commit velocity, PR merged ratios, and code quality.
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> Seed Test Hackathon Data
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Ranked Hackathon Standings</h2>

        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">Evaluating hackathon team submissions...</div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No hackathon rankings generated yet. Click 'Seed Test Hackathon Data' above.</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((team, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-amber-500/40 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs border ${
                    idx === 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                    idx === 1 ? "bg-slate-300/20 text-slate-200 border-slate-300/40" :
                    idx === 2 ? "bg-orange-600/20 text-orange-400 border-orange-600/40" : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{team.team_name || team.name || `Team ${idx + 1}`}</h3>
                    <p className="text-xs text-slate-400">{team.project_name || "AI Platform Engine"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Members</span>
                    <span className="font-bold text-slate-200">{team.member_count || 3}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Commits</span>
                    <span className="font-bold text-indigo-400">{team.commit_count || 48}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Rank Score</span>
                    <span className="font-bold text-amber-400 text-sm">{team.final_score || team.score || 94} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
