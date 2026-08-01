// OCR.space API text extraction integration
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
    name: typeof raw?.name === "string" ? raw.name : "",
    email: typeof raw?.email === "string" ? raw.email : null,
    phone: typeof raw?.phone === "string" ? raw.phone : null,
    education: Array.isArray(raw?.education)
      ? raw.education.map((edu: any) => ({
          institution: typeof edu?.institution === "string" ? edu.institution : "",
          degree: typeof edu?.degree === "string" ? edu.degree : "",
          field: typeof edu?.field === "string" ? edu.field : "",
          start_year: typeof edu?.start_year === "number" ? edu.start_year : null,
          end_year: typeof edu?.end_year === "number" ? edu.end_year : null,
          gpa: typeof edu?.gpa === "string" || typeof edu?.gpa === "number" ? String(edu.gpa) : null,
        }))
      : [],
    experience: Array.isArray(raw?.experience)
      ? raw.experience.map((exp: any) => ({
          company: typeof exp?.company === "string" ? exp.company : "",
          role: typeof exp?.role === "string" ? exp.role : "",
          start_date: typeof exp?.start_date === "string" || typeof exp?.start_date === "number" ? String(exp.start_date) : "",
          end_date: typeof exp?.end_date === "string" || typeof exp?.end_date === "number" ? String(exp.end_date) : null,
          description: typeof exp?.description === "string" ? exp.description : "",
        }))
      : [],
    projects: Array.isArray(raw?.projects)
      ? raw.projects.map((proj: any) => ({
          name: typeof proj?.name === "string" ? proj.name : "",
          description: typeof proj?.description === "string" ? proj.description : "",
          technologies: Array.isArray(proj?.technologies)
            ? proj.technologies.filter((t: any) => typeof t === "string")
            : [],
        }))
      : [],
    certifications: Array.isArray(raw?.certifications)
      ? raw.certifications.map((cert: any) => ({
          name: typeof cert?.name === "string" ? cert.name : "",
          issuer: typeof cert?.issuer === "string" ? cert.issuer : "",
          year: typeof cert?.year === "number" ? cert.year : null,
        }))
      : [],
    skills: Array.isArray(raw?.skills)
      ? raw.skills.filter((s: any) => typeof s === "string")
      : [],
  };
}

/**
 * High-speed PDF text extraction with multi-stage fallback.
 * Stage 1: pdf-parse library
 * Stage 2: Raw ASCII binary stream extraction
 * Stage 3: Template fallback (never returns empty)
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let ocrFailedDueToNetworkOrApi = false;
  let ocrError: any = null;

  // Stage 1: Try OCR.space API
  try {
    const ocrApiKey = process.env.OCR_SPACE_API_KEY || "K82218491888957"; 
    console.log(`[PDF Parser] Runtime environment check: process.env.OCR_SPACE_API_KEY is ${process.env.OCR_SPACE_API_KEY ? `defined (length: ${process.env.OCR_SPACE_API_KEY.length})` : "undefined/empty"}`);
    
    const fileBlob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("apikey", ocrApiKey);
    formData.append("file", fileBlob, "resume.pdf");
    formData.append("filetype", "PDF");
    formData.append("OCREngine", "2");

    console.log("[PDF Parser] Sending PDF to OCR.space API: https://api.ocr.space/parse/image ...");
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      ocrFailedDueToNetworkOrApi = true;
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (readErr) {
        errorBody = "(failed to read response body)";
      }
      throw new Error(`OCR.space API responded with status ${response.status}. Response Body: ${errorBody}`);
    }

    const resData = await response.json();
    
    if (resData.IsErroredOnProcessing) {
      const errMsg = Array.isArray(resData.ErrorMessage) 
        ? resData.ErrorMessage.join(", ") 
        : (resData.ErrorMessage || "Unknown processing error");
      throw new Error(`OCR.space processing error: ${errMsg}`);
    }

    const parsedText = resData.ParsedResults?.[0]?.ParsedText;
    if (!parsedText || !parsedText.trim()) {
      throw new Error("OCR.space returned empty parsed text.");
    }

    const cleaned = parsedText.replace(/\s+/g, " ").trim();
    if (cleaned.length > 30) {
      console.log(`[PDF Parser] OCR.space extracted ${cleaned.length} chars`);
      return cleaned;
    }
  } catch (err: any) {
    ocrError = err;
    console.error("[PDF Parser] OCR.space extraction failed:", err);
    if (err.message && (err.message.includes("fetch failed") || err.message.includes("responded with status") || err.message.includes("Network"))) {
      ocrFailedDueToNetworkOrApi = true;
    }
  }

  if (ocrError && !ocrFailedDueToNetworkOrApi) {
    throw ocrError;
  }

  // Stage 2: Extract printable ASCII from raw PDF binary stream (only if OCR call failed due to network/API error)
  if (ocrFailedDueToNetworkOrApi) {
    try {
      console.log("[PDF Parser] OCR.space network/API error. Trying last resort binary fallback...");
      const rawString = buffer.toString("binary");
      const extractedText = rawString
        .replace(/[^\x20-\x7E\n\r\t]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (extractedText.length > 50 && !extractedText.includes("%PDF-")) {
        console.log(`[PDF Parser] Binary fallback extracted ${extractedText.length} chars`);
        return extractedText;
      }
    } catch (binErr) {
      console.warn("[PDF Parser] Binary extraction failed:", binErr);
    }
  }

  throw ocrError || new Error("Could not extract meaningful text from this PDF. It may be corrupted, encrypted, or contain only scanned images.");
}

/**
 * Runs the Resume AI Parser pipeline with Zod verification & retry fallback.
 */
export async function parseResumeAndSave(
  rawText: string,
  userId: string
): Promise<{ success: boolean; data: ResumeData; needsReview: boolean; error?: string }> {
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
    const rawResponse = await callAgent("resume_parser", {
      prompt: basePrompt,
      timestamp: Date.now()
    });
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
        timestamp: Date.now()
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
    return { success: false, data: finalData, needsReview, error: dbError.message };
  }

  return { success: true, data: finalData, needsReview };
}
