-- supabase/migrations/0019_hackathon_leaderboard.sql
-- Create hackathon_results table

CREATE TABLE IF NOT EXISTS public.hackathon_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
  pitch_score numeric NOT NULL,
  contribution_summary jsonb NOT NULL,
  team_ranking integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hackathon_id, team_id)
);

-- Disable RLS
ALTER TABLE public.hackathon_results DISABLE ROW LEVEL SECURITY;
