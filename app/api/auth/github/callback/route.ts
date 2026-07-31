import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerDbClient } from "@/lib/db/serverClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Handle user denial at GitHub's consent screen
  if (error) {
    console.error(`GitHub OAuth denied by user: ${error}`);
    return NextResponse.redirect(new URL("/candidate/onboarding?status=github_denied", siteUrl));
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("github_oauth_state")?.value;

  // Clear state cookie immediately
  cookieStore.delete("github_oauth_state");

  if (!state || !storedState || state !== storedState) {
    console.error(`CSRF Verification failed. Got state: ${state}, stored: ${storedState}`);
    return NextResponse.redirect(new URL("/candidate/onboarding?status=csrf_failed", siteUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/candidate/onboarding?status=no_code", siteUrl));
  }

  // 1. Get current user session via Supabase server client
  const supabase = await createServerDbClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("No active Supabase user session found:", userError);
    return NextResponse.redirect(new URL("/login?error=session_expired", siteUrl));
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("GitHub client ID or secret is not configured in the environment.");
    return new NextResponse("OAuth provider is misconfigured", { status: 500 });
  }

  // 2. Exchange authorization code for access token
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${siteUrl}/api/auth/github/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange responded with status ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("Access token not found in GitHub response:", tokenData);
      return NextResponse.redirect(new URL("/candidate/onboarding?status=token_error", siteUrl));
    }

    // 3. Fetch GitHub username
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Talent-AI-Platform",
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API user call responded with status ${userResponse.status}`);
    }

    const githubUser = await userResponse.json();
    const githubUsername = githubUser.login;

    if (!githubUsername) {
      return NextResponse.redirect(new URL("/candidate/onboarding?status=no_username", siteUrl));
    }

    // 4. Update the candidate profile in database
    const { error: updateError } = await supabase
      .from("candidate_profiles")
      .update({
        github_access_token: accessToken,
        github_username: githubUsername,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update candidate profile in Supabase:", updateError);
      return NextResponse.redirect(new URL("/candidate/onboarding?status=db_error", siteUrl));
    }

    console.log(`Successfully connected GitHub for user ${user.id} as @${githubUsername}`);

    // Redirect back to onboarding with success
    return NextResponse.redirect(new URL("/candidate/onboarding?status=github_connected", siteUrl));
  } catch (err: any) {
    console.error("GitHub OAuth Callback failed:", err);
    return NextResponse.redirect(new URL(`/candidate/onboarding?status=error&message=${encodeURIComponent(err.message)}`, siteUrl));
  }
}
