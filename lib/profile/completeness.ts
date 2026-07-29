import { getSupabaseAdmin } from "../db/client";

export interface CompletenessItem {
  label: string;
  complete: boolean;
}

export interface CompletenessResult {
  items: CompletenessItem[];
  percentage: number;
}

/**
 * Calculates profile completeness given a candidate_profiles database record.
 */
export function calculateProfileCompleteness(profile: any): CompletenessResult {
  if (!profile) {
    return {
      items: [
        { label: "GitHub connected", complete: false },
        { label: "Resume uploaded", complete: false },
        { label: "At least 1 skill badge earned", complete: false },
        { label: "At least 1 project in resume_data", complete: false },
        { label: "At least 1 manual entry (hackathon, cert, or award)", complete: false },
      ],
      percentage: 0,
    };
  }

  // 1. GitHub connected
  const isGitHubConnected = !!profile.github_access_token;

  // 2. Resume uploaded
  const isResumeUploaded = !!profile.resume_data;

  // 3. At least 1 skill badge earned
  const hasSkillBadge = Array.isArray(profile.skill_badges) && profile.skill_badges.length > 0;

  // 4. At least 1 project in resume_data
  const hasProject = Array.isArray(profile.resume_data?.projects) && profile.resume_data.projects.length > 0;

  // 5. At least 1 manual entry (hackathon, cert, or award)
  const manual = profile.talent_profile?.manual || {};
  const hasHackathons = Array.isArray(manual.hackathons) && manual.hackathons.length > 0;
  const hasCerts = Array.isArray(manual.certifications) && manual.certifications.length > 0;
  const hasAwards = Array.isArray(manual.awards) && manual.awards.length > 0;
  const hasManualEntry = hasHackathons || hasCerts || hasAwards;

  const items: CompletenessItem[] = [
    { label: "GitHub connected", complete: isGitHubConnected },
    { label: "Resume uploaded", complete: isResumeUploaded },
    { label: "At least 1 skill badge earned", complete: hasSkillBadge },
    { label: "At least 1 project in resume_data", complete: hasProject },
    { label: "At least 1 manual entry (hackathon, cert, or award)", complete: hasManualEntry },
  ];

  const completedCount = items.filter((item) => item.complete).length;
  const percentage = Math.round((completedCount / items.length) * 100);

  return {
    items,
    percentage,
  };
}

/**
 * Fetches candidate profile by user ID and calculates completeness.
 */
export async function getProfileCompletenessForUser(userId: string): Promise<CompletenessResult> {
  const adminClient = getSupabaseAdmin();

  const { data: profile, error } = await adminClient
    .from("candidate_profiles")
    .select("github_access_token, resume_data, skill_badges, talent_profile")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch candidate profile for completeness calculation:", error);
  }

  return calculateProfileCompleteness(profile);
}
