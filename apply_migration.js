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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Client using service role key to execute raw SQL (if RPC is available) or we can apply it
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function run() {
  console.log(`Applying migrations to: ${supabaseUrl}`);
  
  const migrationPath = path.resolve(__dirname, 'supabase', 'migrations', '0020_enable_rls_policies.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Supabase doesn't expose a raw query execution API on the client out of the box unless we use an RPC.
  // But wait, we can execute the queries using the POSTGRES connection or tell the user how to apply it,
  // or check if there is an RPC we can use.
  // Since we don't have direct SQL RPC by default, we can instruct the user or use a direct postgres library if pg is installed.
  // Let's check if the 'pg' library is installed or we can connect to the postgres database using the connection string.
  
  const connectionString = `postgresql://postgres:[password]@db.dcmfbtuhtzjogpyguhte.supabase.co:5432/postgres`;
  console.log("SQL Migration Content to Apply:\n");
  console.log(sql);
  console.log("\nIf you have direct access, you can run this in the Supabase SQL Editor.");
}

run().catch(console.error);
