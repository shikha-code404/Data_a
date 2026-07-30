const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
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
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const email = 'test-candidate-1785392859380@talentai.io';
  const password = 'Password123!';

  console.log(`Signing in user: ${email}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  const user = signInData.user;
  console.log(`Sign in successful. User ID: ${user.id}`);

  console.log("Selecting candidate profile to verify...");
  const { data: selectData, error: selectError } = await supabase
    .from('candidate_profiles')
    .select('user_id, github_username, github_data')
    .eq('user_id', user.id)
    .single();

  console.log("Select result:", selectData, selectError);
}

run().catch(console.error);
