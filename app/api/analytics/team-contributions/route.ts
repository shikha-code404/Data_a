import { NextRequest, NextResponse } from "next/server";
import { calculateTeamContributions } from "@/lib/analytics/team";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team_id, member_ids } = body;

    if (!team_id || typeof team_id !== "string" || team_id.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameter: team_id" },
        { status: 400 }
      );
    }
    if (!member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid parameter: member_ids (must be a non-empty array of candidate IDs)" },
        { status: 400 }
      );
    }

    const result = await calculateTeamContributions(team_id, member_ids);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Error in /api/analytics/team-contributions:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to calculate team contributions" },
      { status: 500 }
    );
  }
}
