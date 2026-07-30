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
  const email = `test-candidate-${Date.now()}@talentai.io`;
  const password = 'Password123!';

  console.log(`Signing up user: ${email}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) {
    console.error("Sign up failed:", signUpError);
    return;
  }

  const user = signUpData.user;
  const session = signUpData.session;
  console.log(`Sign up successful. User ID: ${user.id}`);

  // Create a profile object
  const profile = {
    user_id: user.id,
    github_username: 'alexrivera-dev',
    talent_profile: {
      resume: {
        title: "Senior Full Stack Engineer",
        skills: ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "Python"],
        experience: [
          {
            company: "TechSpark",
            role: "Senior Developer",
            description: "3+ years building Next.js & Supabase apps"
          }
        ]
      },
      github: {
        topLanguages: { "TypeScript": 85, "Python": 15 },
        repositories: [
          {
            name: "next-ai-recruiter",
            description: "AI candidate scoring & vector engine"
          }
        ]
      },
      manual: {
        hackathons: [
          {
            title: "Global AI Hackathon 2025",
            award: "1st Place Winner"
          }
        ]
      }
    },
    talent_score: {
      overallScore: 92,
      breakdown: {
        codeQuality: 95,
        skillFit: 90
      }
    },
    github_data: {
      repositories: [
        {
          name: "next-ai-recruiter",
          description: "AI candidate scoring and vector matching engine",
          primary_language: "TypeScript",
          stars: 12,
          is_fork: false
        },
        {
          name: "react-dashboard-ui",
          description: "Component library and dashboard built with React",
          primary_language: "TypeScript",
          stars: 8,
          is_fork: false
        },
        {
          name: "supabase-rls-helper",
          description: "Utilities for Supabase Row Level Security policies",
          primary_language: "TypeScript",
          stars: 6,
          is_fork: false
        },
        {
          name: "py-ml-pipeline",
          description: "Python ML data pipeline with scikit-learn",
          primary_language: "Python",
          stars: 5,
          is_fork: false
        },
        {
          name: "ts-fork-experiment",
          description: "Forked TypeScript experiment",
          primary_language: "TypeScript",
          stars: 0,
          is_fork: true
        }
      ],
      languages: { "TypeScript": 0.72, "Python": 0.23, "Shell": 0.05 },
      commits: {
        total_last_12_months: 163,
        by_repository: {
          "next-ai-recruiter": 82,
          "react-dashboard-ui": 48,
          "supabase-rls-helper": 20,
          "py-ml-pipeline": 13
        },
        active_months: [
          "2025-01","2025-02","2025-03","2025-04","2025-05",
          "2025-06","2025-07","2025-08","2025-09","2025-10"
        ]
      },
      pull_requests: { opened: 31, merged: 24 },
      top_5_repos_by_stars: [
        { name: "next-ai-recruiter",  stars: 12 },
        { name: "react-dashboard-ui", stars: 8  },
        { name: "supabase-rls-helper",stars: 6  },
        { name: "py-ml-pipeline",     stars: 5  }
      ]
    }
  };

  console.log("Updating candidate profile...");
  const { data: updateData, error: updateError } = await supabase
    .from('candidate_profiles')
    .update(profile)
    .eq('user_id', user.id);

  console.log("Update result:", updateData, updateError);

  console.log("Selecting candidate profile to verify...");
  const { data: selectData, error: selectError } = await supabase
    .from('candidate_profiles')
    .select('user_id, github_username, github_data')
    .eq('user_id', user.id)
    .single();

  console.log("Select result:", selectData, selectError);
}

run().catch(console.error);

