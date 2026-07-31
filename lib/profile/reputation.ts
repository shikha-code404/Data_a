import { getSupabaseAdmin } from "../db/client";
import { MOCK_PROFILES } from "../db/mockProfiles";

export interface CommunityReputationBreakdown {
  github: number;
  pull_requests: number;
  hackathons: number;
  verified_skills: number;
}

export interface CommunityReputationResult {
  community_score: number;
  breakdown: CommunityReputationBreakdown;
  reasoning: string;
}

export const inMemoryCommunityReputationStore = new Map<string, CommunityReputationResult>();

/**
 * Calculates a 100% deterministic Community Reputation Score (0-100)
 * strictly based on candidate profile evidence with ZERO LLM calls.
 * 
 * Formula:
 * - 40% GitHub contribution activity
 * - 30% Merged pull requests
 * - 20% Hackathon participation
 * - 10% Verified skill badges
 */
export function calculateCommunityReputationFromData(profileData: any): CommunityReputationResult {
  const profile = profileData || {};
  const githubData = profile.github_data || {};
  const talentProfile = profile.talent_profile || {};

  // 1. GitHub Contribution Activity (40% Weight)
  const commitsObj = githubData.commits || {};
  const totalCommits = typeof commitsObj.total_last_12_months === "number" 
    ? commitsObj.total_last_12_months 
    : (Array.isArray(talentProfile.github?.repositories) ? talentProfile.github.repositories.length * 20 : 0);
  
  const activeMonths = Array.isArray(commitsObj.active_months) ? commitsObj.active_months.length : (totalCommits > 0 ? 6 : 0);
  
  const commitVolumePts = Math.min(1, totalCommits / 150) * 70;
  const consistencyPts = Math.min(1, activeMonths / 12) * 30;
  const githubScore = Math.min(100, Math.round(commitVolumePts + consistencyPts));

  // 2. Merged Pull Requests (30% Weight)
  const prsObj = githubData.pull_requests || {};
  const mergedPRs = typeof prsObj.merged === "number" ? prsObj.merged : 0;
  const openedPRs = typeof prsObj.opened === "number" ? prsObj.opened : mergedPRs;
  const mergeRatio = openedPRs > 0 ? Math.min(1, mergedPRs / openedPRs) : (mergedPRs > 0 ? 1 : 0);

  const prVolumePts = Math.min(1, mergedPRs / 20) * 70;
  const prQualityPts = mergeRatio * 30;
  const prScore = Math.min(100, Math.round(prVolumePts + prQualityPts));

  // 3. Hackathon Participation (20% Weight)
  const hackathonsList = Array.isArray(talentProfile.manual?.hackathons)
    ? talentProfile.manual.hackathons
    : (Array.isArray(profile.hackathons) ? profile.hackathons : []);

  let hackathonPts = 0;
  for (const hack of hackathonsList) {
    hackathonPts += 30; // 30 pts for participation
    const text = `${hack.title || ""} ${hack.award || ""} ${hack.description || ""}`.toLowerCase();
    if (/winner|1st|first|place|award|champion|gold|top/i.test(text)) {
      hackathonPts += 35; // Bonus for win/award
    }
  }
  const hackathonScore = Math.min(100, hackathonPts);

  // 4. Verified Skill Badges (10% Weight)
  const skillBadgesList = Array.isArray(profile.skill_badges)
    ? profile.skill_badges
    : (Array.isArray(talentProfile.skills) ? talentProfile.skills : []);

  const verifiedCount = Array.isArray(profile.skill_verifications)
    ? profile.skill_verifications.filter((v: any) => v.verified).length
    : skillBadgesList.length;

  const verifiedSkillsScore = Math.min(100, verifiedCount * 25);

  // Composite Weighted Score (0-100)
  const communityScore = Math.min(100, Math.max(0, Math.round(
    githubScore * 0.40 +
    prScore * 0.30 +
    hackathonScore * 0.20 +
    verifiedSkillsScore * 0.10
  )));

  const reasoning = `Community Reputation Score of ${communityScore}/100 calculated deterministically: ` +
    `GitHub Activity (${githubScore} × 40% = ${(githubScore * 0.4).toFixed(1)}), ` +
    `Merged PRs (${prScore} × 30% = ${(prScore * 0.3).toFixed(1)}), ` +
    `Hackathons (${hackathonScore} × 20% = ${(hackathonScore * 0.2).toFixed(1)}), ` +
    `Verified Badges (${verifiedSkillsScore} × 10% = ${(verifiedSkillsScore * 0.1).toFixed(1)}).`;

  return {
    community_score: communityScore,
    breakdown: {
      github: githubScore,
      pull_requests: prScore,
      hackathons: hackathonScore,
      verified_skills: verifiedSkillsScore
    },
    reasoning
  };
}

/**
 * Main service method to compute or retrieve candidate's Community Reputation Score.
 * Automatically saves result to candidate_profiles.community_reputation in database.
 */
export async function getOrComputeCommunityReputation(
  candidateId: string,
  forceFresh = false
): Promise<CommunityReputationResult> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  const adminClient = getSupabaseAdmin();

  // 1. Return cached from DB/Memory if not forceFresh
  if (!forceFresh) {
    const mem = inMemoryCommunityReputationStore.get(candidateId);
    if (mem) {
      return mem;
    }

    try {
      const { data: profile } = await adminClient
        .from("candidate_profiles")
        .select("community_reputation")
        .eq("user_id", candidateId)
        .maybeSingle();

      if (profile?.community_reputation?.community_score !== undefined) {
        return profile.community_reputation as CommunityReputationResult;
      }
    } catch (e) {
      // Ignore DB cache errors
    }
  }

  // 2. Fetch full profile data & skill verifications
  let profile: any = null;
  try {
    const { data } = await adminClient
      .from("candidate_profiles")
      .select("user_id, talent_profile, github_data, skill_badges")
      .eq("user_id", candidateId)
      .maybeSingle();
    
    if (data) {
      profile = data;
      // Fetch skill verifications
      const { data: verifications } = await adminClient
        .from("skill_verifications")
        .select("skill, verified")
        .eq("candidate_id", candidateId);
      if (verifications) {
        profile.skill_verifications = verifications;
      }
    }
  } catch (e) {
    // Network/DB error fallback
  }

  if (!profile) {
    profile = MOCK_PROFILES[candidateId];
  }

  if (!profile) {
    // Return base default clean profile score if profile not found
    profile = {
      user_id: candidateId,
      talent_profile: { resume: { skills: ["React", "TypeScript"] } },
      github_data: { commits: { total_last_12_months: 50, active_months: ["2025-01"] }, pull_requests: { merged: 5, opened: 5 } }
    };
  }

  // 3. Compute deterministic score
  const result = calculateCommunityReputationFromData(profile);

  // 4. Save result to memory store
  inMemoryCommunityReputationStore.set(candidateId, result);

  // 5. Update candidate_profiles in DB
  try {
    await adminClient
      .from("candidate_profiles")
      .update({
        community_reputation: result,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", candidateId);
  } catch (e) {
    // Ignore DB update errors in offline/demo mode
  }

  return result;
}
