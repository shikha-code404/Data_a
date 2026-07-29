import { NextRequest, NextResponse } from "next/server";
import { createServerDbClient } from "@/lib/db/serverClient";
import { getProfileCompletenessForUser } from "@/lib/profile/completeness";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get("userId");

    // If userId not provided in query params, try getting logged-in user from session
    if (!userId && process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      try {
        const supabase = await createServerDbClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn("Session check skipped:", err);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Missing userId query parameter or active user session." },
        { status: 401 }
      );
    }

    const completeness = await getProfileCompletenessForUser(userId);
    return NextResponse.json(completeness);
  } catch (err: any) {
    console.error("Error in /api/candidate/completeness:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
