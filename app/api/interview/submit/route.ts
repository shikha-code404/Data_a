import { NextRequest, NextResponse } from "next/server";
import { submitAndEvaluateInterview } from "@/lib/interview/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate_id, questions, answers } = body;

    if (!candidate_id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: candidate_id" },
        { status: 400 }
      );
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameter: questions (must be a non-empty array)" },
        { status: 400 }
      );
    }
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameter: answers (must be a question-answer key-value object)" },
        { status: 400 }
      );
    }

    const result = await submitAndEvaluateInterview(candidate_id, questions, answers);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in /api/interview/submit:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit and evaluate interview" },
      { status: 500 }
    );
  }
}
