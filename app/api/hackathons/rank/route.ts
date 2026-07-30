import { NextRequest, NextResponse } from "next/server";
import { calculateHackathonRankings } from "@/lib/hackathon/leaderboard";

/**
 * POST /api/hackathons/rank
 *
 * Triggers the ranking calculations for all teams in a given hackathon.
 *
 * Request Body:
 * {
 *   "hackathon_id": "uuid-string"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    let body: { hackathon_id?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const { hackathon_id } = body;

    if (!hackathon_id || typeof hackathon_id !== "string") {
      return NextResponse.json(
        { error: "hackathon_id is required as a string UUID." },
        { status: 400 }
      );
    }

    console.log(`[API /api/hackathons/rank] Calculating rankings for: ${hackathon_id}`);
    const results = await calculateHackathonRankings(hackathon_id);

    return NextResponse.json(
      { success: true, ranked_teams: results },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[POST /api/hackathons/rank] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message ?? "Ranking calculation failed." },
      { status: 500 }
    );
  }
}
