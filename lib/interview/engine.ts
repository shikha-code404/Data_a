import { z } from "zod";
import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { MOCK_PROFILES } from "../db/mockProfiles";


// Zod schemas for validation
export const InterviewQuestionsSchema = z.object({
  technical_questions: z.array(z.string()).min(3).max(4),
  behavioral_questions: z.array(z.string()).min(2).max(3),
});

export const InterviewReportSchema = z.object({
  confidence_score: z.number().min(0).max(100),
  technical_rating: z.number().min(0).max(100),
  communication_rating: z.number().min(0).max(100),
  hiring_recommendation: z.enum(['strong_yes', 'yes', 'maybe', 'no']),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  summary: z.string().max(200), // ~3 sentences max
  evaluation_method: z.string().optional(),
});

export type InterviewQuestions = z.infer<typeof InterviewQuestionsSchema>;
export type InterviewReport = z.infer<typeof InterviewReportSchema>;

/**
 * Generates tailored interview questions based on candidate profile.
 * Throws error if candidate profile is not found.
 */
export async function generateInterviewQuestions(candidateId: string): Promise<InterviewQuestions> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  const supabase = getSupabaseAdmin();
  const { data: profile, error: dbError } = await supabase
    .from("candidate_profiles")
    .select("talent_profile, talent_score")
    .eq("user_id", candidateId)
    .maybeSingle();

  if (dbError) {
    console.warn(`Database error fetching candidate profile: ${dbError.message}`);
  }
  
  const targetProfile = profile || MOCK_PROFILES[candidateId];
  if (!targetProfile) {
    throw new Error(`Candidate profile not found for ID: ${candidateId}`);
  }


  console.log(`[Interview Engine] Generating questions for candidate ${candidateId}...`);
  const rawResponse = await callAgent("interview_question_generator", {
    talent_profile: targetProfile.talent_profile,
    talent_score: targetProfile.talent_score,
  });

  const validation = InterviewQuestionsSchema.safeParse(rawResponse);
  if (!validation.success) {
    console.error("[Interview Engine] Question validation failed. Reverting to fallback questions.");
    return {
      technical_questions: [
        "Explain the difference between interface and type in TypeScript, and when to use which.",
        "Explain how React's reconciliation algorithm decides what to re-render.",
        "How does Node.js handle asynchronous operations under the hood?"
      ],
      behavioral_questions: [
        "Tell me about a time you had to optimize performance in a web application.",
        "How do you handle conflict or differing opinions within a development team?"
      ]
    };
  }

  return validation.data;
}

/**
 * Sanitizes partial/raw grader reports if strict schema validation fails twice.
 */
function sanitizePartialReport(raw: any): InterviewReport {
  const safeNum = (v: any, fallback = 50) => 
    typeof v === 'number' && !isNaN(v) ? Math.min(100, Math.max(0, v)) : fallback;
  const safeArr = (v: any) => 
    Array.isArray(v) ? v.map(String) : [];

  let rec: 'strong_yes' | 'yes' | 'maybe' | 'no' = 'maybe';
  if (raw && ['strong_yes', 'yes', 'maybe', 'no'].includes(raw.hiring_recommendation)) {
    rec = raw.hiring_recommendation;
  }

  return {
    confidence_score: safeNum(raw?.confidence_score, 50),
    technical_rating: safeNum(raw?.technical_rating, 50),
    communication_rating: safeNum(raw?.communication_rating, 50),
    hiring_recommendation: rec,
    strengths: safeArr(raw?.strengths).length > 0 ? safeArr(raw.strengths) : ["Completed the interview loop."],
    concerns: safeArr(raw?.concerns).length > 0 ? safeArr(raw.concerns) : ["Assessment requires manual review."],
    summary: typeof raw?.summary === 'string' && raw.summary.trim() 
      ? raw.summary.substring(0, 200) 
      : "Interview assessment failed strict validation. Reverting to manual review fallback.",
    evaluation_method: raw?.evaluation_method
  };
}

/**
 * Submits candidate interview answers, grades them with callAgent,
 * retries once on validation failure, and saves to database.
 */
export async function submitAndEvaluateInterview(
  candidateId: string,
  questions: string[],
  answers: Record<string, string>
): Promise<{ success: boolean; report: InterviewReport; needsReview: boolean }> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }
  if (!questions || questions.length === 0) {
    throw new Error("Questions list cannot be empty.");
  }

  const supabase = getSupabaseAdmin();
  const { data: profile, error: dbError } = await supabase
    .from("candidate_profiles")
    .select("talent_profile")
    .eq("user_id", candidateId)
    .maybeSingle();

  if (dbError) {
    console.warn(`Database error fetching candidate profile: ${dbError.message}`);
  }
  
  const targetProfile = profile || MOCK_PROFILES[candidateId];
  if (!targetProfile) {
    throw new Error(`Candidate profile not found for ID: ${candidateId}`);
  }


  const payload = {
    questions,
    answers,
    talent_profile: targetProfile.talent_profile
  };

  let report: InterviewReport | null = null;
  let needsReview = false;

  console.log(`[Interview Engine] Grader Attempt 1 for candidate ${candidateId}...`);
  try {
    const rawResponse = await callAgent("interview_evaluator", payload);
    const validation = InterviewReportSchema.safeParse(rawResponse);

    if (validation.success) {
      report = validation.data;
      console.log("[Interview Engine] Grader Attempt 1 Succeeded!");
    } else {
      console.warn("[Interview Engine] Grader Attempt 1 Failed:", validation.error.format());

      // Attempt 2: Retry once with validation errors
      const errorList = validation.error.issues
        .map((e) => `- Path "${e.path.join(".")}": ${e.message}`)
        .join("\n");

      console.log(`[Interview Engine] Grader Attempt 2 Retrying with errors...`);
      const rawRetryResponse = await callAgent("interview_evaluator", {
        ...payload,
        validation_errors: errorList
      });

      const retryValidation = InterviewReportSchema.safeParse(rawRetryResponse);
      if (retryValidation.success) {
        report = retryValidation.data;
        console.log("[Interview Engine] Grader Attempt 2 Succeeded!");
      } else {
        console.error("[Interview Engine] Grader Attempt 2 Failed again:", retryValidation.error.format());
        report = sanitizePartialReport(rawRetryResponse);
        needsReview = true;
      }
    }
  } catch (err) {
    console.error("[Interview Engine] Exception during evaluation:", err);
    report = sanitizePartialReport({});
    needsReview = true;
  }

  try {
    const { error: saveError } = await supabase
      .from("interview_reports")
      .upsert({
        candidate_id: candidateId,
        questions,
        answers,
        report,
        needs_review: needsReview,
        created_at: new Date().toISOString()
      }, {
        onConflict: "candidate_id"
      });

    if (saveError) {
      console.warn("[Interview Engine] Failed to save report to database (table may not exist):", saveError.message);
    }
  } catch (err) {
    console.warn("[Interview Engine] Exception saving report to database:", err);
  }

  return {
    success: true,
    report,
    needsReview
  };
}
