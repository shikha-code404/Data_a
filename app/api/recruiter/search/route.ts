import { NextResponse } from "next/server";
import { searchCandidatesNL } from "@/lib/recruiter/search";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, limit } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "query string parameter is required." },
        { status: 400 }
      );
    }

    const copilotResult = await searchCandidatesNL(query, limit || 10);

    return NextResponse.json({
      success: true,
      query: copilotResult.query,
      extracted_filters: copilotResult.extracted_filters,
      total_matched: copilotResult.total_matched,
      candidates: copilotResult.candidates,
      // For backwards compatibility
      results: copilotResult.candidates,
    });
  } catch (err: any) {
    console.error("API POST /api/recruiter/search failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
