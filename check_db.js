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
  const admin = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await admin
    .from("candidate_profiles")
    .select("user_id, github_username, talent_profile, resume_data");

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Found", data.length, "candidate profiles.");
  data.forEach((p, idx) => {
    console.log(`\n--- Candidate Profile ${idx + 1} (${p.user_id}) ---`);
    console.log("GitHub Username:", p.github_username);
    console.log("resume_data:", JSON.stringify(p.resume_data, null, 2));
    console.log("talent_profile:", JSON.stringify(p.talent_profile, null, 2));
  });
}

checkDb();
