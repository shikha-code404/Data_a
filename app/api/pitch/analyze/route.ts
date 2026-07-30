import { NextResponse } from "next/server";
import { analyzePitchDeck } from "@/lib/pitch/analyzer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const teamIdOrCandidateId = formData.get("team_id_or_candidate_id") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No pitch deck file (PDF or PPTX) provided." },
        { status: 400 }
      );
    }

    if (!teamIdOrCandidateId) {
      return NextResponse.json(
        { success: false, error: "team_id_or_candidate_id is required." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Run pitch deck analyzer service
    const result = await analyzePitchDeck(buffer, file.name, teamIdOrCandidateId);

    return NextResponse.json({
      success: result.success,
      message: "Pitch deck analyzed and saved successfully!",
      analysis: result.data,
      needsReview: result.needsReview,
    });
  } catch (err: any) {
    console.error("API POST /api/pitch/analyze failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 } // DB check failure or missing reference throws and returns bad request
    );
  }
}
