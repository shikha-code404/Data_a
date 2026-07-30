import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { MOCK_PROFILES } from "../db/mockProfiles";


export interface MemberContributionStats {
  user_id: string;
  github_username: string;
  total_commits: number;
  prs_opened: number;
  prs_merged: number;
  active_repos: number;
  timeline: Array<{ month: string; commits: number }>;
}

export interface TeamContributionsBreakdown {
  members: MemberContributionStats[];
  summary: {
    total_commits: number;
    total_prs_opened: number;
    total_prs_merged: number;
    most_active_contributor: {
      user_id: string;
      github_username: string;
      commits: number;
    } | null;
    contribution_balance: Array<{
      user_id: string;
      github_username: string;
      percentage: number;
    }>;
    dominance: {
      flag: boolean;
      percentage: number;
      member_username: string | null;
    };
  };
}

/**
 * Calculates aggregate GitHub contributions for a team of candidates.
 * Uses cached github_data from candidate_profiles.
 */
export async function calculateTeamContributions(
  teamId: string,
  memberIds: string[]
): Promise<{ team_id: string; breakdown: TeamContributionsBreakdown; ai_summary: string | null }> {
  if (!teamId || teamId.trim() === "") {
    throw new Error("Team ID is required.");
  }
  if (!memberIds || memberIds.length === 0) {
    throw new Error("At least one member ID is required to aggregate team contributions.");
  }

  const supabase = getSupabaseAdmin();

  console.log(`[Team Analytics] Fetching profiles for members:`, memberIds);
  // Fetch profiles of all requested members
  const { data: profiles, error: dbError } = await supabase
    .from("candidate_profiles")
    .select("user_id, github_username, github_data")
    .in("user_id", memberIds);

  let foundProfiles = profiles || [];
  if (dbError) {
    console.warn(`Database error fetching team profiles: ${dbError.message}`);
  }

  // Fallback to MOCK_PROFILES for any missing members
  const foundUserIds = new Set(foundProfiles.map(p => p.user_id));
  for (const id of memberIds) {
    if (!foundUserIds.has(id)) {
      const mockProf = MOCK_PROFILES[id];
      if (mockProf) {
        foundProfiles.push({
          user_id: mockProf.user_id,
          github_username: mockProf.github_username,
          github_data: mockProf.github_data
        });
        foundUserIds.add(id);
      } else {
        throw new Error(`Candidate profile not found for user ID: ${id}. Cannot aggregate team analytics.`);
      }
    }
  }

  const membersStats: MemberContributionStats[] = [];

  // Compute contribution metrics per member
  for (const profile of foundProfiles) {
    const gitData = (profile.github_data as any) || {};
    const commits = gitData.commits || {};
    const prs = gitData.pull_requests || {};
    const repos = gitData.repositories || [];

    const totalCommits = typeof commits.total_last_12_months === 'number' ? commits.total_last_12_months : 0;
    const prsOpened = typeof prs.opened === 'number' ? prs.opened : 0;
    const prsMerged = typeof prs.merged === 'number' ? prs.merged : 0;
    
    // Count active non-fork repositories
    const activeRepos = repos.filter((r: any) => !r.is_fork).length;

    // Distribute commits across active months to create a simple timeline
    const activeMonths: string[] = Array.isArray(commits.active_months) ? commits.active_months : [];
    const timeline: Array<{ month: string; commits: number }> = [];

    if (activeMonths.length > 0) {
      const baseCommits = Math.floor(totalCommits / activeMonths.length);
      const remainder = totalCommits % activeMonths.length;

      activeMonths.forEach((month, idx) => {
        timeline.push({
          month,
          commits: baseCommits + (idx < remainder ? 1 : 0)
        });
      });
    } else {
      // Fallback if no active months list is populated
      timeline.push({
        month: new Date().toISOString().substring(0, 7),
        commits: totalCommits
      });
    }

    membersStats.push({
      user_id: profile.user_id,
      github_username: profile.github_username || "unknown-user",
      total_commits: totalCommits,
      prs_opened: prsOpened,
      prs_merged: prsMerged,
      active_repos: activeRepos,
      timeline
    });
  }

  // Aggregate team-level summary
  let teamCommits = 0;
  let teamPrsOpened = 0;
  let teamPrsMerged = 0;
  let highestCommits = -1;
  let mostActive: { user_id: string; github_username: string; commits: number } | null = null;

  membersStats.forEach(m => {
    teamCommits += m.total_commits;
    teamPrsOpened += m.prs_opened;
    teamPrsMerged += m.prs_merged;

    if (m.total_commits > highestCommits) {
      highestCommits = m.total_commits;
      mostActive = {
        user_id: m.user_id,
        github_username: m.github_username,
        commits: m.total_commits
      };
    }
  });

  // Calculate contribution shares and dominance
  const balance = membersStats.map(m => {
    const share = teamCommits > 0 ? (m.total_commits / teamCommits) * 100 : 0;
    return {
      user_id: m.user_id,
      github_username: m.github_username,
      percentage: Math.round(share * 100) / 100
    };
  });

  let dominanceFlag = false;
  let dominancePercentage = 0;
  let dominanceUsername: string | null = null;

  balance.forEach(b => {
    if (b.percentage > 80) {
      dominanceFlag = true;
      dominancePercentage = b.percentage;
      dominanceUsername = b.github_username;
    }
  });

  const breakdown: TeamContributionsBreakdown = {
    members: membersStats,
    summary: {
      total_commits: teamCommits,
      total_prs_opened: teamPrsOpened,
      total_prs_merged: teamPrsMerged,
      most_active_contributor: mostActive,
      contribution_balance: balance,
      dominance: {
        flag: dominanceFlag,
        percentage: dominancePercentage,
        member_username: dominanceUsername
      }
    }
  };

  // Optional AI commentary (2-3 sentences plain-text)
  let aiSummary: string | null = null;
  try {
    console.log(`[Team Analytics] Requesting optional AI summary...`);
    const aiResponse: any = await callAgent('team_contribution_summary', {
      aggregated_data: {
        total_commits: teamCommits,
        total_prs_opened: teamPrsOpened,
        total_prs_merged: teamPrsMerged,
        dominance_flag: dominanceFlag,
        dominance_percentage: dominancePercentage,
        dominance_user: dominanceUsername
      }
    });
    if (aiResponse && aiResponse.summary) {
      aiSummary = aiResponse.summary;
    }
  } catch (err) {
    console.warn(`[Team Analytics] Optional AI summary generation failed:`, err);
  }

  try {
    const { error: saveError } = await supabase
      .from("team_contributions")
      .upsert({
        team_id: teamId,
        member_breakdown: breakdown,
        ai_summary: aiSummary,
        created_at: new Date().toISOString()
      }, {
        onConflict: "team_id"
      });

    if (saveError) {
      console.warn(`[Team Analytics] Failed to save team contributions to database (table may not exist):`, saveError.message);
    }
  } catch (err) {
    console.warn(`[Team Analytics] Exception saving team contributions to database:`, err);
  }

  return {
    team_id: teamId,
    breakdown,
    ai_summary: aiSummary
  };
}
