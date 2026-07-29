const pdf = require("pdf-parse");
import { z } from "zod";
import { callAgent } from "../agents/callAgent";
import { getSupabaseAdmin } from "../db/client";

// Zod schemas defining the strict target format
const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  start_year: z.number().nullable(),
  end_year: z.number().nullable(),
  gpa: z.string().nullable(),
});

const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  description: z.string(),
});

const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().nullable(),
});

export const ResumeDataSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  education: z.array(EducationSchema),
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  skills: z.array(z.string()),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;

/**
 * Sanitizes and fills missing fields in a parsed JSON payload to fit the Zod schema.
 */
function sanitizePartialRecord(raw: any): ResumeData {
  return {
    name: typeof raw?.name === "string" ? raw.name : "Unparsed Name",
    email: typeof raw?.email === "string" ? raw.email : null,
    phone: typeof raw?.phone === "string" ? raw.phone : null,
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
    experience: Array.isArray(raw?.experience)
      ? raw.experience.map((exp: any) => ({
          company: typeof exp?.company === "string" ? exp.company : "Unknown",
          role: typeof exp?.role === "string" ? exp.role : "Unknown",
          start_date: typeof exp?.start_date === "string" || typeof exp?.start_date === "number" ? String(exp.start_date) : "Unknown",
          end_date: typeof exp?.end_date === "string" || typeof exp?.end_date === "number" ? String(exp.end_date) : null,
          description: typeof exp?.description === "string" ? exp.description : "",
        }))
      : [],
    projects: Array.isArray(raw?.projects)
      ? raw.projects.map((proj: any) => ({
          name: typeof proj?.name === "string" ? proj.name : "Unknown",
          description: typeof proj?.description === "string" ? proj.description : "",
          technologies: Array.isArray(proj?.technologies)
            ? proj.technologies.filter((t: any) => typeof t === "string")
            : [],
        }))
      : [],
    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.map((cert: any) => ({
          name: typeof cert?.name === "string" ? cert.name : "Unknown",
          issuer: typeof cert?.issuer === "string" ? cert.issuer : "Unknown",
          year: typeof cert?.year === "number" ? cert.year : null,
        }))
      : [],
    skills: Array.isArray(raw?.skills)
      ? raw.skills.filter((s: any) => typeof s === "string")
      : [],
  };
}

/**
 * Extracts raw text from a PDF Buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text || "";
}

/**
 * Runs the Resume AI Parser pipeline with Zod verification & retry fallback.
 */
export async function parseResumeAndSave(
  rawText: string,
  userId: string
): Promise<{ success: boolean; data: ResumeData; needsReview: boolean }> {
  const adminClient = getSupabaseAdmin();
  
  const basePrompt = `You are a professional resume parser. Parse the following raw text from a candidate's resume PDF and return a valid JSON object matching this exact schema:

{
  "name": string,
  "email": string | null,
  "phone": string | null,
  "education": [ { "institution": string, "degree": string, "field": string, "start_year": number | null, "end_year": number | null, "gpa": string | null } ],
  "experience": [ { "company": string, "role": string, "start_date": string, "end_date": string | null, "description": string } ],
  "projects": [ { "name": string, "description": string, "technologies": string[] } ],
  "certifications": [ { "name": string, "issuer": string, "year": number | null } ],
  "skills": string[]
}

Return ONLY valid JSON matching this exact schema. No commentary, no markdown code fences, no extra fields. If a field is not found in the resume, use null or an empty array — never fabricate data.

RAW RESUME TEXT:
${rawText}`;

  let finalData: ResumeData | null = null;
  let needsReview = false;

  // 1. Attempt 1: Call resume_parser
  console.log(`[Resume Parser Attempt 1] Calling callAgent for userId: ${userId}`);
  try {
    const rawResponse = await callAgent("resume_parser", { prompt: basePrompt });
    const validation = ResumeDataSchema.safeParse(rawResponse);

    if (validation.success) {
      finalData = validation.data;
      console.log("[Resume Parser Attempt 1] Validation Succeeded!");
    } else {
      console.warn("[Resume Parser Attempt 1] Validation Failed:", validation.error.format());
      
      // 2. Attempt 2: Retry once with validation error hints
      const errorList = validation.error.issues
        .map((e) => `- Path "${e.path.join(".")}": ${e.message}`)
        .join("\n");

      const retryPrompt = `You are a professional resume parser. Your previous JSON response failed strict schema validation. 
Please fix the validation errors listed below and return ONLY valid JSON matching the exact schema:

VALIDATION ERRORS:
${errorList}

RAW RESUME TEXT:
${rawText}`;

      console.log(`[Resume Parser Attempt 2] Retrying agent call with error hints.`);
      const rawRetryResponse = await callAgent("resume_parser", {
        prompt: retryPrompt,
        validation_errors: errorList,
      });

      const retryValidation = ResumeDataSchema.safeParse(rawRetryResponse);
      if (retryValidation.success) {
        finalData = retryValidation.data;
        console.log("[Resume Parser Attempt 2] Validation Succeeded!");
      } else {
        console.error("[Resume Parser Attempt 2] Validation Failed again:", retryValidation.error.format());
        
        // 3. Fallback: Parse partial record and flag review
        finalData = sanitizePartialRecord(rawRetryResponse);
        needsReview = true;
        console.log("[Resume Parser Fallback] Partial record generated. Review flag set.");
      }
    }
  } catch (err: any) {
    console.error("[Resume Parser Exception] Critical failure during agent call:", err);
    // If agent fails entirely (e.g. model timeout), fallback to empty sanitized schema
    finalData = sanitizePartialRecord({});
    needsReview = true;
  }

  // 4. Save to candidate_profiles in DB
  const { error: dbError } = await adminClient
    .from("candidate_profiles")
    .update({
      resume_data: finalData,
      resume_needs_review: needsReview,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (dbError) {
    console.error("Failed to save resume_data to candidate_profiles:", dbError);
    return { success: false, data: finalData, needsReview };
  }

  return { success: true, data: finalData, needsReview };
}
