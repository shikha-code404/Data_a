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

async function checkDb() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("URL:", supabaseUrl);
  
  const admin = createClient(supabaseUrl, supabaseKey);
  const userId = "9b8acd01-31ef-4b5e-b8ad-b96dae38dc54";
  console.log("Checking database for user:", userId);
  try {
    const { data, error } = await admin
      .from("candidate_profiles")
      .select("career_roadmap, talent_score, talent_profile")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    console.log("talent_score:", JSON.stringify(data.talent_score, null, 2));
    console.log("career_roadmap:", JSON.stringify(data.career_roadmap, null, 2));
  } catch (err) {
    console.error("Database error:", err.message);
  }
}

checkDb();
