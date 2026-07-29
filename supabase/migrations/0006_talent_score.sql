-- supabase/migrations/0006_talent_score.sql
alter table public.candidate_profiles 
add column if not exists talent_score jsonb;
