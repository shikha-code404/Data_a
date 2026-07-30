-- supabase/migrations/0017_career_guidance.sql
-- Add career roadmap and salary estimate fields to candidate_profiles

ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS career_roadmap jsonb,
ADD COLUMN IF NOT EXISTS salary_estimate jsonb,
ADD COLUMN IF NOT EXISTS career_roadmap_needs_review boolean NOT NULL DEFAULT false;
