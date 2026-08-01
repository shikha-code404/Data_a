-- supabase/full_schema.sql
-- Combined Migration Script for HireSpark Clone

-- Enable Vector and UUID extensions
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- 1. Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('candidate', 'recruiter', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Agent Responses Table (Cache)
create table if not exists public.agent_responses (
  id uuid primary key default gen_random_uuid(),
  agent_type text not null,
  input_hash text not null,
  input_payload jsonb not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  unique (agent_type, input_hash)
);

-- 3. Candidate Profiles Table
create table if not exists public.candidate_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  github_username text,
  github_access_token text,
  github_data jsonb,
  resume_data jsonb,
  resume_needs_review boolean not null default false,
  talent_profile jsonb,
  talent_score jsonb,
  skill_badges jsonb,
  embedding vector(384),
  embedding_text text,
  embedding_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

-- 4. GitHub API Cache Table
create table if not exists public.github_api_cache (
  key text primary key,
  response jsonb not null,
  created_at timestamptz not null default now()
);

-- 5. Job Postings Table
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references public.users(id) on delete cascade,
  title text not null,
  company text not null,
  description text not null,
  requirements jsonb default '[]'::jsonb,
  skills_required text[] default '{}'::text[],
  min_experience_years integer default 0,
  location text default 'Remote',
  salary_range text,
  embedding vector(384),
  embedding_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Candidate Embeddings Table
create table if not exists public.candidate_embeddings (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

-- 7. Job Embeddings Table
create table if not exists public.job_embeddings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

-- 8. Job Recommendations Table
create table if not exists public.job_recommendations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  candidate_id uuid not null,
  match_percentage integer not null,
  breakdown jsonb not null,
  created_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

-- 9. Pipeline Stages Table
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null,
  job_id uuid not null,
  stage text not null default 'Sourced',
  recruiter_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(candidate_id, job_id)
);

-- 10. Hackathons Table
create table if not exists public.hackathons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamptz,
  description text,
  created_at timestamptz not null default now()
);

-- 11. Hackathon Teams Table
create table if not exists public.hackathon_teams (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  team_name text not null,
  created_at timestamptz not null default now()
);

-- 12. Hackathon Members Table
create table if not exists public.hackathon_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.hackathon_teams(id) on delete cascade,
  candidate_id uuid not null,
  created_at timestamptz not null default now()
);

-- Add FK constraints to job_recommendations
do $$
begin
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_job_recommendations_job') then
    alter table public.job_recommendations add constraint fk_job_recommendations_job foreign key (job_id) references public.job_postings(id) on delete cascade;
  end if;
  if not exists (select 1 from information_schema.table_constraints where constraint_name = 'fk_job_recommendations_candidate') then
    alter table public.job_recommendations add constraint fk_job_recommendations_candidate foreign key (candidate_id) references public.users(id) on delete cascade;
  end if;
end $$;

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.agent_responses enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.job_postings enable row level security;
alter table public.candidate_embeddings enable row level security;
alter table public.job_embeddings enable row level security;
alter table public.job_recommendations enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.hackathons enable row level security;
alter table public.hackathon_teams enable row level security;
alter table public.hackathon_members enable row level security;

-- Permissive RLS Policies for Development
create policy "Allow public full access on users" on public.users for all using (true);
create policy "Allow public full access on agent_responses" on public.agent_responses for all using (true);
create policy "Allow public full access on candidate_profiles" on public.candidate_profiles for all using (true);
create policy "Allow public full access on job_postings" on public.job_postings for all using (true);
create policy "Allow public full access on candidate_embeddings" on public.candidate_embeddings for all using (true);
create policy "Allow public full access on job_embeddings" on public.job_embeddings for all using (true);
create policy "Allow public full access on job_recommendations" on public.job_recommendations for all using (true);
create policy "Allow full access on pipeline_stages" on public.pipeline_stages for all using (true);
create policy "Allow full access on hackathons" on public.hackathons for all using (true);
create policy "Allow full access on hackathon_teams" on public.hackathon_teams for all using (true);
create policy "Allow full access on hackathon_members" on public.hackathon_members for all using (true);

-- HNSW Vector Indexes
create index if not exists candidate_embeddings_hnsw_idx 
  on public.candidate_embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists job_embeddings_hnsw_idx 
  on public.job_embeddings using hnsw (embedding vector_cosine_ops);

-- Seed Default Test User & Candidate Profile
insert into public.users (id, email, role)
values ('0ee73e0e-0529-4480-a16c-15748a277bde', 'candidate@hirespark.com', 'candidate')
on conflict (id) do nothing;

insert into public.candidate_profiles (user_id, github_username, talent_profile, talent_score)
values (
  '0ee73e0e-0529-4480-a16c-15748a277bde',
  'shikha-singh',
  '{"resume": {"title": "Senior Full Stack Engineer", "skills": ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "Python"], "experience": [{"company": "TechSpark", "role": "Senior Developer", "description": "3+ years building Next.js & Supabase apps"}]}, "github": {"topLanguages": {"TypeScript": 85, "Python": 15}, "repositories": [{"name": "next-ai-recruiter", "description": "AI candidate scoring & vector engine"}]}, "manual": {"hackathons": [{"title": "Global AI Hackathon 2025", "award": "1st Place Winner"}]}}'::jsonb,
  '{"overallScore": 92, "breakdown": {"codeQuality": 95, "skillFit": 90}}'::jsonb
)
on conflict (user_id) do nothing;
