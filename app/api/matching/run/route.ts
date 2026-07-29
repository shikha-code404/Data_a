import { NextResponse } from "next/server";
import { runJobMatchingEngine } from "@/lib/matching/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { job_id, jobId } = body;

    const targetJobId = job_id || jobId;

    if (!targetJobId) {
      return NextResponse.json(
        { success: false, error: "job_id parameter is required in request body." },
        { status: 400 }
      );
    }

    const rankedCandidates = await runJobMatchingEngine(targetJobId);

    return NextResponse.json({
      success: true,
      job_id: targetJobId,
      candidates_count: rankedCandidates.length,
      candidates: rankedCandidates,
    });
  } catch (err: any) {
    console.error("API POST /api/matching/run failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
