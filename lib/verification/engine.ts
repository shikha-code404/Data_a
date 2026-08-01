import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { MOCK_PROFILES } from "../db/mockProfiles";
import { MOCK_MCQ_QUESTIONS } from "./mockQuestions";



// ============================================================
// Constants
// ============================================================

/**
 * Maps a skill name to the GitHub primary_language values that
 * count as evidence for that skill.
 */
const SKILL_LANGUAGE_MAP: Record<string, string[]> = {
  React: ["TypeScript", "JavaScript"],
  TypeScript: ["TypeScript"],
  Python: ["Python"],
  SQL: ["PLSQL", "PLpgSQL", "SQL"],
};

/**
 * One canonical free-response question per supported skill.
 * The engine uses this to call the LLM grader.
 */
export const FREE_RESPONSE_QUESTIONS: Record<string, string> = {
  React:
    "Explain how React's reconciliation algorithm decides what to re-render, and what role the key prop plays.",
  Python:
    "Explain the difference between a generator and a list comprehension in Python, including memory implications.",
  SQL:
    "Explain the difference between INNER JOIN, LEFT JOIN, and a correlated subquery, and when you'd prefer each.",
  TypeScript:
    "What is the difference between `interface` and `type` in TypeScript, and when would you use one over the other?",
};

// ============================================================
// Types
// ============================================================

export interface MCQQuestion {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface SkillVerificationResult {
  candidate_id: string;
  skill: string;
  /** 0-100: proportion of MCQ answers that matched correct_answer exactly */
  mcq_score: number;
  /** 0-100: LLM-graded free-response score */
  free_response_score: number;
  /** 0-100: deterministic GitHub signal (0 if no matching repos or no github_data) */
  repo_quality_score: number;
  /** Weighted composite: MCQ 40% + FR 40% + GitHub 20% */
  weighted_score: number;
  /** true if weighted_score >= 65 */
  verified: boolean;
  /** Human-readable breakdown of how each sub-score was computed */
  evidence: string[];
}

// ============================================================
// Component A — MCQ Grading (deterministic)
// ============================================================

/**
 * Fetches MCQ questions for a skill from the DB (ordered by created_at, id for
 * stable ordering) and grades the provided answers by exact-match comparison.
 * Throws if no questions exist for the skill.
 *
 * @param skill    Skill name (must match mcq_questions.skill)
 * @param answers  Candidate's answers — same length and order as questions fetched.
 *                 Each entry must be the full option string (e.g. "B. useEffect").
 */
async function gradeMCQ(
  skill: string,
  answers: string[]
): Promise<{ score: number; questions: MCQQuestion[]; evidence: string[] }> {
  const adminClient = getSupabaseAdmin();

  const { data, error } = await adminClient
    .from("mcq_questions")
    .select("id, skill, question, options, correct_answer, difficulty")
    .eq("skill", skill)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.warn(`Failed to fetch MCQ questions for skill "${skill}" from DB: ${error.message}`);
  }

  let questions = (data || []) as MCQQuestion[];
  if (questions.length === 0) {
    questions = MOCK_MCQ_QUESTIONS.filter(q => q.skill.toLowerCase() === skill.toLowerCase());
  }

  if (questions.length === 0) {
    throw new Error(`No MCQ questions found for skill "${skill}".`);
  }

  const total = questions.length;
  const submitted = answers.length;

  if (submitted === 0) {
    return {
      score: 0,
      questions,
      evidence: [`MCQ: 0/${total} correct (no answers submitted)`],
    };
  }

  let correct = 0;
  for (let i = 0; i < total; i++) {
    const givenAnswer = answers[i] ?? "";
    if (givenAnswer.trim() === questions[i].correct_answer.trim()) {
      correct++;
    }
  }

  const score = Math.round((correct / total) * 100);
  return {
    score,
    questions,
    evidence: [
      `MCQ: ${correct}/${total} correct → score ${score}/100 (${submitted} of ${total} answers received)`,
    ],
  };
}

// ============================================================
// Component B — Free-Response Grading (LLM via callAgent)
// ============================================================

interface FreeResponseGraderOutput {
  score: number;    // 0–100
  correct: boolean;
  feedback: string; // max 2 sentences
}

/**
 * Calls callAgent('skill_verification_grader') with the skill, question, and
 * candidate's answer. Parses the LLM response as { score, correct, feedback }.
 * If the agent call fails, returns score=0 with a fallback evidence note.
 */
async function gradeFreeResponse(
  skill: string,
  candidateAnswer: string
): Promise<{ score: number; evidence: string[] }> {
  const question = FREE_RESPONSE_QUESTIONS[skill];
  if (!question) {
    return {
      score: 0,
      evidence: [`Free response: No question configured for skill "${skill}" — scored 0.`],
    };
  }

  if (!candidateAnswer || !candidateAnswer.trim()) {
    return {
      score: 0,
      evidence: [`Free response: No answer provided — scored 0.`],
    };
  }

  try {
    const agentResponse = (await callAgent("skill_verification_grader", {
      skill,
      question,
      candidate_answer: candidateAnswer.trim(),
      instructions:
        "Grade strictly for technical accuracy. Do NOT reward answer length or confidence. " +
        "Respond with ONLY a valid JSON object matching this sample structure (do NOT copy sample values): " +
        "{ \"score\": 85, \"correct\": true, \"feedback\": \"Accurate explanation of core concept and edge cases.\" }",
    })) as Partial<FreeResponseGraderOutput>;

    const score = typeof agentResponse.score === "number"
      ? Math.min(100, Math.max(0, Math.round(agentResponse.score)))
      : 0;

    const feedback = agentResponse.feedback ?? "No feedback returned.";
    const correct = agentResponse.correct ?? score >= 60;

    return {
      score,
      evidence: [
        `Free response: LLM score ${score}/100 | correct=${correct} | feedback: "${feedback}"`,
      ],
    };
  } catch (err: any) {
    console.warn(`[SkillVerification] LLM grader failed for skill "${skill}":`, err?.message);
    return {
      score: 0,
      evidence: [
        `Free response: LLM grader unavailable — scored 0. (${err?.message ?? "unknown error"})`,
      ],
    };
  }
}

// ============================================================
// Component C — GitHub Repo Quality Signal (deterministic)
// ============================================================

/**
 * Computes a 0-100 repo quality score from cached github_data.
 * Returns 0 with an evidence note if:
 *   - candidate has no github_data
 *   - github_data has no repos whose primary_language matches the skill's language map
 *
 * Sub-signals (max pts):
 *   lang_repo_count    : up to 40 pts  (non-fork repos in skill language)
 *   lang_commit_density: up to 30 pts  (combined commits in those repos)
 *   pr_merge_ratio     : up to 15 pts  (merged / total PRs)
 *   active_months      : up to 15 pts  (distinct active months in last 12 months)
 *
 * Total is capped at 100.
 */
async function computeGitHubSignal(
  candidateId: string,
  skill: string
): Promise<{ score: number; evidence: string[] }> {
  const adminClient = getSupabaseAdmin();

  let githubData: any = null;
  
  const { data: profile, error } = await adminClient
    .from("candidate_profiles")
    .select("github_data")
    .eq("user_id", candidateId)
    .maybeSingle();

  if (error) {
    console.warn(`Failed to fetch github_data for candidate ${candidateId} from DB: ${error.message}`);
  }

  githubData = profile?.github_data || MOCK_PROFILES[candidateId]?.github_data;

  if (!githubData) {
    return {
      score: 0,
      evidence: [`GitHub signal: No github_data found for candidate — scored 0.`],
    };
  }

  const mappedLanguages = SKILL_LANGUAGE_MAP[skill] ?? [];
  if (mappedLanguages.length === 0) {
    return {
      score: 0,
      evidence: [
        `GitHub signal: No language mapping defined for skill "${skill}" — scored 0.`,
      ],
    };
  }

  // 1. Count non-fork repos whose primary_language is in the mapped set
  const repositories: Array<{
    name: string;
    primary_language: string | null;
    is_fork: boolean;
  }> = githubData.repositories ?? [];

  const matchingRepos = repositories.filter(
    (r) => !r.is_fork && r.primary_language && mappedLanguages.includes(r.primary_language)
  );

  if (matchingRepos.length === 0) {
    return {
      score: 0,
      evidence: [
        `GitHub signal: No non-fork repositories found using ${mappedLanguages.join(" or ")} — scored 0. ` +
        `(${repositories.length} total repos scanned)`,
      ],
    };
  }

  const repoNames = matchingRepos.map((r) => r.name);

  // 2. lang_repo_count → up to 40 pts (13 pts per matching repo, capped)
  const langRepoPts = Math.min(matchingRepos.length * 13, 40);

  // 3. lang_commit_density → up to 30 pts (0.25 pts per commit, capped)
  const commitsByRepo: Record<string, number> = githubData.commits?.by_repository ?? {};
  const totalLangCommits = repoNames.reduce(
    (sum, name) => sum + (commitsByRepo[name] ?? 0),
    0
  );
  const commitPts = Math.min(Math.round(totalLangCommits * 0.25), 30);

  // 4. pr_merge_ratio → up to 15 pts
  const prs = githubData.pull_requests ?? {};
  const opened: number = prs.opened ?? 0;
  const merged: number = prs.merged ?? 0;
  const totalPrs = opened + merged;
  let prPts = 0;
  let mergeRatioStr = "N/A (no PRs)";
  if (totalPrs > 0) {
    const ratio = merged / totalPrs;
    mergeRatioStr = `${merged}/${totalPrs} (${Math.round(ratio * 100)}%)`;
    if (ratio >= 0.7) prPts = 15;
    else if (ratio >= 0.5) prPts = 10;
    else if (ratio >= 0.3) prPts = 5;
  }

  // 5. active_months → up to 15 pts (active out of last 12 months)
  const activeMonths: string[] = githubData.commits?.active_months ?? [];
  const monthPts = Math.min(Math.round((activeMonths.length / 12) * 15), 15);

  const rawScore = langRepoPts + commitPts + prPts + monthPts;
  const score = Math.min(100, rawScore);

  const evidence = [
    `GitHub signal: score ${score}/100`,
    `  • Matching ${skill} repos (non-fork): ${matchingRepos.length} → ${langRepoPts}/40 pts [${repoNames.join(", ")}]`,
    `  • Commits in those repos: ${totalLangCommits} → ${commitPts}/30 pts`,
    `  • PR merge ratio: ${mergeRatioStr} → ${prPts}/15 pts`,
    `  • Active months (last 12): ${activeMonths.length}/12 → ${monthPts}/15 pts`,
  ];

  return { score, evidence };
}

// ============================================================
// Combine — runSkillVerification
// ============================================================

/**
 * Runs all three verification components and stores the result.
 *
 * Scoring formula (approved):
 *   weighted_score = mcq_score × 0.40 + free_response_score × 0.40 + repo_quality_score × 0.20
 *   verified = weighted_score >= 65
 *
 * @param candidateId         UUID — must exist in candidate_profiles (throws otherwise)
 * @param skill               Exact skill name as stored in mcq_questions
 * @param mcqAnswers          Full option strings, same order as questions returned by the DB
 * @param freeResponseAnswer  Candidate's written answer to the free-response question
 */
export async function runSkillVerification(
  candidateId: string,
  skill: string,
  mcqAnswers: string[],
  freeResponseAnswer: string
): Promise<SkillVerificationResult> {
  const adminClient = getSupabaseAdmin();

  // Confirm candidate exists
  const { data: profile, error: profileError } = await adminClient
    .from("candidate_profiles")
    .select("user_id")
    .eq("user_id", candidateId)
    .maybeSingle();

  if (profileError) {
    console.warn(`Error looking up candidate ${candidateId} from DB: ${profileError.message}`);
  }
  
  const candidateExists = !!profile || !!MOCK_PROFILES[candidateId];
  if (!candidateExists) {
    throw new Error(`Candidate not found for ID: ${candidateId}`);
  }

  // Run all three components in parallel where safe
  // (GitHub signal is independent; MCQ and FR can run together)
  const [mcqResult, frResult, ghResult] = await Promise.all([
    gradeMCQ(skill, mcqAnswers),
    gradeFreeResponse(skill, freeResponseAnswer),
    computeGitHubSignal(candidateId, skill),
  ]);

  const mcq_score = mcqResult.score;
  const free_response_score = frResult.score;
  const repo_quality_score = ghResult.score;

  const weighted_score = Math.round(
    mcq_score * 0.40 +
    free_response_score * 0.40 +
    repo_quality_score * 0.20
  );
  const verified = weighted_score >= 65;

  const evidence: string[] = [
    `Weighted score: ${mcq_score}×0.40 + ${free_response_score}×0.40 + ${repo_quality_score}×0.20 = ${weighted_score}/100`,
    `Verified: ${verified} (threshold ≥ 65)`,
    ...mcqResult.evidence,
    ...frResult.evidence,
    ...ghResult.evidence,
  ];

  // Upsert into skill_verifications (one row per candidate + skill pair)
  const { error: upsertError } = await adminClient
    .from("skill_verifications")
    .upsert(
      {
        candidate_id: candidateId,
        skill,
        mcq_score,
        free_response_score,
        repo_quality_score,
        weighted_score,
        verified,
        evidence,
        created_at: new Date().toISOString(),
      },
      { onConflict: "candidate_id,skill" }
    );

  if (upsertError) {
    console.error(
      `[SkillVerification] Failed to upsert skill_verifications for candidate ${candidateId} skill ${skill}:`,
      upsertError.message
    );
    // Non-fatal: return result anyway
  }

  return {
    candidate_id: candidateId,
    skill,
    mcq_score,
    free_response_score,
    repo_quality_score,
    weighted_score,
    verified,
    evidence,
  };
}

/**
 * Fetches the MCQ questions for a skill so callers can display them
 * before collecting answers. Questions are returned in stable grading order.
 */
export async function getMCQQuestionsForSkill(skill: string): Promise<MCQQuestion[]> {
  const adminClient = getSupabaseAdmin();
  const { data, error } = await adminClient
    .from("mcq_questions")
    .select("id, skill, question, options, correct_answer, difficulty")
    .eq("skill", skill)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.warn(`Failed to fetch MCQ questions for skill "${skill}" from DB: ${error.message}`);
  }
  
  let questions = (data || []) as MCQQuestion[];
  if (questions.length === 0) {
    questions = MOCK_MCQ_QUESTIONS.filter(q => q.skill.toLowerCase() === skill.toLowerCase());
  }
  
  return questions;
}
