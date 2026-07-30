const pdf = require("pdf-parse");
import AdmZip from "adm-zip";
import { z } from "zod";
import { callAgent } from "../agents/callAgent";
import { getSupabaseAdmin } from "../db/client";

// Zod schema for pitch analysis
export const PitchAnalysisSchema = z.object({
  scores: z.object({
    innovation: z.number().min(0).max(100),
    technical_feasibility: z.number().min(0).max(100),
    presentation_quality: z.number().min(0).max(100),
    business_potential: z.number().min(0).max(100),
    overall_pitch_score: z.number().min(0).max(100),
  }),
  summary: z.string(),
  improvement_suggestions: z.array(z.string()).min(3).max(5),
  evaluation_method: z.string().optional(),
});

export type PitchAnalysisData = z.infer<typeof PitchAnalysisSchema>;

/**
 * Unescapes standard XML entities
 */
function unescapeXml(xml: string): string {
  return xml
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * Extracts slides page-by-page from a PDF buffer using pdf-parse
 */
export async function extractSlidesFromPDF(buffer: Buffer): Promise<string[]> {
  let pdfParser = pdf;
  if (typeof pdfParser !== "function" && (pdfParser as any)?.default) {
    pdfParser = (pdfParser as any).default;
  }
  
  const options = {
    pagerender: function (pageData: any) {
      return pageData.getTextContent().then(function (textContent: any) {
        let text = "";
        for (const item of textContent.items) {
          text += item.str + " ";
        }
        return text + "\n---PAGE_BREAK---\n";
      });
    },
  };

  if (typeof pdfParser === "function") {
    const data = await pdfParser(buffer, options);
    const text = data.text || "";
    return text
      .split("---PAGE_BREAK---")
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }
  return [];
}

/**
 * Extracts slides from PPTX by parsing XML files inside the zip archive
 */
export async function extractSlidesFromPPTX(buffer: Buffer): Promise<string[]> {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  // Find all slide XML files
  const slideEntries = zipEntries.filter(
    (entry) =>
      entry.entryName.startsWith("ppt/slides/slide") &&
      entry.entryName.endsWith(".xml")
  );

  // Sort entries numerically
  slideEntries.sort((a, b) => {
    const aNum = parseInt(a.entryName.replace(/[^\d]/g, ""), 10) || 0;
    const bNum = parseInt(b.entryName.replace(/[^\d]/g, ""), 10) || 0;
    return aNum - bNum;
  });

  const slidesText: string[] = [];

  for (const entry of slideEntries) {
    const textContent = entry.getData().toString("utf8");
    // Extract text between <a:t> tags
    const matches = textContent.match(/<a:t>(.*?)<\/a:t>/g);
    if (matches) {
      const slideText = matches
        .map((m) => m.replace(/<\/?a:t>/g, ""))
        .map(unescapeXml)
        .join(" ")
        .trim();
      if (slideText) {
        slidesText.push(slideText);
      }
    }
  }

  return slidesText;
}

/**
 * General slide content extractor branching on file extension
 */
export async function extractSlidesText(buffer: Buffer, fileName: string): Promise<string[]> {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    return extractSlidesFromPDF(buffer);
  } else if (ext === "pptx" || ext === "ppt") {
    return extractSlidesFromPPTX(buffer);
  } else if (ext === "txt" || ext === "preset") {
    const text = buffer.toString("utf8");
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } else {
    throw new Error(`Unsupported file type: .${ext}. Only PDF and PPTX/PPT are supported.`);
  }
}

/**
 * Sanitizes partial/raw grader reports if strict schema validation fails twice.
 */
function sanitizePartialPitchRecord(raw: any): PitchAnalysisData {
  const safeNum = (v: any, fallback = 50) =>
    typeof v === "number" && !isNaN(v) ? Math.min(100, Math.max(0, v)) : fallback;
  const safeArr = (v: any) =>
    Array.isArray(v) ? v.map(String) : [];

  return {
    scores: {
      innovation: safeNum(raw?.scores?.innovation, 50),
      technical_feasibility: safeNum(raw?.scores?.technical_feasibility, 50),
      presentation_quality: safeNum(raw?.scores?.presentation_quality, 50),
      business_potential: safeNum(raw?.scores?.business_potential, 50),
      overall_pitch_score: safeNum(raw?.scores?.overall_pitch_score, 50),
    },
    summary:
      typeof raw?.summary === "string" && raw.summary.trim()
        ? raw.summary
        : "Pitch deck analyzed. Partial evaluation details parsed.",
    improvement_suggestions:
      safeArr(raw?.improvement_suggestions).length >= 3
        ? safeArr(raw.improvement_suggestions).slice(0, 5)
        : [
            "Elaborate on the technical implementation details of the project.",
            "Add a clear customer acquisition or monetization plan.",
            "Improve presentation structure and visual data representations.",
          ],
    evaluation_method: raw?.evaluation_method,
  };
}

/**
 * Core service orchestrator for analyzing pitch decks.
 * Retrieves team or candidate context, invokes the AI evaluator with retries,
 * and saves analysis reports to the database.
 */
export async function analyzePitchDeck(
  buffer: Buffer,
  fileName: string,
  idOrTeamId: string
): Promise<{ success: boolean; data: PitchAnalysisData; needsReview: boolean }> {
  if (!idOrTeamId) {
    throw new Error("Candidate ID or Team ID is required.");
  }

  const supabase = getSupabaseAdmin();

  // 1. Resolve and verify context (must throw error if not found)
  let teamContext: any = null;

  // Try fetching as candidate profile
  const { data: profile, error: profileErr } = await supabase
    .from("candidate_profiles")
    .select("user_id, talent_profile, talent_score")
    .eq("user_id", idOrTeamId)
    .maybeSingle();

  if (profile) {
    teamContext = {
      context_type: "candidate_profile",
      id: profile.user_id,
      talent_profile: profile.talent_profile,
      talent_score: profile.talent_score,
    };
  } else {
    // Try fetching as team contributions
    const { data: team, error: teamErr } = await supabase
      .from("team_contributions")
      .select("team_id, member_breakdown, ai_summary")
      .eq("team_id", idOrTeamId)
      .maybeSingle();

    if (team) {
      teamContext = {
        context_type: "team_contributions",
        id: team.team_id,
        member_breakdown: team.member_breakdown,
        ai_summary: team.ai_summary,
      };
    }
  }

  // Strictly enforce that record must exist in DB
  if (!teamContext) {
    throw new Error(`Referenced record (candidate_profile or team_contributions) not found in database for ID: ${idOrTeamId}`);
  }

  // 2. Extract slides text
  console.log(`[Pitch Analyzer] Extracting slides from ${fileName}...`);
  const slides = await extractSlidesText(buffer, fileName);

  const agentInput = {
    slides_text: slides,
    team_context: teamContext,
    prompt_instructions: `
      You are a professional pitch deck evaluator. Analyze the slide-by-slide text of the pitch deck along with the team context.
      You must return ONLY a valid JSON object matching this schema:
      {
        "scores": {
          "innovation": number (0-100),
          "technical_feasibility": number (0-100),
          "presentation_quality": number (0-100),
          "business_potential": number (0-100),
          "overall_pitch_score": number (0-100)
        },
        "summary": string (max 4 sentences),
        "improvement_suggestions": string[] (3-5 concrete, specific items)
      }
      
      Strict Rules:
      1. Score ONLY from content actually present in the deck.
      2. Do NOT assume unstated technical depth.
      3. Do NOT inflate scores for polished formatting or slide design alone.
    `,
  };

  let resultData: PitchAnalysisData | null = null;
  let needsReview = false;

  // 3. Call AI agent with retry logic
  try {
    console.log(`[Pitch Analyzer] Invoking ppt_analyzer agent (Attempt 1)...`);
    const rawResponse = await callAgent("ppt_analyzer", agentInput);
    const parsed = PitchAnalysisSchema.safeParse(rawResponse);

    if (parsed.success) {
      resultData = parsed.data;
      console.log(`[Pitch Analyzer] Attempt 1 Succeeded!`);
    } else {
      console.warn(`[Pitch Analyzer] Attempt 1 Failed validation. Retrying...`);
      const errorList = parsed.error.issues
        .map((e) => `- Path "${e.path.join(".")}": ${e.message}`)
        .join("\n");

      const retryInput = {
        ...agentInput,
        validation_errors: errorList,
        prompt_instructions:
          agentInput.prompt_instructions +
          `\n\nYour previous response failed validation with these errors:\n${errorList}\n\nPlease correct them and return a valid JSON object.`,
      };

      console.log(`[Pitch Analyzer] Invoking ppt_analyzer agent (Attempt 2)...`);
      const retryResponse = await callAgent("ppt_analyzer", retryInput);
      const retryParsed = PitchAnalysisSchema.safeParse(retryResponse);

      if (retryParsed.success) {
        resultData = retryParsed.data;
        console.log(`[Pitch Analyzer] Attempt 2 Succeeded!`);
      } else {
        console.error(`[Pitch Analyzer] Attempt 2 Failed validation. Using fallback.`);
        resultData = sanitizePartialPitchRecord(retryResponse);
        needsReview = true;
      }
    }
  } catch (err: any) {
    console.error(`[Pitch Analyzer] Critical exception during agent call:`, err);
    resultData = sanitizePartialPitchRecord({});
    needsReview = true;
  }

  // 4. Save to pitch_analyses table
  console.log(`[Pitch Analyzer] Saving results to pitch_analyses...`);
  const { error: dbError } = await supabase.from("pitch_analyses").insert({
    team_id_or_candidate_id: idOrTeamId,
    ppt_url: fileName, // Using filename as PPT URL
    scores: resultData.scores,
    summary: resultData.summary,
    improvement_suggestions: resultData.improvement_suggestions,
    needs_review: needsReview,
    evaluation_method: resultData.evaluation_method || "model_call",
  });

  if (dbError) {
    console.warn(`[Pitch Analyzer] Failed to save analysis report to database:`, dbError.message);
  }

  return { success: true, data: resultData, needsReview };
}
