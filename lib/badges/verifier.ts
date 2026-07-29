import { getSupabaseAdmin } from "../db/client";

export interface SkillBadge {
  skill: string;
  badge: string;
  evidence: string;
}

/**
 * Calculates and awards rule-based verified skill badges for a candidate.
 */
export async function verifyCandidateSkillBadges(
  userId: string
): Promise<{ success: boolean; badges: SkillBadge[] }> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch candidate's github_data
  const { data: profile, error: dbError } = await adminClient
    .from("candidate_profiles")
    .select("github_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (dbError || !profile) {
    throw new Error(`Candidate profile not found: ${dbError?.message || "No record matched"}`);
  }

  const githubData = profile.github_data;
  const badges: SkillBadge[] = [];

  if (!githubData) {
    console.log(`[Badges Verification] No github_data present for user_id ${userId}. Skipping verifications.`);
    return { success: true, badges };
  }

  const repositories = githubData.repositories || [];
  const commits = githubData.commits || {};
  const commitsByRepo = commits.by_repository || {};
  const activeMonths = commits.active_months || [];
  const prs = githubData.pull_requests || {};
  const mergedPrs = prs.merged || 0;

  // RULE 1: Language Badge
  // "A language badge is earned if github_data shows 3+ repos using that language AND combined commit count in that language >= 20"
  // Group non-fork repositories by language
  const languageRepoGroups: Record<string, string[]> = {};
  for (const repo of repositories) {
    // Only count non-fork repositories
    if (repo.primary_language && !repo.is_fork) {
      if (!languageRepoGroups[repo.primary_language]) {
        languageRepoGroups[repo.primary_language] = [];
      }
      languageRepoGroups[repo.primary_language].push(repo.name);
    }
  }

  for (const [language, repoNames] of Object.entries(languageRepoGroups)) {
    const reposCount = repoNames.length;
    
    // Sum commits in commitsByRepo matching the repo names in this language group
    let combinedCommits = 0;
    for (const name of repoNames) {
      combinedCommits += commitsByRepo[name] || 0;
    }

    if (reposCount >= 3 && combinedCommits >= 20) {
      badges.push({
        skill: language,
        badge: `${language} Champion`,
        evidence: `Awarded for 3+ repositories and 20+ commits in ${language}. Found ${reposCount} repos with ${combinedCommits} combined commits.`,
      });
    }
  }

  // RULE 2: Merged Contributor Badge
  // "A 'Merged Contributor' badge is earned if github_data shows 5+ merged PRs"
  if (mergedPrs >= 5) {
    badges.push({
      skill: "Git Collaboration",
      badge: "Merged Contributor",
      evidence: `Awarded for merging 5+ Pull Requests. Found ${mergedPrs} merged PRs.`,
    });
  }

  // RULE 3: Consistent Contributor Badge
  // "A 'Consistent Contributor' badge is earned if commits are spread across at least 6 of the last 12 months (not just one burst)"
  const activeMonthsCount = activeMonths.length;
  if (activeMonthsCount >= 6) {
    badges.push({
      skill: "GitHub Contribution",
      badge: "Consistent Contributor",
      evidence: `Awarded for committing across at least 6 of the last 12 months. Found active commits in ${activeMonthsCount} months: [${activeMonths.join(", ")}].`,
    });
  }

  // 2. Save calculated badges to candidate_profiles in DB
  const { error: updateError } = await adminClient
    .from("candidate_profiles")
    .update({
      skill_badges: badges,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error(`Failed to update skill_badges for user_id ${userId}:`, updateError);
    return { success: false, badges };
  }

  console.log(`[Badges Verification Success] Awarded ${badges.length} badges to user_id ${userId}`);
  return { success: true, badges };
}
