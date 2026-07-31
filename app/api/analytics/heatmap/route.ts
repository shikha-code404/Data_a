import { NextRequest, NextResponse } from "next/server";
import { getTalentHeatmapData, HeatmapGroupBy } from "@/lib/analytics/heatmap";

/**
 * GET /api/analytics/heatmap
 *
 * Aggregates candidate location, campus, department, and graduation year data
 * into talent density and reputation statistics.
 *
 * Query Params:
 * - `by`: 'campus' | 'city' | 'department' | 'year' (default: 'campus')
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const byParam = (searchParams.get("by") || "campus").toLowerCase();
    
    let groupBy: HeatmapGroupBy = "campus";
    if (["city", "department", "year"].includes(byParam)) {
      groupBy = byParam as HeatmapGroupBy;
    }

    const data = await getTalentHeatmapData(groupBy);

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60"
      }
    });
  } catch (err: any) {
    console.error("[GET /api/analytics/heatmap] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve campus talent heatmap data." },
      { status: 500 }
    );
  }
}
