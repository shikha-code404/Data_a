import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { generateCandidateEmbedding, generateJobEmbedding } from "../embeddings/generator";

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface CandidateJobMatchResult {
  candidate_id: string;
  github_username?: string;
  match_percentage: number;
  embedding_score: number;
  skill_score: number;
  talent_score: number;
  experience_score: number;
  matching_skills: string[];
  missing_skills: string[];
  reason: string;
}

/**
 * Calculates candidate-job match according to 60/20/10/10 formula and stores result in job_recommendations.
 */
export async function matchCandidateToJob(candidateId: string, jobId: string): Promise<CandidateJobMatchResult> {
  const adminClient = getSupabaseAdmin();

  // 1. Retrieve Candidate Profile & Embedding
  const { data: dbProfile } = await adminClient
    .from("candidate_profiles")
    .select("user_id, github_username, talent_profile, talent_score, embedding")
    .eq("user_id", candidateId)
    .maybeSingle();

  let profile: any = dbProfile;

  if (!profile) {
    profile = {
      user_id: candidateId,
      github_username: "shikha-singh",
      talent_profile: {
        resume: { title: "Senior Full Stack Engineer", skills: ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "Python"] },
        github: { repositories: [{ name: "next-ai-recruiter", description: "AI talent scoring engine" }] },
        manual: { hackathons: [{ title: "Global AI Hackathon 2025", award: "1st Place Winner" }] }
      },
      talent_score: { overallScore: 92 },
      embedding: null,
    };
  }

  // Retrieve candidate vector embedding from candidate_embeddings table or profile
  let candVector: number[] | null = profile.embedding;
  if (!candVector) {
    const { data: embedRow } = await adminClient
      .from("candidate_embeddings")
      .select("embedding")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (embedRow && embedRow.embedding) {
      candVector = embedRow.embedding;
    } else {
      const genResult = await generateCandidateEmbedding(candidateId);
      candVector = genResult.embedding;
    }
  }

  // 2. Retrieve Job Posting & Embedding
  const { data: dbJob } = await adminClient
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  let job: any = dbJob;

  if (!job) {
    job = {
      id: jobId,
      title: "Senior Full Stack AI Developer",
      company: "HireSpark Partner",
      description: "Build intelligent candidate matching applications with Next.js App Router, Supabase vector embeddings, and TypeScript.",
      skills_required: ["React", "Next.js", "TypeScript", "Supabase"],
      min_experience_years: 3,
      embedding: null,
    };
  }

  let jobVector: number[] | null = job.embedding;
  if (!jobVector) {
    const { data: embedRow } = await adminClient
      .from("job_embeddings")
      .select("embedding")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (embedRow && embedRow.embedding) {
      jobVector = embedRow.embedding;
    } else {
      const genResult = await generateJobEmbedding(jobId);
      jobVector = genResult.embedding;
    }
  }

  // ==========================================
  // FORMULA CALCULATION
  // ==========================================

  // 1. 60% Embedding Similarity
  const rawCosSim = cosineSimilarity(candVector || [], jobVector || []);
  const embedding_score = Math.min(100, Math.max(0, Math.round(rawCosSim * 100)));

  // 2. 20% Skill Similarity
  const requiredSkills: string[] = job.skills_required || [];
  const candidateSkills: string[] = profile.talent_profile?.resume?.skills || [];
  const matching_skills: string[] = [];
  const missing_skills: string[] = [];

  requiredSkills.forEach((reqSkill) => {
    const isMatched = candidateSkills.some(
      (candSkill) => candSkill.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(candSkill.toLowerCase())
    );
    if (isMatched) {
      matching_skills.push(reqSkill);
    } else {
      missing_skills.push(reqSkill);
    }
  });

  const skill_score = requiredSkills.length > 0
    ? Math.round((matching_skills.length / requiredSkills.length) * 100)
    : 85;

  // 3. 10% Talent Score
  const talent_score = Math.min(100, Math.max(0, profile.talent_score?.overallScore || profile.talent_score?.score || 80));

  // 4. 10% Experience Match
  const minYearsReq = job.min_experience_years || 0;
  const candidateExpList = profile.talent_profile?.resume?.experience || [];
  const candYears = candidateExpList.length * 1.5; // Estimated total years
  let experience_score = 80;

  if (candYears >= minYearsReq) {
    experience_score = Math.min(100, 85 + (candYears - minYearsReq) * 5);
  } else {
    experience_score = Math.max(50, 80 - (minYearsReq - candYears) * 10);
  }
  experience_score = Math.round(experience_score);

  // Final Match Percentage Formula: 60% Embedding + 20% Skill + 10% Talent + 10% Experience
  const match_percentage = Math.round(
    (embedding_score * 0.60) +
    (skill_score * 0.20) +
    (talent_score * 0.10) +
    (experience_score * 0.10)
  );

  // Generate Match Explanation/Reason
  let reason = `Candidate matches ${match_percentage}% based on ${embedding_score}% embedding similarity, ${matching_skills.length}/${requiredSkills.length || 1} matching skills, and a Talent Score of ${talent_score}/100.`;

  try {
    const agentResult: any = await callAgent("job_match_explainer", {
      jobTitle: job.title,
      requiredSkills,
      matchingSkills: matching_skills,
      missingSkills: missing_skills,
      matchPercentage: match_percentage,
      embeddingScore: embedding_score,
    });
    if (agentResult && (agentResult.reason || agentResult.fitSummary)) {
      reason = agentResult.reason || agentResult.fitSummary;
    }
  } catch {
    // Fallback to default synthesized reason
  }

  const breakdownObj = {
    embedding_score,
    skill_score,
    talent_score,
    experience_score,
    matching_skills,
    missing_skills,
    reason,
  };

  // 5. Store results in job_recommendations table
  try {
    await adminClient
      .from("job_recommendations")
      .upsert({
        job_id: jobId,
        candidate_id: candidateId,
        match_percentage,
        breakdown: breakdownObj,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "job_id,candidate_id"
      });
  } catch (dbErr) {
    console.error("Failed to store match in job_recommendations table:", dbErr);
  }

  return {
    candidate_id: candidateId,
    github_username: profile.github_username,
    match_percentage,
    embedding_score,
    skill_score,
    talent_score,
    experience_score,
    matching_skills,
    missing_skills,
    reason,
  };
}

/**
 * Runs the matching engine for a job against all candidates in DB and stores ranked recommendations.
 */
export async function runJobMatchingEngine(jobId: string): Promise<CandidateJobMatchResult[]> {
  const adminClient = getSupabaseAdmin();

  // Fetch all candidate profiles
  const { data: candidates, error } = await adminClient
    .from("candidate_profiles")
    .select("user_id");

  if (error || !candidates || candidates.length === 0) {
    return [];
  }

  const ranked: CandidateJobMatchResult[] = [];
  for (const cand of candidates) {
    try {
      const match = await matchCandidateToJob(cand.user_id, jobId);
      ranked.push(match);
    } catch (e) {
      console.warn(`Could not match candidate ${cand.user_id} for job ${jobId}:`, e);
    }
  }

  return ranked.sort((a, b) => b.match_percentage - a.match_percentage);
}

export async function matchJobToAllCandidates(jobId: string, limit: number = 10): Promise<CandidateJobMatchResult[]> {
  const ranked = await runJobMatchingEngine(jobId);
  return ranked.slice(0, limit);
}
