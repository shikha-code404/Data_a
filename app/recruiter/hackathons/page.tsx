"use client";

import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Award, 
  Users, 
  Star, 
  Sparkles, 
  Activity, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Clock 
} from "lucide-react";
import { 
  fetchHackathonLeaderboardAction, 
  seedHackathonTestData, 
  testHackathonRankingAction 
} from "../../internal/actions";

interface TeamMember {
  name: string;
  role: string;
  commits: number;
  linesAdded: number;
  weight: number;
}



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

  // Compute selected team details
  const selectedTeam = leaderboard.find(t => (t.team_name || "").toLowerCase() === selectedTeamName.toLowerCase()) || leaderboard[0];

  const getTeamMembers = () => {
    if (!selectedTeam) return [];
    
    if (selectedTeam.members && selectedTeam.members.length > 0) {
      return selectedTeam.members.map((m: any, idx: number) => {
        return {
          name: m.full_name,
          role: m.headline || "Software Engineer",
          commits: m.commits || Math.floor(Math.random() * 15) + 5,
          linesAdded: m.linesAdded || Math.floor(Math.random() * 800) + 150,
          weight: m.weight || Math.floor(100 / selectedTeam.members.length)
        };
      });
    }
    
    return [];
  };

  return (
    <div className="space-y-8 bg-[#131313] text-[#F5F5F5]">
      {/* Title Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#353534]/50 pb-4">
        <div>
          <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="w-8 h-8 text-[#ecc154]" /> Hackathon Command Center
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1.5">
            Manage active events, technical audits, and talent scouting.
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-[#D2042D] hover:bg-[#D2042D]/90 text-white px-5 py-2.5 font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-2 shadow-md shadow-[#D2042D]/15 shrink-0 cursor-pointer disabled:opacity-50 text-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Syncing..." : "Seed Standings"}</span>
        </button>
      </section>

      {/* Technical Health Card (Stats Row) */}
      <div className="bg-[#1c1c1e]/70 backdrop-blur-md border border-[#5d3f3e]/40 p-6 rounded-xl flex flex-col md:flex-row gap-6 justify-around shadow-xl">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Average Commit Quality</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-extrabold text-[#65de85] leading-none">92.4%</span>
            <TrendingUp className="w-5 h-5 text-[#65de85]" />
          </div>
        </div>
        <div className="w-px h-12 bg-[#353534] hidden md:block self-center"></div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Code Complexity Score</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-extrabold text-[#ecc154] leading-none">0.42</span>
            <span className="text-[#ecc154] text-[10px] font-bold px-2 py-0.5 bg-[#ecc154]/10 rounded border border-[#ecc154]/25">Optimal</span>
          </div>
        </div>
        <div className="w-px h-12 bg-[#353534] hidden md:block self-center"></div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-widest">Review Velocity</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-extrabold text-white leading-none">14m</span>
            <span className="text-[#A3A3A3] text-xs font-mono">Avg/PR</span>
          </div>
        </div>
      </div>

      {/* Row 2: Active Events & Global Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Events */}
        <div className="col-span-12 lg:col-span-7 bg-[#1c1c1e] p-6 rounded-xl border border-[#353534] shadow-xl">
          <div className="flex justify-between items-center mb-5 border-b border-[#353534]/50 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D2042D]" /> Active Events
            </h2>
            <span className="text-[10px] text-[#A3A3A3] hover:underline cursor-pointer">View All</span>
          </div>
          
          <div className="space-y-4">
            {/* Event 1 */}
            <div className="flex items-center justify-between p-4 bg-[#131313]/60 border border-[#353534] rounded-lg hover:border-[#D2042D]/50 transition-colors cursor-pointer group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#1c1c1e] border border-[#353534] rounded flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#D2042D]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#D2042D] transition-colors">AI Innovation 2024</h3>
                  <p className="text-[10px] text-[#A3A3A3] mt-1">42 Teams • 168 Participants</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#65de85]/15 text-[#65de85] border border-[#65de85]/20 text-[9px] font-bold rounded uppercase">Live</span>
            </div>
            
            {/* Event 2 */}
            <div className="flex items-center justify-between p-4 bg-[#131313]/60 border border-[#353534] rounded-lg hover:border-[#D2042D]/50 transition-colors cursor-pointer group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#1c1c1e] border border-[#353534] rounded flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#ecc154]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#D2042D] transition-colors">Full-Stack Sprint</h3>
                  <p className="text-[10px] text-[#A3A3A3] mt-1">12 Teams • 48 Participants</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#ecc154]/15 text-[#ecc154] border border-[#ecc154]/20 text-[9px] font-bold rounded uppercase">Pending</span>
            </div>
            
            {/* Event 3 */}
            <div className="flex items-center justify-between p-4 bg-[#131313]/60 border border-[#353534] rounded-lg hover:border-[#D2042D]/50 transition-colors cursor-pointer group">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-[#1c1c1e] border border-[#353534] rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#A3A3A3]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#D2042D] transition-colors">Legacy Modernization</h3>
                  <p className="text-[10px] text-[#A3A3A3] mt-1">28 Teams • Ended 2 days ago</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#353534] text-[#A3A3A3] border border-[#353534]/50 text-[9px] font-bold rounded uppercase">Completed</span>
            </div>
          </div>
        </div>

        {/* Global Rankings (Leaderboard Snippet) */}
        <div className="col-span-12 lg:col-span-5 bg-[#1c1c1e] p-6 rounded-xl border border-[#353534] shadow-xl">
          <div className="flex justify-between items-center mb-5 border-b border-[#353534]/50 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-[#ecc154]" /> Global Rankings
            </h2>
            <span className="text-[10px] font-mono text-[#A3A3A3] bg-[#131313] border border-[#353534] px-2 py-0.5 rounded">
              Leaderboard
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#A3A3A3] text-xs">
              Evaluating commits and PR velocities...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-16 text-center text-[#A3A3A3] text-xs">
              No standings loaded. Click Seed Standings above.
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((team, idx) => {
                const teamName = team.team_name || `Team ${idx + 1}`;
                const isSelected = selectedTeamName.toLowerCase() === teamName.toLowerCase();
                const score = team.final_score || team.score || 90;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedTeamName(teamName)}
                    className={`flex items-center gap-4 py-3 border-b border-[#353534]/40 cursor-pointer transition-all ${
                      isSelected ? "opacity-100 scale-[1.01]" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className={`font-bold text-sm w-6 ${
                      idx === 0 ? "text-[#ecc154]" :
                      idx === 1 ? "text-slate-300" :
                      idx === 2 ? "text-orange-400" : "text-[#A3A3A3]"
                    }`}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-grow">
                      <span className={`font-semibold text-xs block ${isSelected ? "text-white font-bold" : "text-[#F5F5F5]"}`}>{teamName}</span>
                      <div className="w-full bg-[#131313] h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? "bg-[#ecc154]" : "bg-[#D2042D]"
                          }`} 
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#ecc154] shrink-0">{score * 30} pts</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Talent Discovery & Team Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Talent Discovery Card */}
        <div className="col-span-12 lg:col-span-7 bg-[#1c1c1e] p-6 rounded-xl border border-[#353534] shadow-xl relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-[0.03] pointer-events-none">
            <Trophy className="w-48 h-48 text-white" />
          </div>
          
          <div className="flex justify-between items-center mb-5 border-b border-[#353534]/50 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D2042D]" /> Talent Discovery
              </h2>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5">Top Performers flagged by HireSpark AI</p>
            </div>
            <span className="px-2 py-0.5 bg-[#D2042D]/15 text-[#D2042D] border border-[#D2042D]/20 text-[9px] font-bold rounded uppercase">
              AI Insights Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate 1 */}
            <div className="flex items-center gap-3 p-3 bg-[#131313]/60 rounded-lg border border-[#353534] hover:border-[#65de85] transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-[#65de85] p-0.5 overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Madhav Chen" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4TzWqGwDqha-Q96usnoNA_KRkfytO3RyPtm4moEgX6ttoqHi8sgdqbRMS_Q3Q87Gz-Ut5m5LGZ-lF_S1EszaJ8SUJeNq9M866iGNig4LTcVn0wk_bmcCPcj84vgKb5BM2q75QlFOXW1Pdaf1Zf8QvQ8Qgx6LKkWW6hjiyLmKxSAQ4L02zzigTo8-VvkHfE3PPAH3w7nCZT8g0vh94EQdwgdJD81sLURFX_5WsHYDmBI6Jk9SHoF8I"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">Madhav Chen</p>
                <p className="text-[9px] text-[#65de85] truncate font-medium mt-0.5">Senior Backend Lead</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">Go</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">K8s</span>
                </div>
              </div>
            </div>

            {/* Candidate 2 */}
            <div className="flex items-center gap-3 p-3 bg-[#131313]/60 rounded-lg border border-[#353534] hover:border-[#ecc154] transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-[#ecc154] p-0.5 overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Diya Nair" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9c7mN8rj_vA9-Y9fp4n1BjX_N3BOZVc-IA5cKJkcW34S_9eTRpqoFKxAWJOsebpGa5QLfBje-X39EjDI-ietgFtr7Eg_43vxw0rYl7vb7pnfnuLq1lKMxwpnT6Cwkv1pL8F8qH6UTFcfdZC3w1nEvTjXiv3-iBvkyqlbe48qyoz3s0GG07i4ROhjbcrsAv15sN_0kPcmZ0JjGZdg6_DwheYg1CHYSlhReKLN_8q5SM-wLGCY5czKd"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">Diya Nair</p>
                <p className="text-[9px] text-[#ecc154] truncate font-medium mt-0.5">React Specialist</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">TypeScript</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">Next.js</span>
                </div>
              </div>
            </div>

            {/* Candidate 3 */}
            <div className="flex items-center gap-3 p-3 bg-[#131313]/60 rounded-lg border border-[#353534] hover:border-[#D2042D] transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-[#A3A3A3]/50 p-0.5 overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Arjun Mehta" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL8y5v3e1gIb_AQ2P2MUnRfrGOPEI-MTVtt3TD-x2u0Lg-BR3SbpLInSssG-WWxRJo6Sf6MYHjleF8stSQlIBAaj-ZVDdx3e8iT3WfmOAUhs_SrUHz0X_Gs6F9hhUa_kFhSNVdqo9Gk-hBELy2zQTxNDG5EodbCumtkfDOe_4yWwKxoVzQ3FwMJOa36zK4viExO0L4itS87aeH3AbVhG-ZqVTbTV9pHTVJqDIO6zsMF7De4jaqlZoz"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">Arjun Mehta</p>
                <p className="text-[9px] text-[#A3A3A3] truncate font-medium mt-0.5">ML Ops Engineer</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">Python</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">PyTorch</span>
                </div>
              </div>
            </div>

            {/* Candidate 4 */}
            <div className="flex items-center gap-3 p-3 bg-[#131313]/60 rounded-lg border border-[#353534] hover:border-[#D2042D] transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-[#A3A3A3]/50 p-0.5 overflow-hidden shrink-0">
                <img 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Esha Sharma" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBshBCN8Eph7u-_Nlt3WgwXMiYAylJUH0UdsNp-uIZ0Jw68wCaRt0YorZhi7Vgd6eNiGyO8lnaIo8D6xORps7CzrTJFaknyGiJdDxv-IklaharqkJ7HQUtlNAYaZlHvO4cT1JnF4iqcXUzn3b1NwwVJB2ZTil9LOzEvt891_i5MHyj0LTmP-bT7Yirgb60bJhE8KU2KA0KalV0vIj77J788sukLTgMLkWwY5vvXN3Tuv4TrZtDg5und"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">Esha Sharma</p>
                <p className="text-[9px] text-[#A3A3A3] truncate font-medium mt-0.5">System Architect</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">Rust</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1c1c1e] border border-[#353534] rounded text-[#A3A3A3]">Wasm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Contributions detail panel */}
        <div className="col-span-12 lg:col-span-5 bg-[#1c1c1e] p-6 rounded-xl border border-[#353534] shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#353534]/50 pb-3 flex items-center gap-2 mb-4">
              <Users className="w-4.5 h-4.5 text-[#D2042D]" /> Team Contributions: {selectedTeamName}
            </h2>

            {getTeamMembers().length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {getTeamMembers().map((mem: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#131313]/60 border border-[#353534] rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white leading-none truncate">{mem.name}</h4>
                        <p className="text-[9px] text-[#A3A3A3] mt-1 truncate">{mem.role}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-[#D2042D]/15 text-[#D2042D] border border-[#D2042D]/20 text-[8px] font-mono rounded font-bold shrink-0">
                        Weight: {mem.weight}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-1.5 bg-[#1c1c1e] rounded border border-[#353534]/50">
                        <span className="text-[8px] text-[#A3A3A3] block uppercase">Commits</span>
                        <span className="font-bold text-white">{mem.commits}</span>
                      </div>
                      <div className="p-1.5 bg-[#1c1c1e] rounded border border-[#353534]/50">
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

          <div className="mt-4 p-3 bg-[#131313] border border-[#353534] rounded-xl text-[9px] text-[#A3A3A3] leading-relaxed flex items-center gap-2">
            <span className="text-sm">🔍</span>
            <span>
              <strong>Ranking Engine Audit:</strong> Commits, PR titles, complexity diffs, and lint errors resolved are automatically analyzed.
            </span>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity Feed */}
      <div className="bg-[#1c1c1e] p-6 rounded-xl border border-[#353534] shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-b border-[#353534]/50 pb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D2042D]" /> Recent Activity
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Activity item 1 */}
          <div className="relative pl-6 border-l-2 border-[#65de85]">
            <div className="absolute w-3 h-3 bg-[#65de85] rounded-full -left-[7px] top-1 border-2 border-[#1c1c1e]" />
            <h4 className="text-xs font-bold text-white">Technical Audit Completed</h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1">Team Cypher: Repository security check passed with 0 vulnerabilities.</p>
            <span className="text-[8px] text-[#A3A3A3] font-mono block mt-1.5">2 mins ago</span>
          </div>

          {/* Activity item 2 */}
          <div className="relative pl-6 border-l-2 border-[#D2042D]">
            <div className="absolute w-3 h-3 bg-[#D2042D] rounded-full -left-[7px] top-1 border-2 border-[#1c1c1e]" />
            <h4 className="text-xs font-bold text-white">Team Formed</h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1">"The Dev-ils" registered for AI Innovation 2024.</p>
            <span className="text-[8px] text-[#A3A3A3] font-mono block mt-1.5">14 mins ago</span>
          </div>

          {/* Activity item 3 */}
          <div className="relative pl-6 border-l-2 border-[#ecc154]">
            <div className="absolute w-3 h-3 bg-[#ecc154] rounded-full -left-[7px] top-1 border-2 border-[#1c1c1e]" />
            <h4 className="text-xs font-bold text-white">Milestone Reached</h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1">50% of teams have submitted their MVP architecture.</p>
            <span className="text-[8px] text-[#A3A3A3] font-mono block mt-1.5">1 hr ago</span>
          </div>

          {/* Activity item 4 */}
          <div className="relative pl-6 border-l-2 border-[#353534]">
            <div className="absolute w-3 h-3 bg-[#353534] rounded-full -left-[7px] top-1 border-2 border-[#1c1c1e]" />
            <h4 className="text-xs font-bold text-white">Event Baseline Set</h4>
            <p className="text-[10px] text-[#A3A3A3] mt-1">Hackathon "Full-Stack Sprint" initialization complete.</p>
            <span className="text-[8px] text-[#A3A3A3] font-mono block mt-1.5">4 hrs ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
