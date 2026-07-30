-- supabase/migrations/0015_fraud_detection.sql
-- Create fraud_checks table for candidate profile fraud analysis

create table if not exists public.fraud_checks (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.users(id) on delete cascade,
  duplicate_matches jsonb not null default '[]'::jsonb,
  resume_github_mismatches jsonb not null default '[]'::jsonb,
  certificate_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS (Service role only, as per prior project conventions)
alter table public.fraud_checks enable row level security;
