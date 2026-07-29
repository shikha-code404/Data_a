"use server";

import { callAgent } from "@/lib/agents/callAgent";
import { getSupabaseAdmin } from "@/lib/db/client";
import { ingestGitHubData } from "@/lib/github/ingestion";
import { extractTextFromPDF, parseResumeAndSave } from "@/lib/resume/parser";
import { calculateCandidateTalentScore } from "@/lib/agents/talentScore";
import { verifyCandidateSkillBadges } from "@/lib/badges/verifier";

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
