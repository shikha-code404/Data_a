import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/interview/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate_id } = body;

    if (!candidate_id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: candidate_id" },
        { status: 400 }
      );
    }

    const questions = await generateInterviewQuestions(candidate_id);
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    console.error("Error in /api/interview/generate:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
