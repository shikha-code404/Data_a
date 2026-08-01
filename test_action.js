const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      process.env[match[1]] = match[2].trim().replace(/^"|"$/g, "");
    }
  });
}

// Mock auth headers and fetch profile data like Next.js server actions do
async function checkActionResponse() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const userId = "9b8acd01-31ef-4b5e-b8ad-b96dae38dc54";
  const { data: profile, error: dbError } = await supabase
    .from("candidate_profiles")
    .select("github_username, github_access_token, github_data, resume_data, resume_needs_review, talent_profile, talent_score, career_roadmap, salary_estimate")
    .eq("user_id", userId)
    .single();

  console.log("getCandidateProfileData response mock:");
  console.log("Success: true");
  console.log("careerRoadmap:", JSON.stringify(profile?.career_roadmap, null, 2));
}

checkActionResponse();
