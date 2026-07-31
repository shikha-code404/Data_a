const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error("Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

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
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Admin client to bypass RLS, create users, seed test data, and cleanup
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Client to run queries acting as authenticated sessions or anonymous
function getClient(sessionToken = null) {
  const options = {
    auth: { persistSession: false, autoRefreshToken: false }
  };
  const client = createClient(supabaseUrl, supabaseAnonKey, options);
  if (sessionToken) {
    client.auth.setSession({
      access_token: sessionToken,
      refresh_token: 'dummy'
    });
  }
  return client;
}

async function run() {
  console.log(`Target Supabase URL: ${supabaseUrl}`);

  const timestamp = Date.now();
  const candAEmail = `cand-a-${timestamp}@test.com`;
  const candBEmail = `cand-b-${timestamp}@test.com`;
  const recruiterEmail = `recruiter-${timestamp}@test.com`;
  const password = 'TestPassword123!';

  console.log("\n--- Setting up Test Users ---");
  
  // 1. Sign up Candidate A
  const { data: signUpA, error: errA } = await adminClient.auth.signUp({ email: candAEmail, password });
  if (errA) throw errA;
  const userA = signUpA.user;
  console.log(`Created Candidate A: ${userA.id}`);

  // Set Candidate A role
  await adminClient.from('users').update({ role: 'candidate' }).eq('id', userA.id);

  // 2. Sign up Candidate B
  const { data: signUpB, error: errB } = await adminClient.auth.signUp({ email: candBEmail, password });
  if (errB) throw errB;
  const userB = signUpB.user;
  console.log(`Created Candidate B: ${userB.id}`);

  // Set Candidate B role
  await adminClient.from('users').update({ role: 'candidate' }).eq('id', userB.id);

  // 3. Sign up Recruiter
  const { data: signUpRec, error: errRec } = await adminClient.auth.signUp({ email: recruiterEmail, password });
  if (errRec) throw errRec;
  const recruiter = signUpRec.user;
  console.log(`Created Recruiter: ${recruiter.id}`);

  // Set Recruiter role
  await adminClient.from('users').update({ role: 'recruiter' }).eq('id', recruiter.id);

  // Sign in sessions to get access tokens
  const { data: signInA } = await getClient().auth.signInWithPassword({ email: candAEmail, password });
  const sessionTokenA = signInA.session.access_token;

  const { data: signInB } = await getClient().auth.signInWithPassword({ email: candBEmail, password });
  const sessionTokenB = signInB.session.access_token;

  const { data: signInRec } = await getClient().auth.signInWithPassword({ email: recruiterEmail, password });
  const sessionTokenRec = signInRec.session.access_token;

  console.log("\n--- Seeding Mock Data ---");

  // Create candidate_profiles (should be upserted to make sure they exist)
  await adminClient.from('candidate_profiles').upsert([
    { user_id: userA.id, github_username: 'github-a', talent_profile: {}, talent_score: { score: 90 } },
    { user_id: userB.id, github_username: 'github-b', talent_profile: {}, talent_score: { score: 80 } }
  ]);

  // Seed skill_verifications
  await adminClient.from('skill_verifications').insert([
    { candidate_id: userA.id, skill: 'React', mcq_score: 90, free_response_score: 90, repo_quality_score: 90, weighted_score: 90, verified: true },
    { candidate_id: userB.id, skill: 'Python', mcq_score: 80, free_response_score: 80, repo_quality_score: 80, weighted_score: 80, verified: true }
  ]);

  // Seed interview_reports
  await adminClient.from('interview_reports').insert([
    { candidate_id: userA.id, questions: {}, answers: {}, report: {} },
    { candidate_id: userB.id, questions: {}, answers: {}, report: {} }
  ]);

  // Seed fraud_checks
  await adminClient.from('fraud_checks').insert([
    { candidate_id: userA.id, duplicate_matches: [], resume_github_mismatches: [], certificate_flags: [] },
    { candidate_id: userB.id, duplicate_matches: [], resume_github_mismatches: [], certificate_flags: [] }
  ]);

  // Seed authenticity_scores
  await adminClient.from('authenticity_scores').insert([
    { candidate_id: userA.id, score: 95, risk_level: 'low', flags: [] },
    { candidate_id: userB.id, score: 85, risk_level: 'low', flags: [] }
  ]);

  // Create a job posting for the recruiter
  const { data: jobData, error: jobErr } = await adminClient.from('job_postings').insert([
    { recruiter_id: recruiter.id, title: 'Test Frontend Job', company: 'TestCorp', description: 'Testing RLS' }
  ]).select('id').single();
  if (jobErr) throw jobErr;

  // Candidate A matches recruiter's job, Candidate B does NOT
  await adminClient.from('job_recommendations').insert([
    { job_id: jobData.id, candidate_id: userA.id, match_percentage: 95, breakdown: {} }
  ]);

  console.log("Mock data successfully seeded.");

  // Clients with different sessions
  const anonClient = getClient();
  const clientA = getClient(sessionTokenA);
  const clientB = getClient(sessionTokenB);
  const clientRec = getClient(sessionTokenRec);

  const tables = [
    { name: 'candidate_profiles', key: 'user_id' },
    { name: 'skill_verifications', key: 'candidate_id' },
    { name: 'interview_reports', key: 'candidate_id' },
    { name: 'fraud_checks', key: 'candidate_id' },
    { name: 'authenticity_scores', key: 'candidate_id' }
  ];

  let testFailed = false;

  console.log("\n--- TEST 1: Anonymous Reads (Expected: Blocked / Empty) ---");
  for (const table of tables) {
    const { data, error } = await anonClient.from(table.name).select('*');
    if (error) {
      console.log(`[PASS] ${table.name} anon read error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`[FAIL] ${table.name} allowed anonymous read! Rows returned: ${data.length}`);
      testFailed = true;
    } else {
      console.log(`[PASS] ${table.name} anon read returned empty.`);
    }
  }

  console.log("\n--- TEST 2: Candidate A Reading Own Rows (Expected: Success) ---");
  for (const table of tables) {
    const { data, error } = await clientA.from(table.name).select('*').eq(table.key, userA.id);
    if (error) {
      console.log(`[FAIL] Candidate A could not read own ${table.name}: ${error.message}`);
      testFailed = true;
    } else if (data && data.length > 0) {
      console.log(`[PASS] Candidate A read own ${table.name} successfully.`);
    } else {
      console.log(`[FAIL] Candidate A own ${table.name} returned empty.`);
      testFailed = true;
    }
  }

  console.log("\n--- TEST 3: Candidate A Reading Candidate B's Rows (Expected: Blocked / Empty) ---");
  for (const table of tables) {
    const { data, error } = await clientA.from(table.name).select('*').eq(table.key, userB.id);
    if (error) {
      console.log(`[PASS] Candidate A cross-read ${table.name} error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`[FAIL] Candidate A successfully read Candidate B's ${table.name}!`);
      testFailed = true;
    } else {
      console.log(`[PASS] Candidate A cross-read ${table.name} returned empty.`);
    }
  }

  console.log("\n--- TEST 4: Recruiter Reading Candidates (Expected: Read A = Success, Read B = Blocked/Empty) ---");
  // Recruiter read access is defined on the latter 4 tables only
  const latter4Tables = tables.slice(1);
  for (const table of latter4Tables) {
    // Read A (Recommended candidate)
    const { data: dataA, error: errorA } = await clientRec.from(table.name).select('*').eq(table.key, userA.id);
    if (errorA) {
      console.log(`[FAIL] Recruiter could not read matched Candidate A's ${table.name}: ${errorA.message}`);
      testFailed = true;
    } else if (dataA && dataA.length > 0) {
      console.log(`[PASS] Recruiter read matched Candidate A's ${table.name} successfully.`);
    } else {
      console.log(`[FAIL] Recruiter read matched Candidate A's ${table.name} returned empty.`);
      testFailed = true;
    }

    // Read B (Unmatched candidate)
    const { data: dataB, error: errorB } = await clientRec.from(table.name).select('*').eq(table.key, userB.id);
    if (errorB) {
      console.log(`[PASS] Recruiter read unmatched Candidate B's ${table.name} error: ${errorB.message}`);
    } else if (dataB && dataB.length > 0) {
      console.log(`[FAIL] Recruiter read unmatched Candidate B's ${table.name} successfully!`);
      testFailed = true;
    } else {
      console.log(`[PASS] Recruiter read unmatched Candidate B's ${table.name} returned empty.`);
    }
  }

  console.log("\n--- Cleaning Up Test Data ---");
  await adminClient.auth.admin.deleteUser(userA.id);
  await adminClient.auth.admin.deleteUser(userB.id);
  await adminClient.auth.admin.deleteUser(recruiter.id);
  console.log("Cleanup complete.");

  if (testFailed) {
    console.log("\nRLS verification FAILED.");
    process.exit(1);
  } else {
    console.log("\nRLS verification PASSED successfully!");
    process.exit(0);
  }
}

run().catch(async (e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
