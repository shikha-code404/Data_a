-- supabase/migrations/0005_talent_profile.sql
alter table public.candidate_profiles 
add column if not exists talent_profile jsonb;
