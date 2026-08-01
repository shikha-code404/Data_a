-- Migration: Create missing tables and add FK constraints
-- Tables: pipeline_stages, hackathons, hackathon_teams, hackathon_members
-- FK fixes: job_recommendations

-- 1. Pipeline Stages
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL,
  job_id uuid NOT NULL,
  stage text NOT NULL DEFAULT 'Sourced',
  recruiter_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- 2. Hackathons
CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date timestamptz,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Hackathon Teams
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Hackathon Members
CREATE TABLE IF NOT EXISTS public.hackathon_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Add FK constraints to job_recommendations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_job_recommendations_job') THEN
    ALTER TABLE public.job_recommendations ADD CONSTRAINT fk_job_recommendations_job FOREIGN KEY (job_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_job_recommendations_candidate') THEN
    ALTER TABLE public.job_recommendations ADD CONSTRAINT fk_job_recommendations_candidate FOREIGN KEY (candidate_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Enable RLS
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_members ENABLE ROW LEVEL SECURITY;

-- 7. Dev policies
CREATE POLICY "Allow full access on pipeline_stages" ON public.pipeline_stages FOR ALL USING (true);
CREATE POLICY "Allow full access on hackathons" ON public.hackathons FOR ALL USING (true);
CREATE POLICY "Allow full access on hackathon_teams" ON public.hackathon_teams FOR ALL USING (true);
CREATE POLICY "Allow full access on hackathon_members" ON public.hackathon_members FOR ALL USING (true);
