-- supabase/migrations/0014_pitch_analyzer.sql
-- Create pitch_analyses table to store analyzed slides context

create table if not exists public.pitch_analyses (
  id uuid primary key default gen_random_uuid(),
  team_id_or_candidate_id text not null,
  ppt_url text not null,
  scores jsonb not null,
  summary text not null,
  improvement_suggestions jsonb not null,
  created_at timestamptz not null default now(),
  needs_review boolean not null default false,
  evaluation_method text
);

-- Enable RLS (Service role only, as per prior project conventions)
alter table public.pitch_analyses enable row level security;
