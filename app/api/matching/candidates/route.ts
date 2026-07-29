import { NextResponse } from "next/server";
import { matchCandidateToJob, matchJobToAllCandidates } from "@/lib/matching/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, candidateId, limit } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId parameter is required." },
        { status: 400 }
      );
    }

    if (candidateId) {
      // Single candidate-job match
      const result = await matchCandidateToJob(candidateId, jobId);
      return NextResponse.json({
        success: true,
        match: result,
      });
    } else {
      // Match job against all candidates
      const matches = await matchJobToAllCandidates(jobId, limit || 10);
      return NextResponse.json({
        success: true,
        matches,
      });
    }
  } catch (err: any) {
    console.error("API /api/matching/candidates failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
