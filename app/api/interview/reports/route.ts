import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";

/**
 * GET /api/interview/reports
 * Fetches all interview reports with candidate profile data.
 * Used by the recruiter interviews page.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: reports, error } = await supabase
      .from("interview_reports")
      .select("id, candidate_id, questions, answers, report, needs_review, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Interview Reports API] DB Error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Enrich with candidate profile data
    const candidateIds = (reports || []).map((r: any) => r.candidate_id).filter(Boolean);
    let profileMap = new Map<string, any>();

    if (candidateIds.length > 0) {
      const { data: profiles } = await supabase
        .from("candidate_profiles")
        .select("user_id, github_username, talent_profile, talent_score")
        .in("user_id", candidateIds);

      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p));
    }

    const enrichedReports = (reports || []).map((r: any) => {
      const profile = profileMap.get(r.candidate_id);
      const resume = profile?.talent_profile?.resume || {};
      return {
        id: r.id,
        candidateId: r.candidate_id,
        name: resume.name || profile?.github_username || "Candidate",
        avatar: profile?.github_username
          ? `https://avatars.githubusercontent.com/${profile.github_username}`
          : null,
        role: resume.experience?.[0]?.role || "Software Engineer",
        communicationScore: r.report?.communication_rating || 0,
        technicalScore: r.report?.technical_rating || 0,
        overallScore: r.report?.confidence_score || 0,
        recommendation: r.report?.hiring_recommendation || "maybe",
        summary: r.report?.summary || "",
        strengths: r.report?.strengths || [],
        concerns: r.report?.concerns || [],
        questions: r.questions || {},
        answers: r.answers || {},
        needsReview: r.needs_review,
        createdAt: r.created_at,
      };
    });

    return NextResponse.json({ success: true, reports: enrichedReports });
  } catch (err: any) {
    console.error("[Interview Reports API] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
