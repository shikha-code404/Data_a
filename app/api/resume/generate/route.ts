import { NextRequest, NextResponse } from "next/server";
import { buildCandidateResume } from "@/lib/resume/resumeService";

/**
 * POST /api/resume/generate
 *
 * Runs the resume builder pipeline for a candidate, fetching their talent profile,
 * rephrasing for ATS optimization, and saving to the resumes table.
 *
 * Request Body:
 * {
 *   "candidate_id": "uuid-string",
 *   "template": "Modern" | "Minimal" (optional, default: "Modern"),
 *   "force_fresh": boolean (optional)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: { candidate_id?: string; template?: string; force_fresh?: boolean; target_company?: string | null } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { candidate_id, template, force_fresh, target_company } = body;

    if (!candidate_id || typeof candidate_id !== "string") {
      return NextResponse.json(
        { error: "candidate_id is required as a string UUID." },
        { status: 400 }
      );
    }

    const templateName = template || "Modern";
    if (!["Modern", "Minimal"].includes(templateName)) {
      return NextResponse.json(
        { error: "Invalid template. Choose Modern or Minimal." },
        { status: 400 }
      );
    }

    const targetCompany = target_company || null;
    if (targetCompany !== null && !["google", "microsoft", "amazon", "meta"].includes(targetCompany)) {
      return NextResponse.json(
        { error: "Invalid target_company. Choose 'google', 'microsoft', 'amazon', 'meta', or null." },
        { status: 400 }
      );
    }

    console.log(`[API /api/resume/generate] Building resume for candidate ${candidate_id} using template: ${templateName}, targetCompany: ${targetCompany}`);
    const result = await buildCandidateResume(candidate_id, templateName, targetCompany, !!force_fresh);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[POST /api/resume/generate] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Resume generation failed." },
      { status: 500 }
    );
  }
}
