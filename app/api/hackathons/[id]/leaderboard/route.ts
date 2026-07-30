import { NextRequest, NextResponse } from "next/server";
import { getHackathonLeaderboard } from "@/lib/hackathon/leaderboard";

/**
 * GET /api/hackathons/[id]/leaderboard
 *
 * Retrieves the complete leaderboard for a hackathon, including team ranking
 * and member details (talent_score and skills) for recruiter scouting drill-down.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Hackathon ID is required." },
        { status: 400 }
      );
    }

    console.log(`[API /api/hackathons/[id]/leaderboard] Fetching leaderboard for: ${id}`);
    const results = await getHackathonLeaderboard(id);

    return NextResponse.json(
      { success: true, leaderboard: results },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[GET /api/hackathons/[id]/leaderboard] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch leaderboard." },
      { status: 500 }
    );
  }
}
