"use server";

import { createServerDbClient } from "@/lib/db/serverClient";
import { ingestGitHubData } from "@/lib/github/ingestion";
import { extractTextFromPDF, parseResumeAndSave, ResumeData } from "@/lib/resume/parser";

export async function getCandidateProfileData() {
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: profile, error: dbError } = await supabase
      .from("candidate_profiles")
      .select("github_username, github_access_token, github_data, resume_data, resume_needs_review, talent_profile")
      .eq("user_id", user.id)
      .maybeSingle();

    if (dbError) {
      console.error("Failed to fetch candidate profile:", dbError);
      return { success: false, error: "Database error" };
    }

    return {
      success: true,
      githubUsername: profile?.github_username || null,
      isGitHubConnected: !!profile?.github_access_token,
      githubData: profile?.github_data || null,
      resumeData: (profile?.resume_data as ResumeData) || null,
      resumeNeedsReview: !!profile?.resume_needs_review,
      talentProfile: profile?.talent_profile || null,
    };
  } catch (err: any) {
    console.error("Failed to get profile data:", err);
    return { success: false, error: err.message };
  }
}

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const rawText = await extractTextFromPDF(buffer);
    if (!rawText.trim()) {
      return { success: false, error: "The uploaded PDF appears to be empty or contains unreadable text." };
    }

    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in to upload your resume." };
    }

    const result = await parseResumeAndSave(rawText, user.id);

    return {
      success: result.success,
      data: result.data,
      needsReview: result.needsReview,
    };
  } catch (err: any) {
    console.error("Failed to parse and save resume:", err);
    return { success: false, error: err.message };
  }
}

export async function completeOnboarding(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Resume file is required." };
    }

    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    // 1. Fetch github_username from candidate_profiles
    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("github_username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile?.github_username) {
      return { success: false, error: "GitHub account connection is mandatory before completing onboarding." };
    }

    const githubUsername = profile.github_username;

    // 2. Extract text from PDF
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const rawText = await extractTextFromPDF(buffer);
    if (!rawText.trim()) {
      return { success: false, error: "The uploaded PDF appears to be empty or contains unreadable text." };
    }

    console.log(`[Onboarding] Running GitHub Ingestion and Resume Parsing CONCURRENTLY for user ${user.id}...`);

    // 3. Concurrently execute GitHub ingestion and Resume parsing
    const [githubResult, resumeResult] = await Promise.all([
      ingestGitHubData(githubUsername, user.id),
      parseResumeAndSave(rawText, user.id),
    ]);

    if (!githubResult || !resumeResult.success) {
      throw new Error("One or more onboarding ingestion components failed.");
    }

    // 4. Merge results into a single talent_profile object
    const talentProfile = {
      github: githubResult,
      resume: resumeResult.data,
      manual: {
        hackathons: [],
        certifications: [],
        awards: [],
      },
    };

    // 5. Save talent_profile back to candidate_profiles
    const { error: dbError } = await supabase
      .from("candidate_profiles")
      .update({
        talent_profile: talentProfile,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to write talent_profile:", dbError);
      return { success: false, error: "Failed to save talent profile to database." };
    }

    console.log(`[Onboarding Success] Successfully saved talent_profile for user_id ${user.id}`);
    return { success: true };
  } catch (err: any) {
    console.error("Onboarding workflow failed:", err);
    return { success: false, error: err.message };
  }
}

export async function saveTalentProfile(talentProfile: any) {
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const { error: dbError } = await supabase
      .from("candidate_profiles")
      .update({
        talent_profile: talentProfile,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (dbError) {
      console.error("Failed to update talent_profile:", dbError);
      return { success: false, error: "Failed to update profile database record." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to save edited talent profile:", err);
    return { success: false, error: err.message };
  }
}
