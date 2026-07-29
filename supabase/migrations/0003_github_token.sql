-- supabase/migrations/0003_github_token.sql
alter table public.candidate_profiles 
add column if not exists github_access_token text;
