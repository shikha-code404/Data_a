-- supabase/migrations/0004_pipelines_schema.sql

-- GitHub Columns and Caching
alter table public.candidate_profiles 
add column if not exists github_data jsonb;

create table if not exists public.github_api_cache (
  key text primary key,
  response jsonb not null,
  created_at timestamptz not null default now()
);

-- Resume Columns
alter table public.candidate_profiles
add column if not exists resume_data jsonb,
add column if not exists resume_needs_review boolean not null default false;
