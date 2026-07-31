-- supabase/migrations/0020_enable_rls_policies.sql
-- Enable Row Level Security (RLS) on the target tables

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authenticity_scores ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies for candidate_profiles
DROP POLICY IF EXISTS "Allow public full access on candidate_profiles" ON public.candidate_profiles;

-- ==========================================
-- 1. Candidate-Scoped RLS Policies (Select/Update Own Row)
-- ==========================================

-- candidate_profiles: select and update only own profile
CREATE POLICY "candidate_select_own_profile" ON public.candidate_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "candidate_update_own_profile" ON public.candidate_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- skill_verifications: select and update only own verifications
CREATE POLICY "candidate_select_own_verifications" ON public.skill_verifications
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());

CREATE POLICY "candidate_update_own_verifications" ON public.skill_verifications
  FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

-- interview_reports: select and update only own interview reports
CREATE POLICY "candidate_select_own_interviews" ON public.interview_reports
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());

CREATE POLICY "candidate_update_own_interviews" ON public.interview_reports
  FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

-- fraud_checks: select and update only own fraud checks
CREATE POLICY "candidate_select_own_fraud" ON public.fraud_checks
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());

CREATE POLICY "candidate_update_own_fraud" ON public.fraud_checks
  FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());

-- authenticity_scores: select and update only own authenticity scores
CREATE POLICY "candidate_select_own_authenticity" ON public.authenticity_scores
  FOR SELECT TO authenticated USING (candidate_id = auth.uid());

CREATE POLICY "candidate_update_own_authenticity" ON public.authenticity_scores
  FOR UPDATE TO authenticated USING (candidate_id = auth.uid()) WITH CHECK (candidate_id = auth.uid());


-- ==========================================
-- 2. Recruiter-Scoped RLS Policies (Select Scoped Candidate Rows)
-- ==========================================

-- Recruiters can read skill_verifications only for candidates who matched/applied to their job postings
CREATE POLICY "recruiter_select_candidate_verifications" ON public.skill_verifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_recommendations jr
      JOIN public.job_postings jp ON jr.job_id = jp.id
      WHERE jr.candidate_id = public.skill_verifications.candidate_id
        AND jp.recruiter_id = auth.uid()
    )
  );

-- Recruiters can read interview_reports only for candidates who matched/applied to their job postings
CREATE POLICY "recruiter_select_candidate_interviews" ON public.interview_reports
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_recommendations jr
      JOIN public.job_postings jp ON jr.job_id = jp.id
      WHERE jr.candidate_id = public.interview_reports.candidate_id
        AND jp.recruiter_id = auth.uid()
    )
  );

-- Recruiters can read fraud_checks only for candidates who matched/applied to their job postings
CREATE POLICY "recruiter_select_candidate_fraud" ON public.fraud_checks
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_recommendations jr
      JOIN public.job_postings jp ON jr.job_id = jp.id
      WHERE jr.candidate_id = public.fraud_checks.candidate_id
        AND jp.recruiter_id = auth.uid()
    )
  );

-- Recruiters can read authenticity_scores only for candidates who matched/applied to their job postings
CREATE POLICY "recruiter_select_candidate_authenticity" ON public.authenticity_scores
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.job_recommendations jr
      JOIN public.job_postings jp ON jr.job_id = jp.id
      WHERE jr.candidate_id = public.authenticity_scores.candidate_id
        AND jp.recruiter_id = auth.uid()
    )
  );
