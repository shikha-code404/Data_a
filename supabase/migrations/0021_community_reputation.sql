-- supabase/migrations/0021_community_reputation.sql
-- Add community_reputation JSONB column to public.candidate_profiles

ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS community_reputation JSONB;
