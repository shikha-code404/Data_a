import { pipeline } from "@xenova/transformers";
import { getSupabaseAdmin } from "../db/client";

// Singleton class for caching the Xenova transformers pipeline
class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      this.instance = await pipeline(this.task as any, this.model);
    }
    return this.instance;
  }
}

/**
 * Generates a 384-dimensional normalized dense embedding vector using @xenova/transformers (all-MiniLM-L6-v2).
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  if (!text || !text.trim()) {
    throw new Error("Text parameter cannot be empty for embedding generation.");
  }
  const extractor = await EmbeddingPipeline.getInstance();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/**
 * Combines candidate fields into structured embedding input text:
 * - Resume skills
 * - Projects
 * - Experience
 * - GitHub technologies
 * - Hackathons
 * - Certifications
 * - Talent score summary
 */
export function buildCandidateEmbeddingInput(talentProfile: any, talentScore?: any): string {
  const resume = talentProfile?.resume || {};
  const github = talentProfile?.github || {};
  const manual = talentProfile?.manual || {};

  // 1. Resume skills
  const resumeSkills = Array.isArray(resume.skills) ? resume.skills.join(", ") : "N/A";

  // 2. Projects
  let projectsStr = "N/A";
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    projectsStr = resume.projects.map((p: any) => `${p.name || p.title}: ${p.description || ""}`).join("; ");
  } else if (Array.isArray(github.repositories) && github.repositories.length > 0) {
    projectsStr = github.repositories.map((r: any) => `${r.name}: ${r.description || ""}`).join("; ");
  }

  // 3. Experience
  let experienceStr = "N/A";
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    experienceStr = resume.experience.map((e: any) => `${e.role || e.title || ""} at ${e.company || ""}: ${e.description || ""}`).join("; ");
  }

  // 4. GitHub technologies
  let githubTech = "N/A";
  if (github.topLanguages) {
    githubTech = typeof github.topLanguages === "object" ? Object.keys(github.topLanguages).join(", ") : String(github.topLanguages);
  }

  // 5. Hackathons
  let hackathonsStr = "N/A";
  if (Array.isArray(manual.hackathons) && manual.hackathons.length > 0) {
    hackathonsStr = manual.hackathons.map((h: any) => `${h.name || h.title}: ${h.award || h.description || ""}`).join("; ");
  }

  // 6. Certifications
  let certsStr = "N/A";
  if (Array.isArray(manual.certifications) && manual.certifications.length > 0) {
    certsStr = manual.certifications.map((c: any) => `${c.name || c.title} (${c.issuer || ""})`).join("; ");
  }

  // 7. Talent score summary
  let scoreSummary = "N/A";
  if (talentScore) {
    scoreSummary = `Overall Score: ${talentScore.overallScore || talentScore.score || 80}/100. Breakdown: Code Quality ${talentScore.breakdown?.codeQuality || 85}, Skill Fit ${talentScore.breakdown?.skillFit || 80}. Summary: ${talentScore.summary || "Strong software engineering competencies."}`;
  }

  return `Resume Skills: ${resumeSkills}
Projects: ${projectsStr}
Experience: ${experienceStr}
GitHub Technologies: ${githubTech}
Hackathons: ${hackathonsStr}
Certifications: ${certsStr}
Talent Score Summary: ${scoreSummary}`;
}

/**
 * Combines job posting fields into structured embedding input text:
 * - Job title
 * - Description
 * - Required skills
 * - Responsibilities
 */
export function buildJobEmbeddingInput(job: any): string {
  const title = job.title || "Job Opening";
  const description = job.description || "";
  const skills = Array.isArray(job.skills_required) ? job.skills_required.join(", ") : (job.skills || "");
  const responsibilities = Array.isArray(job.responsibilities)
    ? job.responsibilities.join("; ")
    : (job.responsibilities || description);

  return `Job Title: ${title}
Description: ${description}
Required Skills: ${skills}
Responsibilities: ${responsibilities}`;
}

/**
 * Generates 384d embedding vector for a candidate and stores it in candidate_embeddings table.
 */
export async function generateCandidateEmbedding(candidateId: string) {
  const adminClient = getSupabaseAdmin();

  const { data: dbProfile, error } = await adminClient
    .from("candidate_profiles")
    .select("user_id, github_username, talent_profile, talent_score")
    .eq("user_id", candidateId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error retrieving candidate profile for ID ${candidateId}: ${error.message}`);
  }
  if (!dbProfile) {
    throw new Error(`Candidate profile not found for ID: ${candidateId}`);
  }

  const embeddingInputText = buildCandidateEmbeddingInput(dbProfile.talent_profile, dbProfile.talent_score);
  const embeddingVector = await generateTextEmbedding(embeddingInputText);

  // Store in candidate_embeddings table
  const { data: insertedRow, error: dbError } = await adminClient
    .from("candidate_embeddings")
    .insert({
      candidate_id: candidateId,
      embedding: embeddingVector,
      created_at: new Date().toISOString(),
    })
    .select("id, candidate_id, created_at")
    .single();

  if (dbError) {
    throw new Error(`Failed to insert candidate embedding: ${dbError.message}`);
  }

  return {
    success: true,
    storedRecord: insertedRow,
    candidateId,
    embedding: embeddingVector,
    embeddingLength: embeddingVector.length,
    embeddingInputTextSnippet: embeddingInputText.slice(0, 300),
    vectorSample: embeddingVector.slice(0, 5),
  };
}

/**
 * Generates 384d embedding vector for a job description and stores it in job_embeddings table.
 */
export async function generateJobEmbedding(jobId: string) {
  const adminClient = getSupabaseAdmin();

  const { data: dbJob, error } = await adminClient
    .from("job_postings")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error retrieving job posting for ID ${jobId}: ${error.message}`);
  }
  if (!dbJob) {
    throw new Error(`Job posting not found for ID: ${jobId}`);
  }

  const embeddingInputText = buildJobEmbeddingInput(dbJob);
  const embeddingVector = await generateTextEmbedding(embeddingInputText);

  // Store in job_embeddings table
  const { data: insertedRow, error: dbError } = await adminClient
    .from("job_embeddings")
    .insert({
      job_id: jobId,
      embedding: embeddingVector,
      created_at: new Date().toISOString(),
    })
    .select("id, job_id, created_at")
    .single();

  if (dbError) {
    throw new Error(`Failed to insert job embedding: ${dbError.message}`);
  }

  return {
    success: true,
    storedRecord: insertedRow,
    jobId,
    embedding: embeddingVector,
    embeddingLength: embeddingVector.length,
    embeddingInputTextSnippet: embeddingInputText.slice(0, 300),
    vectorSample: embeddingVector.slice(0, 5),
  };
}

