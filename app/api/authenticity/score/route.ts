import { NextRequest, NextResponse } from "next/server";
import { getOrComputeAuthenticityScore } from "@/lib/verification/authenticity";

/**
 * POST /api/authenticity/score
 *
 * Runs the Prompt 19 (content originality) and Prompt 20 (fraud checks) fresh,
 * or reuses cached results if less than 24 hours old.
 *
 * Request Body:
 * {
 *   "candidate_id": "uuid-string",
 *   "force_fresh": boolean (optional)
 * }
 *
 * Output:
 * {
 *   "candidate_id": "...",
 *   "authenticity_score": number,
 *   "risk_level": "low" | "medium" | "high",
 *   "flags": [ { "type": "...", "severity": "...", "evidence": "..." } ],
 *   "generated_at": "...",
 *   "disclaimer": "Signals for review only — this is not a final verdict"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: { candidate_id?: string; force_fresh?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { candidate_id, force_fresh } = body;

    if (!candidate_id || typeof candidate_id !== "string") {
      return NextResponse.json(
        { error: "candidate_id is required as a string UUID." },
        { status: 400 }
      );
    }

    const report = await getOrComputeAuthenticityScore(candidate_id, !!force_fresh);

    // Frame the response explicitly as 'signals for review'
    return NextResponse.json({
      candidate_id: report.candidate_id,
      authenticity_score: report.authenticity_score,
      risk_level: report.risk_level,
      flags: report.flags,
      generated_at: report.generated_at,
      disclaimer: "Signals for review only — this is not a final verdict."
    }, {
      status: 200
    });
  } catch (err: any) {
    console.error("[POST /api/authenticity/score] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Authenticity check failed." },
      { status: 500 }
    );
  }
}
