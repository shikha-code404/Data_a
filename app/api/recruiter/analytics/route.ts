import { NextRequest, NextResponse } from "next/server";
import { getPredictiveHiringAnalytics } from "@/lib/analytics/predictive";

/**
 * GET /api/recruiter/analytics
 *
 * Generates Predictive Hiring Analytics for recruiters reusing existing candidate scores,
 * interview reports, vector match percentages, fraud audits, and community reputation.
 */
export async function GET(req: NextRequest) {
  try {
    const analytics = await getPredictiveHiringAnalytics();

    return NextResponse.json(analytics, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60, s-maxage=60"
      }
    });
  } catch (err: any) {
    console.error("[GET /api/recruiter/analytics] Error:", err?.message);
    return NextResponse.json(
      { error: err?.message || "Failed to generate recruiter predictive analytics." },
      { status: 500 }
    );
  }
}
