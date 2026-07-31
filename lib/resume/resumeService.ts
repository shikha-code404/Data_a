import { z } from "zod";
import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { MOCK_PROFILES } from "../db/mockProfiles";

export const inMemoryResumeStore = new Map<string, { resume_json: any; template_name: string }>();

// Structured resume schemas mirroring overlapping Phase 1 structures
export const ContactSchema = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  github: z.string().nullable(),
});

export const StructuredResumeSchema = z.object({
  name: z.string(),
  contact: ContactSchema,
  summary: z.string(),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    start_date: z.string(),
    end_date: z.string().nullable(),
    description: z.string(),
  })),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    field: z.string(),
    start_year: z.number().nullable(),
    end_year: z.number().nullable(),
    gpa: z.string().nullable(),
  })),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
  })),
  skills: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number().nullable(),
  })),
});

export type StructuredResume = z.infer<typeof StructuredResumeSchema>;

export interface ResumeGenerationResult {
  success: boolean;
  resume_id: string;
  resume_json: StructuredResume;
  needs_review: boolean;
}

/**
 * Sanitizes partial/failed responses into a conforming StructuredResume.
 */
function sanitizeResume(raw: any): StructuredResume {
  const contact = raw?.contact || {};
  return {
    name: typeof raw?.name === "string" ? raw.name : "Candidate Name",
    contact: {
      email: typeof contact.email === "string" ? contact.email : null,
      phone: typeof contact.phone === "string" ? contact.phone : null,
      location: typeof contact.location === "string" ? contact.location : null,
      github: typeof contact.github === "string" ? contact.github : null,
    },
    summary: typeof raw?.summary === "string" ? raw.summary : "",
    experience: Array.isArray(raw?.experience)
      ? raw.experience.map((exp: any) => ({
          company: typeof exp?.company === "string" ? exp.company : "Unknown",
          role: typeof exp?.role === "string" ? exp.role : "Developer",
          start_date: typeof exp?.start_date === "string" || typeof exp?.start_date === "number" ? String(exp.start_date) : "Unknown",
          end_date: typeof exp?.end_date === "string" || typeof exp?.end_date === "number" ? String(exp.end_date) : null,
          description: typeof exp?.description === "string" ? exp.description : "",
        }))
      : [],
    education: Array.isArray(raw?.education)
      ? raw.education.map((edu: any) => ({
          institution: typeof edu?.institution === "string" ? edu.institution : "Unknown",
          degree: typeof edu?.degree === "string" ? edu.degree : "Unknown",
          field: typeof edu?.field === "string" ? edu.field : "Unknown",
          start_year: typeof edu?.start_year === "number" ? edu.start_year : null,
          end_year: typeof edu?.end_year === "number" ? edu.end_year : null,
          gpa: typeof edu?.gpa === "string" || typeof edu?.gpa === "number" ? String(edu.gpa) : null,
        }))
      : [],
    projects: Array.isArray(raw?.projects)
      ? raw.projects.map((proj: any) => ({
          name: typeof proj?.name === "string" ? proj.name : "Unknown Project",
          description: typeof proj?.description === "string" ? proj.description : "",
          technologies: Array.isArray(proj?.technologies) ? proj.technologies.filter((t: any) => typeof t === "string") : [],
        }))
      : [],
    skills: Array.isArray(raw?.skills) ? raw.skills.filter((s: any) => typeof s === "string") : [],
    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.map((c: any) => ({
          name: typeof c?.name === "string" ? c.name : "Unknown Certification",
          issuer: typeof c?.issuer === "string" ? c.issuer : "Unknown Issuer",
          year: typeof c?.year === "number" ? c.year : null,
        }))
      : [],
  };
}

/**
 * Executes AI Resume Builder pipeline with schema validation and retry/fallback.
 */
export async function buildCandidateResume(
  candidateId: string,
  templateName: string,
  forceFresh = false
): Promise<ResumeGenerationResult> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch Candidate Profile (verify existence, fallback to mock profiles if unconfigured DB)
  let profile: any = null;
  try {
    const { data, error: profileErr } = await adminClient
      .from("candidate_profiles")
      .select("user_id, talent_profile, github_username")
      .eq("user_id", candidateId)
      .maybeSingle();
    if (!profileErr && data) {
      profile = data;
    }
  } catch (e) {
    // Network/DB unconfigured error fallback
  }

  if (!profile) {
    profile = MOCK_PROFILES[candidateId];
  }

  if (!profile) {
    throw new Error(`Candidate profile not found in database for ID: ${candidateId}`);
  }

  // 2. Return cached resume if not forceFresh
  if (!forceFresh) {
    const { data: cached, error: cacheErr } = await adminClient
      .from("resumes")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("template_name", templateName)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      console.log(`[Resume Service] Found cached resume for ${candidateId} (template: ${templateName})`);
      return {
        success: true,
        resume_id: cached.id,
        resume_json: cached.resume_json as StructuredResume,
        needs_review: cached.needs_review,
      };
    }
  }

  const talentProfile = profile.talent_profile || {};
  talentProfile.github_username = profile.github_username;

  // 3. Prompt formulation
  const basePrompt = `You are a Professional Resume Tailor. Analyze the candidate's talent profile and rewrite/rephrase it into an ATS-friendly, impactful, structured resume JSON object.
  
INPUT DETAILS:
${JSON.stringify(talentProfile)}

STRICT RULES:
- Rephrase and tailor the wording for clarity and impact, but NEVER fabricate experience, companies, projects, dates, or skills that are not explicitly present in the input.
- Keep the output consistent with the candidate's actual history.
- Respond with ONLY a valid JSON object matching the exact schema:

{
  "name": string,
  "contact": {
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "github": string | null
  },
  "summary": string (impactful ATS executive summary),
  "experience": [ { "company": string, "role": string, "start_date": string, "end_date": string | null, "description": string } ],
  "education": [ { "institution": string, "degree": string, "field": string, "start_year": number | null, "end_year": number | null, "gpa": string | null } ],
  "projects": [ { "name": string, "description": string, "technologies": string[] } ],
  "skills": string[],
  "certifications": [ { "name": string, "issuer": string, "year": number | null } ]
}

Do not include any code fences, markdown blocks, extra keys, or explanations.`;

  let finalResume: StructuredResume | null = null;
  let needsReview = false;

  try {
    console.log(`[Resume Service] Calling callAgent for candidate ${candidateId}`);
    const rawResponse = await callAgent("resume_builder", { talent_profile: talentProfile });

    const parsed = StructuredResumeSchema.safeParse(rawResponse);
    if (parsed.success) {
      finalResume = parsed.data;
      console.log(`[Resume Service] Attempt 1 validation succeeded.`);
    } else {
      console.warn(`[Resume Service] Attempt 1 validation failed. Retrying with error list.`);
      const errorList = parsed.error.issues.map(i => `- Path "${i.path.join(".")}": ${i.message}`).join("\n");

      const retryPrompt = `You are a Professional Resume Tailor. Your previous JSON output failed strict schema validation.
Please correct these errors and return ONLY valid JSON matching the exact schema:

VALIDATION ERRORS:
${errorList}

INPUT DETAILS:
${JSON.stringify(talentProfile)}`;

      const rawRetryResponse = await callAgent("resume_builder", {
        talent_profile: talentProfile,
        prompt: retryPrompt,
        validation_errors: errorList,
      });

      const parsedRetry = StructuredResumeSchema.safeParse(rawRetryResponse);
      if (parsedRetry.success) {
        finalResume = parsedRetry.data;
        console.log(`[Resume Service] Attempt 2 validation succeeded.`);
      } else {
        console.error(`[Resume Service] Attempt 2 validation failed. Falling back to sanitized partial.`, parsedRetry.error.format());
        finalResume = sanitizeResume(rawRetryResponse);
        needsReview = true;
      }
    }
  } catch (err: any) {
    console.error(`[Resume Service Error] Call failed: ${err.message}`);
    finalResume = sanitizeResume({});
    needsReview = true;
  }

  // 4. Save to database
  console.log(`[Resume Service] Upserting resume record to database for ${candidateId}`);
  let resumeId = `resume-${Date.now()}`;
  try {
    const { data: savedData, error: saveErr } = await adminClient
      .from("resumes")
      .insert({
        candidate_id: candidateId,
        template_name: templateName,
        resume_json: finalResume,
        needs_review: needsReview,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (savedData?.id) {
      resumeId = savedData.id;
    }
  } catch (e) {
    // Ignore DB save errors
  }

  inMemoryResumeStore.set(resumeId, { resume_json: finalResume, template_name: templateName });

  return {
    success: true,
    resume_id: resumeId,
    resume_json: finalResume,
    needs_review: needsReview,
  };
}
