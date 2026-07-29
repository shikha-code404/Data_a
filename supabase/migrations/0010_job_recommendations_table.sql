-- supabase/migrations/0010_job_recommendations_table.sql

create table if not exists public.job_recommendations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  candidate_id uuid not null,
  match_percentage integer not null,
  breakdown jsonb not null,
  created_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

alter table public.job_recommendations enable row level security;

create policy "Allow public read on job_recommendations"
  on public.job_recommendations for select using (true);

create policy "Allow service_role full control on job_recommendations"
  on public.job_recommendations for all using (true);
