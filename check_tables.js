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
  console.log("Checking if tables exist...");
  
  const { data: irData, error: irErr } = await supabase
    .from('interview_reports')
    .select('count')
    .limit(1);
    
  console.log("interview_reports:", irData, irErr ? irErr.message : "Exists!");

  const { data: tcData, error: tcErr } = await supabase
    .from('team_contributions')
    .select('count')
    .limit(1);
    
  console.log("team_contributions:", tcData, tcErr ? tcErr.message : "Exists!");
  
  const { data: profData, error: profErr } = await supabase
    .from('candidate_profiles')
    .select('user_id')
    .eq('user_id', '0ee73e0e-0529-4480-a16c-15748a277bde')
    .maybeSingle();

  console.log("test candidate profile:", profData, profErr ? profErr.message : "Exists!");
}

run().catch(console.error);
