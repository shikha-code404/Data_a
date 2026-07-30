-- supabase/migrations/0011_phase2_rls_and_cleanup.sql

-- 1. Drop existing permissive policies for job_postings
DROP POLICY IF EXISTS "Allow public read on job_postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow recruiter full access on job_postings" ON public.job_postings;
DROP POLICY IF EXISTS "Allow public full access on job_postings" ON public.job_postings;

-- 2. Define role-scoped policies for job_postings
-- All authenticated users can read/select job postings
CREATE POLICY "Allow authenticated users to select job postings"
  ON public.job_postings
  FOR SELECT
  TO authenticated
  USING (true);

-- Recruiters can insert, update, and delete their own job postings
CREATE POLICY "Allow recruiters to insert job postings"
  ON public.job_postings
  FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Allow recruiters to update their own job postings"
  ON public.job_postings
  FOR UPDATE
  TO authenticated
  USING (recruiter_id = auth.uid())
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Allow recruiters to delete their own job postings"
  ON public.job_postings
  FOR DELETE
  TO authenticated
  USING (recruiter_id = auth.uid());

-- 3. Drop existing permissive policies for candidate_embeddings
DROP POLICY IF EXISTS "Allow public read on candidate_embeddings" ON public.candidate_embeddings;
DROP POLICY IF EXISTS "Allow service_role full control on candidate_embeddings" ON public.candidate_embeddings;
DROP POLICY IF EXISTS "Allow public full access on candidate_embeddings" ON public.candidate_embeddings;

-- 4. Drop existing permissive policies for job_embeddings
DROP POLICY IF EXISTS "Allow public read on job_embeddings" ON public.job_embeddings;
DROP POLICY IF EXISTS "Allow service_role full control on job_embeddings" ON public.job_embeddings;
DROP POLICY IF EXISTS "Allow public full access on job_embeddings" ON public.job_embeddings;

-- 5. Drop existing permissive policies for job_recommendations
DROP POLICY IF EXISTS "Allow public read on job_recommendations" ON public.job_recommendations;
DROP POLICY IF EXISTS "Allow service_role full control on job_recommendations" ON public.job_recommendations;
DROP POLICY IF EXISTS "Allow public full access on job_recommendations" ON public.job_recommendations;

-- NOTE: Since RLS remains enabled and no client policies are defined for candidate_embeddings, 
-- job_embeddings, and job_recommendations, these tables can only be accessed by the service_role key 
-- (which bypasses RLS).
