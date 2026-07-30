const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const http = require('http');

// 1. Load env variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

function getJSON(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function run() {
  console.log("=== Phase 5 Hackathon Leaderboard Endpoint & Ranking Logic Tests ===");

  // A. Clean up old test data
  const { data: oldHacks } = await supabase
    .from("hackathons")
    .select("id")
    .ilike("name", "%Leaderboard Test Hackathon%");

  if (oldHacks && oldHacks.length > 0) {
    const oldIds = oldHacks.map(h => h.id);
    await supabase.from("hackathons").delete().in("id", oldIds);
  }

  // B. Seed a new test Hackathon
  const { data: hackathon, error: hackErr } = await supabase
    .from("hackathons")
    .insert({
      name: "Leaderboard Test Hackathon",
      date: new Date().toISOString().split("T")[0],
      description: "programmatic verification hackathon"
    })
    .select()
    .single();

  if (hackErr || !hackathon) {
    throw new Error(`Failed to seed hackathon: ${hackErr?.message}`);
  }

  console.log("Created Hackathon ID:", hackathon.id);

  // C. Create three teams
  const { data: teamA } = await supabase
    .from("hackathon_teams")
    .insert({ hackathon_id: hackathon.id, team_name: "Leaderboard Balanced Team", project_repo: "https://github.com/a", innovation_score: 85 })
    .select().single();

  const { data: teamB } = await supabase
    .from("hackathon_teams")
    .insert({ hackathon_id: hackathon.id, team_name: "Leaderboard Dominant Team", project_repo: "https://github.com/b", innovation_score: 92 })
    .select().single();

  const { data: teamC } = await supabase
    .from("hackathon_teams")
    .insert({ hackathon_id: hackathon.id, team_name: "Leaderboard Missing Data Team", project_repo: "https://github.com/c", innovation_score: 70 })
    .select().single();

  // Map candidates
  const { data: candidates } = await supabase
    .from("candidate_profiles")
    .select("id, user_id");

  const candA = candidates.find(c => c.user_id === "0ee73e0e-0529-4480-a16c-15748a277bde").id;
  const candB = candidates.find(c => c.user_id === "1ee73e0e-0529-4480-a16c-15748a277bdf").id;
  const candC = candidates.find(c => c.user_id === "2ee73e0e-0529-4480-a16c-15748a277be0").id;

  const { error: membersErr } = await supabase.from("hackathon_members").insert([
    { team_id: teamA.id, candidate_id: candA },
    { team_id: teamA.id, candidate_id: candB },
    { team_id: teamB.id, candidate_id: candC },
    { team_id: teamC.id, candidate_id: candA }
  ]);
  if (membersErr) {
    console.error("Error inserting hackathon members:", membersErr);
  }

  // Seed Team A: Pitch = 85, Dominance flag = false, percentage = 40
  await supabase.from("pitch_analyses").insert({
    team_id_or_candidate_id: teamA.id,
    ppt_url: "https://example.com/a.pptx",
    scores: { overall_pitch_score: 85 },
    summary: "Balanced",
    improvement_suggestions: []
  });
  await supabase.from("team_contributions").insert({
    team_id: teamA.id,
    member_breakdown: { summary: { dominance: { flag: false, percentage: 40 } } }
  });

  // Seed Team B: Pitch = 92, Dominance flag = true, percentage = 90
  await supabase.from("pitch_analyses").insert({
    team_id_or_candidate_id: teamB.id,
    ppt_url: "https://example.com/b.pptx",
    scores: { overall_pitch_score: 92 },
    summary: "High Dominance",
    improvement_suggestions: []
  });
  await supabase.from("team_contributions").insert({
    team_id: teamB.id,
    member_breakdown: { summary: { dominance: { flag: true, percentage: 90 } } }
  });

  // Keep Team C completely unanalyzed (missing pitch and contributions)

  // --- TEST 1: Ranking API when Team C has missing upstream data ---
  console.log("\n--- TEST 1: Trigger Ranking with Missing Team C Upstream Data ---");
  const res1 = await postJSON('/api/hackathons/rank', { hackathon_id: hackathon.id });
  console.log("Status:", res1.status);
  console.log("Error Payload:", res1.body);

  if (res1.status !== 500) {
    throw new Error("Test 1 Failed: Expected status 500 due to missing team analysis data!");
  }
  if (!res1.body.error || !res1.body.error.includes("Upstream Pitch Deck Analysis is missing")) {
    throw new Error("Test 1 Failed: Response did not indicate correct missing pitch error message.");
  }
  console.log("Strict error handling validated successfully!");

  // Seed Team C's missing data
  console.log("\nSeeding Team C upstream data to enable successful ranking...");
  await supabase.from("pitch_analyses").insert({
    team_id_or_candidate_id: teamC.id,
    ppt_url: "https://example.com/c.pptx",
    scores: { overall_pitch_score: 75 },
    summary: "Missing no more",
    improvement_suggestions: []
  });
  await supabase.from("team_contributions").insert({
    team_id: teamC.id,
    member_breakdown: { summary: { dominance: { flag: false, percentage: 50 } } }
  });

  // --- TEST 2: Successful ranking with all data seeded ---
  console.log("\n--- TEST 2: Trigger Ranking with Complete Data ---");
  const res2 = await postJSON('/api/hackathons/rank', { hackathon_id: hackathon.id });
  console.log("Status:", res2.status);
  console.log("Success:", res2.body.success);

  if (res2.status !== 200 || !res2.body.success) {
    throw new Error(`Test 2 Failed: Status is ${res2.status}`);
  }

  // Verify Ranking Calculations:
  // Team A (Balanced): Pitch 85, Dominance flag: false. Composite: 85.
  // Team B (Dominant): Pitch 92, Dominance flag: true (90% dominance). Penalty = 0.1 * 90 = 9. Composite: 92 - 9 = 83.
  // Team C: Pitch 75, Dominance flag: false. Composite: 75.
  // Expected Rankings: Rank 1 = Team A (85), Rank 2 = Team B (83), Rank 3 = Team C (75).
  const ranked = res2.body.ranked_teams;
  console.log("Ranked Results:");
  ranked.forEach(t => console.log(`- Rank #${t.rank}: ${t.team_name} | Pitch Score: ${t.pitch_score} | Composite Score: ${t.composite_score}`));

  if (ranked[0].team_name !== "Leaderboard Balanced Team" || ranked[0].rank !== 1) {
    throw new Error("Test 2 Failed: Balanced Team A should be Rank 1 due to B's dominance penalty!");
  }
  if (ranked[1].team_name !== "Leaderboard Dominant Team" || ranked[1].rank !== 2) {
    throw new Error("Test 2 Failed: Dominant Team B should be Rank 2!");
  }
  if (ranked[2].team_name !== "Leaderboard Missing Data Team" || ranked[2].rank !== 3) {
    throw new Error("Test 2 Failed: Team C should be Rank 3!");
  }
  console.log("Leaderboard Ranking with composite dominance penalty validated successfully!");

  // --- TEST 3: Retrieve Recruiter Leaderboard and drill-down scout data ---
  console.log("\n--- TEST 3: Retrieve Recruiter Leaderboard with Scout Drill-down ---");
  const res3 = await getJSON(`/api/hackathons/${hackathon.id}/leaderboard`);
  console.log("Status:", res3.status);
  console.log("Leaderboard row count:", res3.body.leaderboard.length);

  if (res3.status !== 200) {
    throw new Error(`Test 3 Failed: Status is ${res3.status}`);
  }

  const board = res3.body.leaderboard;
  // Let's verify that Team A has the drill-down member details
  const teamARow = board.find(t => t.team_name === "Leaderboard Balanced Team");
  if (!teamARow || !teamARow.members || teamARow.members.length !== 2) {
    throw new Error("Test 3 Failed: Missing or incorrect drill-down member list for Team A!");
  }

  const alexRivera = teamARow.members.find(m => m.full_name === "Alex Rivera");
  if (!alexRivera || typeof alexRivera.talent_score !== "number") {
    throw new Error("Test 3 Failed: Member drill-down does not contain candidate talent_score!");
  }

  console.log("Recruiter drill-down data verified! Alex Rivera Talent Score:", alexRivera.talent_score);
  console.log("\nAll Hackathon Leaderboard and Ranking tests PASSED successfully!");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
