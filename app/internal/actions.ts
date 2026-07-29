"use server";

import { callAgent } from "@/lib/agents/callAgent";
import { getSupabaseAdmin } from "@/lib/db/client";
import { ingestGitHubData } from "@/lib/github/ingestion";
import { extractTextFromPDF, parseResumeAndSave } from "@/lib/resume/parser";
import { calculateCandidateTalentScore } from "@/lib/agents/talentScore";
import { verifyCandidateSkillBadges } from "@/lib/badges/verifier";
import { getProfileCompletenessForUser } from "@/lib/profile/completeness";

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

