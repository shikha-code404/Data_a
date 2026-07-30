-- supabase/migrations/0018_resume_builder.sql
-- Create resumes table for template-specific candidate resumes

CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidate_profiles(user_id) ON DELETE CASCADE,
  template_name text NOT NULL,
  resume_json jsonb NOT NULL,
  pdf_url text,
  needs_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Disable RLS
ALTER TABLE public.resumes DISABLE ROW LEVEL SECURITY;
