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
      .select("github_username, github_access_token, github_data, resume_data, resume_needs_review, talent_profile, talent_score, career_roadmap, salary_estimate")
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
      talentScore: profile?.talent_score || null,
      careerRoadmap: profile?.career_roadmap || null,
      salaryEstimate: profile?.salary_estimate || null,
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
    console.log(`[Upload Resume] Extracted ${rawText.length} chars from PDF`);

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
    console.log(`[Onboarding] Extracted ${rawText.length} chars from PDF for user ${user.id}`);

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

export async function generateTalentScoreAction() {
  const { calculateCandidateTalentScore } = require("@/lib/agents/talentScore");
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }
    const result = await calculateCandidateTalentScore(user.id);
    return result;
  } catch (err: any) {
    console.error("Failed to generate talent score:", err);
    return { success: false, error: err.message };
  }
}

export async function getCandidateJobMatches() {
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Fetch recommendations for this candidate
    const { data: recs, error: dbError } = await supabase
      .from("job_recommendations")
      .select("id, job_id, match_percentage, breakdown")
      .eq("candidate_id", user.id);

    if (dbError) {
      console.warn("Notice querying job_recommendations, falling back to job_postings:", dbError);
    }

    // 2. Extract job_ids and fetch corresponding job_postings
    const jobIds = (recs || []).map((r: any) => r.job_id).filter(Boolean);
    
    let jobPostings: any[] = [];
    if (jobIds.length > 0) {
      const { data: postingData } = await supabase
        .from("job_postings")
        .select("id, title, company, description, location, salary_range, skills_required")
        .in("id", jobIds);
      jobPostings = postingData || [];
    } else {
      // Fallback: Fetch all active job postings if no explicit recommendations exist yet
      const { data: postingData } = await supabase
        .from("job_postings")
        .select("id, title, company, description, location, salary_range, skills_required")
        .limit(10);
      jobPostings = postingData || [];
    }

    const jobMap = new Map<string, any>();
    jobPostings.forEach((jp) => jobMap.set(jp.id, jp));

    const recMap = new Map<string, any>();
    (recs || []).forEach((r) => recMap.set(r.job_id, r));

    const jobs = jobPostings.map((job: any) => {
      const r = recMap.get(job.id);
      return {
        id: r?.id || job.id,
        jobId: job.id,
        title: job.title || "Untitled Position",
        company: job.company || "Partner Company",
        location: job.location || "Remote",
        type: "Full-time",
        salary: job.salary_range || "$120,000 - $150,000",
        matchScore: r?.match_percentage || 85,
        description: job.description || "",
        badges: job.skills_required || [],
        matchedSkills: r?.breakdown?.matching_skills || job.skills_required || [],
        skillGaps: r?.breakdown?.missing_skills || []
      };
    });

    return { success: true, jobs };
  } catch (err: any) {
    console.error("Failed to fetch job matches:", err);
    return { success: false, error: err.message };
  }
}

export async function getCandidateHackathons() {
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // 1. Get candidate profile id
    const { data: profile, error: profileErr } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "Candidate profile not found." };
    }

    // 2. Fetch team memberships
    const { data: memberships, error: dbError } = await supabase
      .from("hackathon_members")
      .select(`
        team_id,
        team:hackathon_teams (
          id,
          team_name,
          hackathon:hackathons (
            id,
            name,
            date,
            description
          )
        )
      `)
      .eq("candidate_id", profile.id);

    if (dbError) {
      console.error("Failed to query hackathon memberships:", dbError);
      return { success: false, error: "Database error" };
    }

    const regs = (memberships || []).map((m: any) => {
      const team = m.team;
      const hack = team?.hackathon;
      return {
        id: hack?.id || team?.id || "",
        title: hack?.name || team?.team_name || "Hackathon Event",
        status: `Team: ${team?.team_name || "Assigned"}`,
      };
    });

    return { success: true, registrations: regs };
  } catch (err: any) {
    console.error("Failed to fetch hackathons:", err);
    return { success: false, error: err.message };
  }
}

export async function getGeneratedResumeAction(templateName: string, targetCompany: string | null) {
  try {
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    let query = supabase
      .from("resumes")
      .select("*")
      .eq("candidate_id", user.id)
      .eq("template_name", templateName);

    if (targetCompany === null) {
      query = query.is("target_company", null);
    } else {
      query = query.eq("target_company", targetCompany);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to query generated resume:", error);
      return { success: false, error: "Database error" };
    }

    return { success: true, resume: data };
  } catch (err: any) {
    console.error("Failed to get generated resume:", err);
    return { success: false, error: err.message };
  }
}

