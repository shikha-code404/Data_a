import { NextRequest, NextResponse } from "next/server";
import { getOrComputeCommunityReputation } from "@/lib/profile/reputation";

/**
 * GET /api/community-score/:candidateId
 *
 * Computes or retrieves a 100% deterministic Community Reputation Score (0-100)
 * from candidate evidence (GitHub commits, Merged PRs, Hackathons, Verified Badges).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;

    if (!candidateId) {
      return NextResponse.json(
        { error: "Candidate ID is required." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forceFresh = searchParams.get("force_fresh") === "true";

    const report = await getOrComputeCommunityReputation(candidateId, forceFresh);

    return NextResponse.json(report, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }
    });
  } catch (err: any) {
    console.error("[GET /api/community-score/:candidateId] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to calculate community reputation score." },
      { status: 500 }
    );
  }
}
