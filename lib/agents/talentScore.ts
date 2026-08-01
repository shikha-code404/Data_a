import { z } from "zod";
import { callAgent } from "./callAgent";
import { getSupabaseAdmin } from "../db/client";
import { generateCareerGuidance } from "../profile/career";

// Zod schema representing the strict target format
export const TalentScoreResponseSchema = z.object({
  scores: z.object({
    coding_ability: z.number().min(0).max(100),
    project_quality: z.number().min(0).max(100),
    leadership: z.number().min(0).max(100),
    problem_solving: z.number().min(0).max(100),
    innovation: z.number().min(0).max(100),
    community_participation: z.number().min(0).max(100),
    technical_consistency: z.number().min(0).max(100),
  }),
  overall_score: z.number().min(0).max(100),
  reasoning: z.string(),
});

export type TalentScoreResponse = z.infer<typeof TalentScoreResponseSchema>;

const FALLBACK_SCORE: TalentScoreResponse = {
  scores: {
    coding_ability: 30,
    project_quality: 30,
    leadership: 30,
    problem_solving: 30,
    innovation: 30,
    community_participation: 30,
    technical_consistency: 30,
  },
  overall_score: 30,
  reasoning: "Score calculations failed schema validation repeatedly. Default conservative values applied.",
};

/**
 * Executes the Talent Score AI Agent to score a candidate based on their talent_profile.
 */
export async function calculateCandidateTalentScore(
  userId: string
): Promise<{ success: boolean; data: TalentScoreResponse & { needs_review?: boolean } }> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch candidate's talent_profile
  const { data: profile, error: profileError } = await adminClient
    .from("candidate_profiles")
    .select("talent_profile")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError || !profile?.talent_profile) {
    throw new Error(`Candidate does not have a completed talent_profile: ${profileError?.message || "Profile not found"}`);
  }

  const talentProfile = profile.talent_profile;

  const basePrompt = `You are a professional technical recruiter and engineering evaluator. Rate the developer's talent profile based STRICTLY on evidence in the provided JSON data.

TALENT PROFILE DATA:
${JSON.stringify(talentProfile, null, 2)}

INSTRUCTIONS:
1. Base every sub-score only on evidence present in the provided talent_profile (specific repos, languages, commit volume, resume experience/projects). Do not invent achievements not present in the input.
2. If a category has no supporting evidence, score it conservatively (below 40) rather than guessing high.
3. Return ONLY a valid JSON object matching this exact schema:

{
  "scores": {
    "coding_ability": number (0-100),
    "project_quality": number (0-100),
    "leadership": number (0-100),
    "problem_solving": number (0-100),
    "innovation": number (0-100),
    "community_participation": number (0-100),
    "technical_consistency": number (0-100)
  },
  "overall_score": number (0-100),
  "reasoning": string (max 3 sentences, plain text, no markdown)
}

No commentary, no markdown code fences, no extra fields. Return ONLY valid JSON.`;

  let finalData: (TalentScoreResponse & { needs_review?: boolean }) | null = null;
  let needsReview = false;

  // 2. Attempt 1: Call talent_score agent
  console.log(`[Talent Score Attempt 1] Invoking callAgent for user: ${userId}`);
  try {
    const rawResponse = await callAgent("talent_score", {
      talent_profile: talentProfile,
      prompt: basePrompt,
      timestamp: Date.now(),
    });

    const validation = TalentScoreResponseSchema.safeParse(rawResponse);

    if (validation.success) {
      finalData = validation.data;
      console.log("[Talent Score Attempt 1] Validation Succeeded!");
    } else {
      console.warn("[Talent Score Attempt 1] Validation Failed:", validation.error.format());

      // 3. Attempt 2: Retry once with Zod errors appended
      const errorList = validation.error.issues
        .map((e) => `- Path "${e.path.join(".")}": ${e.message}`)
        .join("\n");

      const retryPrompt = `You are an engineering evaluator. Your previous scoring JSON response failed strict validation rules.
Please fix the validation errors listed below and return ONLY valid JSON matching the exact schema:

VALIDATION ERRORS:
${errorList}

TALENT PROFILE DATA:
${JSON.stringify(talentProfile, null, 2)}

Return ONLY valid JSON matching the schema. No commentary.`;

      console.log(`[Talent Score Attempt 2] Retrying agent call with error hints.`);
      const rawRetryResponse = await callAgent("talent_score", {
        talent_profile: talentProfile,
        prompt: retryPrompt,
        validation_errors: errorList,
        timestamp: Date.now(),
      });

      const retryValidation = TalentScoreResponseSchema.safeParse(rawRetryResponse);
      if (retryValidation.success) {
        finalData = retryValidation.data;
        console.log("[Talent Score Attempt 2] Validation Succeeded!");
      } else {
        console.error("[Talent Score Attempt 2] Validation Failed again:", retryValidation.error.format());
        
        // 4. Fallback conservative score if both fail
        finalData = { ...FALLBACK_SCORE, needs_review: true };
        needsReview = true;
      }
    }
  } catch (err: any) {
    console.error("[Talent Score Exception] Critical failure during agent call:", err);
    finalData = { ...FALLBACK_SCORE, needs_review: true };
    needsReview = true;
  }

  // 5. Store the results in the database
  const { error: dbError } = await adminClient
    .from("candidate_profiles")
    .update({
      talent_score: finalData,
      talent_score_overall: finalData.overall_score,
      talent_score_breakdown: finalData.scores,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (dbError) {
    console.error("Failed to save talent_score to candidate_profiles:", dbError);
    return { success: false, data: finalData };
  }

  console.log(`[Talent Score Success] Saved talent_score to profile for user_id ${userId}`);

  // Automatically trigger career roadmap generation / update
  try {
    console.log(`[Talent Score Success] Triggering fresh career roadmap generation for user_id ${userId}...`);
    await generateCareerGuidance(userId, true);
  } catch (err) {
    console.error(`[Talent Score Warning] Failed to trigger career roadmap generation:`, err);
  }

  return { success: true, data: finalData };
}
