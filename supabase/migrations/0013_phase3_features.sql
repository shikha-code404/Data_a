-- supabase/migrations/0013_phase3_features.sql
-- Phase 3: AI InterviewAgent & Team Contribution Analytics schema + seeds

-- ====================================================================
-- 1. Interview Reports Table
-- ====================================================================
create table if not exists public.interview_reports (
  id           uuid        primary key default gen_random_uuid(),
  candidate_id uuid        not null unique references public.users(id) on delete cascade,
  questions    jsonb       not null,   -- { technical_questions: string[], behavioral_questions: string[] }
  answers      jsonb       not null,   -- Record<string, string> (question -> answer)
  report       jsonb       not null,   -- evaluated hiring report
  needs_review boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- ====================================================================
-- 2. Team Contributions Table
-- ====================================================================
create table if not exists public.team_contributions (
  id                uuid        primary key default gen_random_uuid(),
  team_id           text        not null unique,
  member_breakdown  jsonb       not null,
  ai_summary        text,                   -- nullable
  created_at        timestamptz not null default now()
);

-- Enable RLS (Service role only, no client policies)
alter table public.interview_reports  enable row level security;
alter table public.team_contributions enable row level security;

-- ====================================================================
-- 3. Seed Users & Candidate Profiles for Testing
-- ====================================================================

-- Candidate A (Main test user, already in users)
insert into public.candidate_profiles (user_id, github_username, talent_profile, talent_score, github_data)
values (
  '0ee73e0e-0529-4480-a16c-15748a277bde',
  'alexrivera-dev',
  '{"resume":{"title":"Senior Full Stack Engineer","skills":["React","Next.js","TypeScript","Node.js","Supabase","Python"],"experience":[{"company":"TechSpark","role":"Senior Developer","description":"3+ years building Next.js & Supabase apps"}]},"github":{"topLanguages":{"TypeScript":85,"Python":15},"repositories":[{"name":"next-ai-recruiter","description":"AI candidate scoring & vector engine"}]},"manual":{"hackathons":[{"title":"Global AI Hackathon 2025","award":"1st Place Winner"}]}}'::jsonb,
  '{"overallScore":92,"breakdown":{"codeQuality":95,"skillFit":90}}'::jsonb,
  '{"repositories":[{"name":"next-ai-recruiter","description":"AI candidate scoring and vector matching engine","primary_language":"TypeScript","stars":12,"is_fork":false},{"name":"react-dashboard-ui","description":"Component library and dashboard built with React","primary_language":"TypeScript","stars":8,"is_fork":false},{"name":"supabase-rls-helper","description":"Utilities for Supabase Row Level Security policies","primary_language":"TypeScript","stars":6,"is_fork":false},{"name":"py-ml-pipeline","description":"Python ML data pipeline with scikit-learn","primary_language":"Python","stars":5,"is_fork":false},{"name":"ts-fork-experiment","description":"Forked TypeScript experiment","primary_language":"TypeScript","stars":0,"is_fork":true}],"languages":{"TypeScript":0.72,"Python":0.23,"Shell":0.05},"commits":{"total_last_12_months":163,"by_repository":{"next-ai-recruiter":82,"react-dashboard-ui":48,"supabase-rls-helper":20,"py-ml-pipeline":13},"active_months":["2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09","2025-10"]},"pull_requests":{"opened":31,"merged":24},"top_5_repos_by_stars":[{"name":"next-ai-recruiter","stars":12},{"name":"react-dashboard-ui","stars":8},{"name":"supabase-rls-helper","stars":6},{"name":"py-ml-pipeline","stars":5}]}'::jsonb
)
on conflict (user_id) do update
set github_username = excluded.github_username,
    talent_profile = excluded.talent_profile,
    talent_score = excluded.talent_score,
    github_data = excluded.github_data;

-- Candidate B (Mock team member)
insert into public.users (id, email, role)
values ('1ee73e0e-0529-4480-a16c-15748a277bdf', 'candidate-b@hirespark.com', 'candidate')
on conflict (id) do nothing;

insert into public.candidate_profiles (user_id, github_username, talent_profile, talent_score, github_data)
values (
  '1ee73e0e-0529-4480-a16c-15748a277bdf',
  'dev-b',
  '{"resume":{"title":"Python Backend Engineer","skills":["Python","FastAPI","PostgreSQL"],"experience":[]}}'::jsonb,
  '{"overallScore":75,"breakdown":{"codeQuality":70,"skillFit":80}}'::jsonb,
  '{"repositories":[{"name":"python-scraper","description":"Async web scraper","primary_language":"Python","stars":2,"is_fork":false}],"languages":{"Python":1.0},"commits":{"total_last_12_months":45,"by_repository":{"python-scraper":45},"active_months":["2025-08","2025-09"]},"pull_requests":{"opened":10,"merged":8},"top_5_repos_by_stars":[{"name":"python-scraper","stars":2}]}'::jsonb
)
on conflict (user_id) do nothing;

-- Candidate C (Mock team member)
insert into public.users (id, email, role)
values ('2ee73e0e-0529-4480-a16c-15748a277be0', 'candidate-c@hirespark.com', 'candidate')
on conflict (id) do nothing;

insert into public.candidate_profiles (user_id, github_username, talent_profile, talent_score, github_data)
values (
  '2ee73e0e-0529-4480-a16c-15748a277be0',
  'dev-c',
  '{"resume":{"title":"Junior UI Designer","skills":["HTML","CSS","JavaScript"],"experience":[]}}'::jsonb,
  '{"overallScore":60,"breakdown":{"codeQuality":55,"skillFit":65}}'::jsonb,
  '{"repositories":[{"name":"doc-parser","description":"Simple doc parser","primary_language":"JavaScript","stars":0,"is_fork":false}],"languages":{"JavaScript":1.0},"commits":{"total_last_12_months":12,"by_repository":{"doc-parser":12},"active_months":["2025-10"]},"pull_requests":{"opened":2,"merged":2},"top_5_repos_by_stars":[]}'::jsonb
)
on conflict (user_id) do nothing;
