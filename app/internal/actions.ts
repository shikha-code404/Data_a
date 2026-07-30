"use server";

import { callAgent } from "@/lib/agents/callAgent";
import { getSupabaseAdmin } from "@/lib/db/client";
import { ingestGitHubData } from "@/lib/github/ingestion";
import { extractTextFromPDF, parseResumeAndSave } from "@/lib/resume/parser";
import { calculateCandidateTalentScore } from "@/lib/agents/talentScore";
import { verifyCandidateSkillBadges } from "@/lib/badges/verifier";
import { getProfileCompletenessForUser } from "@/lib/profile/completeness";
import {
  runSkillVerification,
  getMCQQuestionsForSkill,
  FREE_RESPONSE_QUESTIONS,
} from "@/lib/verification/engine";
import { generateInterviewQuestions, submitAndEvaluateInterview } from "@/lib/interview/engine";
import { calculateTeamContributions } from "@/lib/analytics/team";


// Preset default candidate ID in database for testing
const TEST_CANDIDATE_USER_ID = "0ee73e0e-0529-4480-a16c-15748a277bde";

export async function submitAgentTest(agentType: string, inputPayload: string) {
  try {
    let parsedInput: any;
    try {
      parsedInput = JSON.parse(inputPayload);
    } catch (e) {
      throw new Error("Invalid input payload: Please provide a valid JSON string.");
    }

    // Call the agent
    const response = await callAgent(agentType, parsedInput);

    // Fetch matching rows written to agent_responses
    const adminClient = getSupabaseAdmin();
    const { data: cachedRows, error: dbError } = await adminClient
      .from("agent_responses")
      .select("*")
      .eq("agent_type", agentType)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.warn("Could not retrieve cached rows:", dbError.message);
    }

    return {
      success: true,
      response,
      cachedRows: cachedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testGitHubIngestion(username: string) {
  try {
    if (!username.trim()) {
      throw new Error("GitHub username is required.");
    }

    // Trigger Ingestion (updates user TEST_CANDIDATE_USER_ID)
    const githubData = await ingestGitHubData(username, TEST_CANDIDATE_USER_ID);

    // Fetch raw cache entries for this user
    const adminClient = getSupabaseAdmin();
    const { data: cachedRows } = await adminClient
      .from("github_api_cache")
      .select("*")
      .ilike("key", `%${username}%`)
      .order("created_at", { ascending: false });

    return {
      success: true,
      githubData,
      cachedRows: cachedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testResumePDFUpload(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No PDF file selected.");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const rawText = await extractTextFromPDF(buffer);
    if (!rawText.trim()) {
      throw new Error("PDF text extraction returned empty contents.");
    }

    // Parse and update DB for the default candidate
    const result = await parseResumeAndSave(rawText, TEST_CANDIDATE_USER_ID);

    return {
      success: result.success,
      rawText: rawText.slice(0, 1500) + (rawText.length > 1500 ? "\n... [TRUNCATED] ..." : ""),
      resumeData: result.data,
      needsReview: result.needsReview,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testTalentScoring(userId?: string) {
  try {
    const targetUserId = userId || TEST_CANDIDATE_USER_ID;
    
    // Calculate talent score
    const result = await calculateCandidateTalentScore(targetUserId);

    // Fetch talent_score cache records from agent_responses to review hash keys
    const adminClient = getSupabaseAdmin();
    const { data: cachedRows } = await adminClient
      .from("agent_responses")
      .select("*")
      .eq("agent_type", "talent_score")
      .order("created_at", { ascending: false });

    return {
      success: result.success,
      talentScore: result.data,
      cachedRows: cachedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testBadgesVerification(userId?: string) {
  try {
    const targetUserId = userId || TEST_CANDIDATE_USER_ID;
    
    // Run verification
    const result = await verifyCandidateSkillBadges(targetUserId);

    return {
      success: result.success,
      badges: result.badges,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testCompletenessCalculation(userId?: string) {
  try {
    const targetUserId = userId || TEST_CANDIDATE_USER_ID;
    
    // Run completeness calculation
    const completeness = await getProfileCompletenessForUser(targetUserId);

    return {
      success: true,
      completeness,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

// ==========================================
// PHASE 2 TEST HARNESS ACTIONS
// ==========================================
import { generateCandidateEmbedding, generateJobEmbedding } from "@/lib/embeddings/generator";
import { matchCandidateToJob, matchJobToAllCandidates } from "@/lib/matching/engine";
import { searchCandidatesNL } from "@/lib/recruiter/search";

export async function testCandidateEmbeddingAction(userId?: string) {
  try {
    const targetUserId = userId || TEST_CANDIDATE_USER_ID;
    const result = await generateCandidateEmbedding(targetUserId);

    // Query candidate_embeddings table to confirm vector storage
    const adminClient = getSupabaseAdmin();
    const { data: storedRows } = await adminClient
      .from("candidate_embeddings")
      .select("id, candidate_id, created_at")
      .eq("candidate_id", targetUserId)
      .order("created_at", { ascending: false });

    return {
      success: true,
      vectorDimension: result.embeddingLength,
      vectorSample: result.vectorSample,
      embeddingInputTextSnippet: result.embeddingInputTextSnippet,
      storedRecords: storedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testJobEmbeddingAction(title: string, company: string, description: string, skills: string) {
  try {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const adminClient = getSupabaseAdmin();

    const { data: newJob, error: dbError } = await adminClient
      .from("job_postings")
      .insert({
        title: title || "Senior React Engineer",
        company: company || "Hirespark Labs",
        description: description || "Looking for a full stack engineer expert in Next.js, Supabase, and AI integrations.",
        skills_required: skillsArray.length > 0 ? skillsArray : ["React", "Next.js", "Supabase"],
      })
      .select("id")
      .single();

    if (dbError || !newJob) {
      throw new Error(`Failed to create job posting: ${dbError?.message}`);
    }

    const result = await generateJobEmbedding(newJob.id);

    // Query job_embeddings table to confirm vector storage
    const { data: storedRows } = await adminClient
      .from("job_embeddings")
      .select("id, job_id, created_at")
      .eq("job_id", newJob.id)
      .order("created_at", { ascending: false });

    return {
      success: true,
      jobId: newJob.id,
      vectorDimension: result.embeddingLength,
      vectorSample: result.vectorSample,
      embeddingInputTextSnippet: result.embeddingInputTextSnippet,
      storedRecords: storedRows || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}


import { runJobMatchingEngine } from "@/lib/matching/engine";

export async function testMatchingEngineAction(jobId: string, candidateId?: string) {
  try {
    const adminClient = getSupabaseAdmin();
    let targetJobId = jobId;

    // If test job ID is default placeholder or missing, create or select a valid job_postings ID
    if (!targetJobId || targetJobId === "default-test-job-id") {
      const { data: existingJobs } = await adminClient
        .from("job_postings")
        .select("id")
        .limit(1);

      if (existingJobs && existingJobs.length > 0) {
        targetJobId = existingJobs[0].id;
      } else {
        const { data: newJob } = await adminClient
          .from("job_postings")
          .insert({
            title: "Senior Next.js Developer",
            company: "Hirespark Labs",
            description: "Looking for an expert Next.js and Supabase full stack developer.",
            skills_required: ["React", "Next.js", "Supabase", "TypeScript"],
          })
          .select("id")
          .single();
        if (newJob) targetJobId = newJob.id;
      }
    }

    const rankedCandidates = await runJobMatchingEngine(targetJobId);

    // Query job_recommendations table to confirm stored records
    const { data: storedRecs } = await adminClient
      .from("job_recommendations")
      .select("*")
      .eq("job_id", targetJobId)
      .order("created_at", { ascending: false });

    return {
      success: true,
      jobId: targetJobId,
      candidatesCount: rankedCandidates.length,
      rankedCandidates,
      storedJobRecommendations: storedRecs || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function testCreateJobFlowAction(title: string, description: string, skills: string, location?: string) {
  try {
    const skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    const adminClient = getSupabaseAdmin();

    // 1. Insert job
    const { data: newJob, error: createError } = await adminClient
      .from("job_postings")
      .insert({
        title: title || "Senior AI Integrations Architect",
        company: "Hirespark Platform Labs",
        description: description || "Build cutting-edge candidate matching pipelines using Next.js, Transformers, and Supabase vector search.",
        skills_required: skillsArray.length > 0 ? skillsArray : ["React", "Next.js", "TypeScript", "Python"],
        location: location || "Remote",
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (createError || !newJob) {
      throw new Error(`Failed to create job posting: ${createError?.message}`);
    }

    // 2. Auto-generate Job Vector Embedding
    const embeddingResult = await generateJobEmbedding(newJob.id);

    // 3. Auto-trigger Candidate Matching Engine
    const matchedCandidates = await runJobMatchingEngine(newJob.id);

    // 4. Fetch stored job recommendations from DB
    const { data: storedRecs } = await adminClient
      .from("job_recommendations")
      .select("*")
      .eq("job_id", newJob.id);

    return {
      success: true,
      job: newJob,
      embeddingLength: embeddingResult.embeddingLength,
      matchedCandidatesCount: matchedCandidates.length,
      matchedCandidates,
      storedJobRecommendations: storedRecs || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testRecruiterSearchAction(query: string) {

  try {
    const results = await searchCandidatesNL(query || "React developer with Supabase experience", 5);
    return {
      success: true,
      query,
      results,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Phase 3 — Skill Verification harness action.
 *
 * mode = 'pass':  answers all MCQs correctly + provides a strong free-response answer.
 * mode = 'fail':  answers all MCQs incorrectly + provides a weak free-response answer.
 *
 * The action fetches questions from the DB (same order the engine uses) so answers
 * are always positionally correct — no hardcoded option strings in the preset.
 */
export async function testSkillVerificationAction(
  candidateId: string,
  skill: string,
  mode: "pass" | "fail"
) {
  try {
    const targetCandidateId = candidateId || TEST_CANDIDATE_USER_ID;
    const targetSkill = skill || "React";

    // Fetch questions in the same stable order the engine will use
    const questions = await getMCQQuestionsForSkill(targetSkill);
    if (questions.length === 0) {
      return {
        success: false,
        error: `No MCQ questions found for skill "${targetSkill}". Has migration 0012 been applied?`,
      };
    }

    // Build MCQ answers based on mode
    const mcqAnswers: string[] = questions.map((q) => {
      if (mode === "pass") {
        return q.correct_answer;
      } else {
        // Pick the first option that is NOT the correct answer
        const wrongOption = (q.options as string[]).find(
          (opt) => opt.trim() !== q.correct_answer.trim()
        );
        return wrongOption ?? q.options[0] ?? "";
      }
    });

    // Build free-response answer based on mode
    const STRONG_FREE_RESPONSE: Record<string, string> = {
      React:
        "React's reconciliation algorithm performs a diffing comparison between the previous and next virtual DOM trees. " +
        "It uses a heuristic O(n) algorithm: it assumes elements of different types produce different trees and siblings are " +
        "uniquely identified by their key prop. When keys are stable and unique, React can correctly identify moved items " +
        "and reuse DOM nodes instead of destroying and recreating them, which is the primary reason keys are critical in lists.",
      Python:
        "A generator uses the yield keyword to produce values lazily — it computes one item at a time and suspends execution " +
        "between yields, so only one value is held in memory at a time. A list comprehension evaluates eagerly, building the " +
        "entire list in memory at once. For large datasets, generators are far more memory-efficient; for small datasets, " +
        "list comprehensions are simpler and faster due to fewer function-call overheads.",
      SQL:
        "INNER JOIN returns only rows where the join condition matches in both tables, discarding unmatched rows from either side. " +
        "LEFT JOIN returns all rows from the left table and NULLs for any unmatched columns from the right. A correlated subquery " +
        "references the outer query's row and re-executes for each outer row, making it useful for per-row lookups but expensive " +
        "at scale — prefer JOINs or CTEs when performance matters.",
      TypeScript:
        "An interface is an open declaration that can be extended via declaration merging and is best for describing object shapes " +
        "and class contracts. A type alias is closed (no merging) but can represent unions, intersections, tuples, and primitive " +
        "aliases — things an interface cannot express. Use interface for public API shapes and type for complex compositions.",
    };

    const WEAK_FREE_RESPONSE: Record<string, string> = {
      React: "React re-renders when something changes. Keys help it know which elements changed.",
      Python: "Generators use yield, lists use brackets. Generators are lazy.",
      SQL: "INNER JOIN joins tables. LEFT JOIN keeps left rows. Subqueries are queries inside queries.",
      TypeScript: "interface and type are mostly the same, interfaces can be extended.",
    };

    const freeResponseAnswer =
      mode === "pass"
        ? (STRONG_FREE_RESPONSE[targetSkill] ??
           "I have extensive experience with this skill and can explain all core concepts in depth.")
        : (WEAK_FREE_RESPONSE[targetSkill] ??
           "I know a little about this but am not sure of the details.");

    const result = await runSkillVerification(
      targetCandidateId,
      targetSkill,
      mcqAnswers,
      freeResponseAnswer
    );

    return {
      success: true,
      mode,
      questionsCount: questions.length,
      freeResponseQuestion: FREE_RESPONSE_QUESTIONS[targetSkill] ?? "N/A",
      result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testInterviewGenerationAction(candidateId?: string) {
  try {
    const targetCandidateId = candidateId || TEST_CANDIDATE_USER_ID;
    const questions = await generateInterviewQuestions(targetCandidateId);
    return {
      success: true,
      candidateId: targetCandidateId,
      questions,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testInterviewSubmitAction(candidateId: string, mode: "strong" | "weak") {
  try {
    const targetCandidateId = candidateId || TEST_CANDIDATE_USER_ID;
    
    // First, generate questions to get the questions array
    const questionObj = await generateInterviewQuestions(targetCandidateId);
    const questionsList = [
      ...questionObj.technical_questions,
      ...questionObj.behavioral_questions
    ];

    // Sample Answer dictionaries
    const STRONG_ANSWERS: Record<string, string> = {
      "Explain the difference between interface and type in TypeScript, and when to use which.":
        "An interface defines object shapes and supports declaration merging (open for extension). A type alias is closed but can represent primitives, unions, intersections, and mapped types. Interfaces are preferred for public API models, whereas type aliases are best for unions and domain logic compositions.",
      "Explain how React's reconciliation algorithm decides what to re-render.":
        "React uses a virtual DOM diffing algorithm with a heuristic O(n) complexity. It identifies elements by type and key. If the element type changes, React destroys the subtree and rebuilds it. For list children, stable and unique keys are used to match previous and next virtual nodes to optimize DOM node reuse and avoid unnecessary re-creation.",
      "How does Node.js handle asynchronous operations under the hood?":
        "Node.js runs on a single-threaded event loop powered by the libuv C++ library. While JS execution is single-threaded, libuv delegates blocking IO operations (file read, network) to the operating system's thread pool or asynchronous network kernels. When done, callbacks are pushed to the event loop's task queue to be executed on the main thread.",
      "Tell me about a time you had to optimize performance in a web application.":
        "I optimized a Next.js dashboard by implementing code-splitting, lazy loading of charts, and database query pooling. This reduced bundle size by 35% and improved first contentful paint by 1.2s.",
      "How do you handle conflict or differing opinions within a development team?":
        "I hold open technical discussions, focus on objective data (benchmarks, complexity, requirements), and align with team standards. If needed, we document alternatives and present to a lead developer for final resolution."
    };

    const WEAK_ANSWERS: Record<string, string> = {
      "Explain the difference between interface and type in TypeScript, and when to use which.":
        "Interface and type are pretty much the same. I just use whatever or standard typescript.",
      "Explain how React's reconciliation algorithm decides what to re-render.":
        "React re-renders components whenever state or props change. It compares them and updates the screen.",
      "How does Node.js handle asynchronous operations under the hood?":
        "It uses async/await syntax to handle things in the background so it doesn't block the main program.",
      "Tell me about a time you had to optimize performance in a web application.":
        "I had to optimize a slow application once by making the code cleaner and removing some loops.",
      "How do you handle conflict or differing opinions within a development team?":
        "I just try to agree with whatever the team decides or ask someone else what we should do."
    };

    const answers: Record<string, string> = {};
    questionsList.forEach((q) => {
      const defaultAnswer = mode === "strong"
        ? "This is a detailed placeholder answer for this custom question to satisfy requirements."
        : "I don't know.";
      answers[q] = mode === "strong"
        ? (STRONG_ANSWERS[q] ?? defaultAnswer)
        : (WEAK_ANSWERS[q] ?? defaultAnswer);
    });

    const result = await submitAndEvaluateInterview(targetCandidateId, questionsList, answers);
    
    return {
      success: true,
      candidateId: targetCandidateId,
      questions: questionsList,
      answers,
      result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function testTeamContributionsAction(teamId: string, memberIds: string[]) {
  try {
    const result = await calculateTeamContributions(teamId, memberIds);
    return {
      success: true,
      result,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
  }
}

