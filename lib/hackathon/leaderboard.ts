import { getSupabaseAdmin } from "../db/client";

export interface RankedTeamResult {
  team_id: string;
  team_name: string;
  pitch_score: number;
  dominance_percentage: number;
  dominance_flag: boolean;
  composite_score: number;
  rank: number;
  contribution_summary: any;
  members?: any[];
}

/**
 * Calculates rankings for teams in a given hackathon and persists them in public.hackathon_results.
 * Throws strict errors if any referenced hackathon, team, or upstream analysis row is missing.
 */
export async function calculateHackathonRankings(hackathonId: string): Promise<RankedTeamResult[]> {
  const adminClient = getSupabaseAdmin();

  // 1. Verify Hackathon existence
  const { data: hackathon, error: hackError } = await adminClient
    .from("hackathons")
    .select("*")
    .eq("id", hackathonId)
    .maybeSingle();

  if (hackError) {
    throw new Error(`Database error verifying hackathon: ${hackError.message}`);
  }
  if (!hackathon) {
    throw new Error(`Hackathon record not found in database for ID: ${hackathonId}`);
  }

  // 2. Fetch all teams in hackathon
  const { data: teams, error: teamsError } = await adminClient
    .from("hackathon_teams")
    .select("*")
    .eq("hackathon_id", hackathonId);

  if (teamsError) {
    throw new Error(`Database error fetching hackathon teams: ${teamsError.message}`);
  }
  if (!teams || teams.length === 0) {
    throw new Error(`No teams found registered under hackathon ID: ${hackathonId}`);
  }

  const results: RankedTeamResult[] = [];

  // 3. Gather upstream analyses and calculate composite score for each team
  for (const team of teams) {
    // A. Fetch latest pitch analysis (Overall Pitch Score)
    const { data: pitch, error: pitchError } = await adminClient
      .from("pitch_analyses")
      .select("*")
      .eq("team_id_or_candidate_id", team.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pitchError) {
      throw new Error(`Database error fetching pitch analysis for team ${team.team_name}: ${pitchError.message}`);
    }
    if (!pitch) {
      throw new Error(`Upstream Pitch Deck Analysis is missing for team ${team.team_name} (ID: ${team.id}). Cannot calculate ranking.`);
    }

    // B. Fetch team contributions breakdown
    const { data: contrib, error: contribError } = await adminClient
      .from("team_contributions")
      .select("*")
      .eq("team_id", team.id)
      .maybeSingle();

    if (contribError) {
      throw new Error(`Database error fetching contributions for team ${team.team_name}: ${contribError.message}`);
    }
    if (!contrib) {
      throw new Error(`Upstream Team Contribution breakdown is missing for team ${team.team_name} (ID: ${team.id}). Cannot calculate ranking.`);
    }

    // C. Parse scores
    const pitchScores = pitch.scores || {};
    const pitchScore = typeof pitchScores.overall_pitch_score === "number"
      ? pitchScores.overall_pitch_score
      : 50;

    const breakdown = contrib.member_breakdown || {};
    const summary = breakdown.summary || {};
    const dominance = summary.dominance || {};
    const dominanceFlag = !!dominance.flag;
    const dominancePercentage = typeof dominance.percentage === "number"
      ? dominance.percentage
      : 0;

    // D. Apply ranking formula
    // Penalty: If one contributor is dominant (>80%), subtract 10% of their dominance percentage.
    let penalty = 0;
    if (dominanceFlag) {
      penalty = 0.1 * dominancePercentage;
    }
    const compositeScore = Math.max(0, pitchScore - penalty);

    results.push({
      team_id: team.id,
      team_name: team.team_name,
      pitch_score: pitchScore,
      dominance_percentage: dominancePercentage,
      dominance_flag: dominanceFlag,
      composite_score: compositeScore,
      rank: 0, // Assigned later
      contribution_summary: breakdown
    });
  }

  // 4. Sort and assign rankings
  results.sort((a, b) => b.composite_score - a.composite_score);
  results.forEach((team, idx) => {
    team.rank = idx + 1;
  });

  // 5. Save results to hackathon_results table
  for (const team of results) {
    const { error: saveError } = await adminClient
      .from("hackathon_results")
      .upsert({
        hackathon_id: hackathonId,
        team_id: team.team_id,
        pitch_score: team.pitch_score,
        contribution_summary: team.contribution_summary,
        team_ranking: team.rank,
        created_at: new Date().toISOString()
      }, {
        onConflict: "hackathon_id,team_id"
      });

    if (saveError) {
      throw new Error(`Failed to persist leaderboard row for team ${team.team_name}: ${saveError.message}`);
    }
  }

  return results;
}

/**
 * Retrieves the complete leaderboard for a hackathon, including team ranking
 * and member details (talent_score and skills) for recruiter scouting drill-down.
 */
export async function getHackathonLeaderboard(hackathonId: string): Promise<RankedTeamResult[]> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch ranked results
  const { data: results, error: resultsError } = await adminClient
    .from("hackathon_results")
    .select("*, team:hackathon_teams(team_name)")
    .eq("hackathon_id", hackathonId)
    .order("team_ranking", { ascending: true });

  if (resultsError) {
    throw new Error(`Database error fetching leaderboard: ${resultsError.message}`);
  }

  const finalLeaderboard: RankedTeamResult[] = [];

  // 2. Fetch members and their detailed talent scores for scouting
  for (const row of results || []) {
    const teamName = row.team?.team_name || "Unknown Team";

    // Fetch members registered in this team
    const { data: members, error: membersError } = await adminClient
      .from("hackathon_members")
      .select("candidate_id")
      .eq("team_id", row.team_id);

    const detailedMembers: any[] = [];
    if (members && !membersError) {
      for (const m of members) {
        const { data: profile } = await adminClient
          .from("candidate_profiles")
          .select("user_id, full_name, headline, talent_score, talent_score_overall, talent_profile, github_username")
          .eq("id", m.candidate_id)
          .maybeSingle();

        if (profile) {
          const overall = (typeof profile.talent_score === "object" && profile.talent_score)
            ? (profile.talent_score as any).overallScore
            : (profile.talent_score_overall ?? 70);

          detailedMembers.push({
            candidate_id: profile.user_id,
            full_name: profile.full_name || profile.github_username || "Developer",
            headline: profile.headline || "",
            github_username: profile.github_username,
            talent_score: overall || 70,
            skills: profile.talent_profile?.resume?.skills || []
          });
        }
      }
    }

    const breakdown = row.contribution_summary || {};
    const summary = breakdown.summary || {};
    const dominance = summary.dominance || {};

    finalLeaderboard.push({
      team_id: row.team_id,
      team_name: teamName,
      pitch_score: Number(row.pitch_score),
      dominance_percentage: dominance.percentage || 0,
      dominance_flag: !!dominance.flag,
      composite_score: Number(row.pitch_score) - (dominance.flag ? (0.1 * (dominance.percentage || 0)) : 0),
      rank: row.team_ranking,
      contribution_summary: breakdown,
      members: detailedMembers
    });
  }

  return finalLeaderboard;
}
