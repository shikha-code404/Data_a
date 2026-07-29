-- supabase/migrations/0008_phase2_vector_matching.sql

-- 1. Enable pgvector extension for dense vector similarity search
create extension if not exists vector;

-- 2. Add vector embedding columns to candidate_profiles (384 dimensions for all-MiniLM-L6-v2)
alter table public.candidate_profiles 
add column if not exists embedding vector(384),
add column if not exists embedding_text text,
add column if not exists embedding_updated_at timestamptz;

-- 3. Create job_postings table
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

-- Enable RLS on job_postings
alter table public.job_postings enable row level security;

create policy "Allow public read on job_postings"
  on public.job_postings for select using (true);

create policy "Allow recruiter full access on job_postings"
  on public.job_postings for all using (true);

-- 4. Cosine Similarity RPC Function for Candidate Search
create or replace function match_candidates (
  query_embedding vector(384),
  match_threshold float default 0.0,
  match_count int default 20
)
returns table (
  user_id uuid,
  github_username text,
  talent_profile jsonb,
  talent_score jsonb,
  similarity float
)
language sql stable
as $$
  select
    cp.user_id,
    cp.github_username,
    cp.talent_profile,
    cp.talent_score,
    1 - (cp.embedding <=> query_embedding) as similarity
  from public.candidate_profiles cp
  where cp.embedding is not null
    and 1 - (cp.embedding <=> query_embedding) > match_threshold
  order by cp.embedding <=> query_embedding
  limit match_count;
$$;
