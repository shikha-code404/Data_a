-- supabase/migrations/0007_skill_badges.sql
alter table public.candidate_profiles 
add column if not exists skill_badges jsonb;
