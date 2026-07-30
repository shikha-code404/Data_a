import { NextRequest, NextResponse } from "next/server";
import { generateCareerGuidance } from "@/lib/profile/career";

/**
 * POST /api/career/guidance
 *
 * Runs the AI Career Guidance pipeline for a candidate, fetching gaps, roadmaps,
 * and certified recommendations, alongside a static heuristic salary estimation.
 *
 * Request Body:
 * {
 *   "candidate_id": "uuid-string",
 *   "force_fresh": boolean (optional)
 * }
 *
 * Output:
 * {
 *   "success": boolean,
 *   "career_roadmap": {
 *     "skill_gaps": [ { "skill": "...", "current_level": "...", "target_level": "...", "why": "..." } ],
 *     "recommended_certifications": [ { "name": "...", "provider": "...", "reason": "..." } ],
 *     "career_roadmap": [ { "stage": "...", "timeframe": "...", "milestones": [...] } ],
 *     "reasoning": "..."
 *   },
 *   "salary_estimate": {
 *     "estimated_range": { "min": 0, "max": 0, "currency": "..." },
 *     "basis": "..."
 *   },
 *   "needs_review": boolean
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

    console.log(`[API /api/career/guidance] Triggering career system for: ${candidate_id}, forceFresh: ${!!force_fresh}`);
    const result = await generateCareerGuidance(candidate_id, !!force_fresh);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[POST /api/career/guidance] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Career guidance generation failed." },
      { status: 500 }
    );
  }
}
