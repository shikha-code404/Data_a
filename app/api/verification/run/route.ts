import { NextRequest, NextResponse } from "next/server";
import { runSkillVerification } from "@/lib/verification/engine";

/**
 * POST /api/verification/run
 *
 * Body:
 * {
 *   candidate_id: string,           // UUID of an existing candidate_profiles row
 *   skill: string,                  // e.g. "React" | "Python" | "SQL" | "TypeScript"
 *   mcq_answers: string[],          // Full option strings in the same order the engine fetches questions
 *   free_response_answer: string    // Candidate's written answer to the free-response question
 * }
 *
 * Response: SkillVerificationResult JSON
 */
export async function POST(req: NextRequest) {
  let body: {
    candidate_id?: string;
    skill?: string;
    mcq_answers?: string[];
    free_response_answer?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { candidate_id, skill, mcq_answers, free_response_answer } = body;

  if (!candidate_id || typeof candidate_id !== "string") {
    return NextResponse.json(
      { error: "Missing required field: candidate_id (string UUID)." },
      { status: 400 }
    );
  }
  if (!skill || typeof skill !== "string") {
    return NextResponse.json(
      { error: "Missing required field: skill (string, e.g. 'React')." },
      { status: 400 }
    );
  }
  if (!Array.isArray(mcq_answers)) {
    return NextResponse.json(
      { error: "Missing required field: mcq_answers (string[])." },
      { status: 400 }
    );
  }
  if (typeof free_response_answer !== "string") {
    return NextResponse.json(
      { error: "Missing required field: free_response_answer (string)." },
      { status: 400 }
    );
  }

  try {
    const result = await runSkillVerification(
      candidate_id,
      skill,
      mcq_answers,
      free_response_answer
    );
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[POST /api/verification/run] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Verification failed." },
      { status: 500 }
    );
  }
}
