-- supabase/migrations/0016_authenticity_score.sql
-- Create authenticity_scores table for storing combined candidate authenticity score and fraud reports

create table if not exists public.authenticity_scores (
  candidate_id uuid primary key references public.users(id) on delete cascade,
  score integer not null,
  risk_level text not null,
  flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS (Service role only, as per prior project conventions)
alter table public.authenticity_scores enable row level security;
