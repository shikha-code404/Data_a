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
  target_company: z.string().nullable().optional(),
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
    target_company: typeof raw?.target_company === "string" ? raw.target_company : null,
  };
}

/**
 * Executes AI Resume Builder pipeline with schema validation and retry/fallback.
 */
export async function buildCandidateResume(
  candidateId: string,
  templateName: string,
  targetCompany: string | null = null,
  forceFresh = false
): Promise<ResumeGenerationResult> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch Candidate Profile (verify existence, fallback to mock profiles if unconfigured DB)
  let profile: any = null;
  try {
    const { data, error: profileErr } = await adminClient
      .from("candidate_profiles")
      .select("user_id, talent_profile, github_username, resume_data")
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
    let query = adminClient
      .from("resumes")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("template_name", templateName);

    if (targetCompany === null) {
      query = query.is("target_company", null);
    } else {
      query = query.eq("target_company", targetCompany);
    }

    const { data: cached, error: cacheErr } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      console.log(`[Resume Service] Found cached resume for ${candidateId} (template: ${templateName}, target_company: ${targetCompany})`);
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
  if (profile.resume_data) {
    talentProfile.resume_data = profile.resume_data;
  }

  const resumeData = profile.resume_data || {};
  const existingResume = talentProfile.resume || {};
  const isMockResume = existingResume.name === "Candidate User" || existingResume.company === "HireSpark Partner" || existingResume.institution === "Institute of Technology";

  const isMockProject = (p: any) => p?.name === "AI Vector Matcher";
  const isMockExp = (e: any) => e?.company === "HireSpark Partner";
  const isMockCert = (c: any) => c?.name === "AWS Certified Solutions Architect" && !resumeData.certifications?.length;

  const realProjects = (Array.isArray(resumeData.projects) ? resumeData.projects : []).filter((p: any) => !isMockProject(p));
  const existingProjects = (!isMockResume && Array.isArray(existingResume.projects) ? existingResume.projects : []).filter((p: any) => !isMockProject(p));

  let finalProjects = realProjects.length > 0 ? realProjects : existingProjects;
  if (finalProjects.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
    finalProjects = talentProfile.github.repositories.slice(0, 4).map((repo: any) => ({
      name: repo.name || "Software Project",
      description: repo.description || `Open-source project built with ${repo.primary_language || "TypeScript"}.`,
      technologies: repo.primary_language ? [repo.primary_language] : (resumeData.skills || []).slice(0, 3)
    }));
  }

  const realExp = (Array.isArray(resumeData.experience) ? resumeData.experience : []).filter((e: any) => !isMockExp(e));
  const existingExp = (!isMockResume && Array.isArray(existingResume.experience) ? existingResume.experience : []).filter((e: any) => !isMockExp(e));

  let finalExp = realExp.length > 0 ? realExp : existingExp;
  if (finalExp.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
    finalExp = [
      {
        company: "Independent Software Developer",
        role: "Full Stack Developer",
        start_date: "2022",
        end_date: "Present",
        description: `Developed and deployed ${talentProfile.github.repositories.length}+ software repositories specializing in ${(resumeData.skills || []).slice(0, 3).join(", ") || "full-stack development"}.`
      }
    ];
  }

  const realCerts = (Array.isArray(resumeData.certifications) ? resumeData.certifications : []).filter((c: any) => !isMockCert(c));
  const existingCerts = (!isMockResume && Array.isArray(existingResume.certifications) ? existingResume.certifications : []).filter((c: any) => !isMockCert(c));

  talentProfile.resume = {
    name: (resumeData.name && resumeData.name !== "Candidate User" ? resumeData.name : null) || (!isMockResume ? existingResume.name : null) || profile.name || talentProfile.name || "",
    email: (resumeData.email && !resumeData.email.includes("hirespark.com") ? resumeData.email : null) || (!isMockResume ? existingResume.email : null) || profile.email || talentProfile.email || "",
    phone: resumeData.phone || (!isMockResume ? existingResume.phone : null) || profile.phone || talentProfile.phone || "",
    location: resumeData.location || (!isMockResume ? existingResume.location : null) || profile.location || talentProfile.location || "",
    summary: resumeData.summary || (!isMockResume ? existingResume.summary : null) || "",
    skills: Array.from(new Set([
      ...(Array.isArray(resumeData.skills) ? resumeData.skills : []),
      ...(!isMockResume && Array.isArray(existingResume.skills) ? existingResume.skills : [])
    ])),
    education: Array.isArray(resumeData.education) && resumeData.education.length > 0
      ? resumeData.education
      : (!isMockResume && Array.isArray(existingResume.education) ? existingResume.education : []),
    experience: finalExp,
    projects: finalProjects,
    certifications: realCerts.length > 0 ? realCerts : existingCerts
  };

  // 3. Prompt formulation
  const basePrompt = `You are a Professional Resume Tailor. Analyze the candidate's talent profile and rewrite/rephrase it into an ATS-friendly, impactful, structured resume JSON object. You must NEVER output placeholder text or abstract type tokens.

Respond with ONLY a valid JSON object — no markdown code fences, no extra top-level keys.

Here is an EXAMPLE of the correct JSON shape, filled with SAMPLE data for a DIFFERENT candidate — this shows you the structure only. Do NOT copy or reference any names, companies, or values from this example:

{
  "name": "Jordan Ellis",
  "contact": {
    "email": "jordan.ellis@example.com",
    "phone": "+1 (555) 402-8871",
    "location": "Austin, TX",
    "github": "jordanellis-dev"
  },
  "summary": "Backend-focused software engineer with 4 years of experience building distributed systems in Python and Go.",
  "experience": [
    {
      "company": "Northwind Systems",
      "role": "Backend Engineer",
      "start_date": "2021",
      "end_date": "Present",
      "description": "Built microservices handling 2M+ daily requests, reducing p99 latency by 30%."
    }
  ],
  "education": [
    {
      "institution": "University of Texas at Austin",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "start_year": 2016,
      "end_year": 2020,
      "gpa": "3.7"
    }
  ],
  "projects": [
    {
      "name": "OpenQueue",
      "description": "Open-source distributed task queue with at-least-once delivery guarantees.",
      "technologies": ["Go", "Redis", "gRPC"]
    }
  ],
  "skills": ["Python", "Go", "PostgreSQL"],
  "certifications": []
}

INPUT DETAILS FOR ACTUAL CANDIDATE:
${JSON.stringify(talentProfile)}

STRICT RULES:
- Use only the actual candidate's data provided above.
- Rephrase and tailor for clarity and impact, but NEVER fabricate experience or copy from the sample above.
- Omit no key. Rename no key. Empty sections should be empty arrays.`;

  let finalResume: StructuredResume | null = null;
  let needsReview = false;

  try {
    console.log(`[Resume Service] Calling callAgent for candidate ${candidateId} (target_company: ${targetCompany})`);
    const rawResponse = await callAgent("resume_builder", {
      talent_profile: talentProfile,
      target_company: targetCompany
    });

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
        target_company: targetCompany,
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
        target_company: targetCompany,
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
