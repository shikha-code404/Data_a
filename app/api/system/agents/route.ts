import { NextResponse } from "next/server";

export interface SystemAgentDoc {
  name: string;
  purpose: string;
  input: string;
  output: string;
  trigger: string;
}

const SYSTEM_AGENTS: SystemAgentDoc[] = [
  {
    name: "Resume Parser Agent",
    purpose: "Extracts structured candidate JSON (education, experience, skills, contact) from unformatted PDF/raw text resumes using NLP models.",
    input: "raw_resume_text (string) or file_buffer (PDF/Docx)",
    output: "{ name: string, contact: { email, phone, location, github }, summary: string, experience: Array, education: Array, skills: Array }",
    trigger: "Triggered during candidate onboarding, PDF resume upload, or candidate profile update via POST /api/candidate/resume."
  },
  {
    name: "Talent Score Agent",
    purpose: "Calculates a holistic 0-100 talent score across 7 sub-score dimensions based on GitHub repository metrics, commit activity, resume history, and hackathon accomplishments.",
    input: "talent_profile: { resume: object, github: object, manual: object }",
    output: "{ overallScore: number (0-100), breakdown: { codeQuality, skillFit, githubActivity, experienceDepth, educationLevel, hackathonImpact, authenticityRating } }",
    trigger: "Triggered automatically after GitHub ingestion or resume parsing via calculateTalentScore()."
  },
  {
    name: "Recruiter Copilot Agent",
    purpose: "Translates recruiter natural language queries (e.g., 'Find React dev with 3+ yrs experience') into structured JSON candidate filter predicates.",
    input: "query (string), recruiter_id (UUID string)",
    output: "{ extracted_skills: string[], min_experience_years: number, role: string, reasoning: string }",
    trigger: "Triggered when recruiters search the candidate pool via POST /api/recruiter/search."
  },
  {
    name: "Career Guidance Agent",
    purpose: "Analyzes candidate skill gaps, verified badges, and talent scores to recommend targeted certifications and generate an actionable career roadmap.",
    input: "candidate_id (UUID string), force_fresh (boolean)",
    output: "{ career_roadmap: { skill_gaps: Array, recommended_certifications: Array, career_roadmap: Array, reasoning: string }, salary_estimate: { estimated_range: { min, max, currency }, basis: string } }",
    trigger: "Triggered when candidates request career recommendations via POST /api/career/guidance."
  },
  {
    name: "Resume Builder Agent",
    purpose: "Constructs an ATS-optimized, professionally formatted resume in Modern or Minimal template layout with print-ready HTML preview.",
    input: "candidate_id (UUID string), template (Modern | Minimal), force_fresh (boolean)",
    output: "{ success: boolean, resume_id: string, resume_json: { name, summary, experience, projects, skills }, needs_review: boolean }",
    trigger: "Triggered when candidates build ATS resumes via POST /api/resume/generate and download via GET /api/resume/[id]/download."
  },
  {
    name: "Fraud Detection Agent",
    purpose: "Scans profile vector embeddings, GitHub contribution histories, and pitch deck content to flag duplicate candidates, resume/repo mismatches, and fake certifications.",
    input: "candidate_id (UUID string), force_fresh (boolean)",
    output: "{ candidate_id: string, authenticity_score: number, risk_level: 'low' | 'medium' | 'high', flags: Array<{ type, severity, evidence }> }",
    trigger: "Triggered when candidate profiles are evaluated or audited via POST /api/fraud/check and POST /api/authenticity/score."
  },
  {
    name: "Skill Verification Agent",
    purpose: "Runs adaptive MCQ assessments, LLM free-response evaluations, and deterministic GitHub repo analysis to compute a composite 0-100 verified skill score.",
    input: "candidate_id (UUID string), skill (string), mcq_answers (string[]), free_response_answer (string)",
    output: "{ candidate_id: string, skill: string, mcq_score: number, free_response_score: number, repo_quality_score: number, weighted_score: number, verified: boolean }",
    trigger: "Triggered when candidates complete skill assessments via POST /api/verification/run and POST /api/interview/submit."
  },
  {
    name: "Job Matching Agent",
    purpose: "Calculates 384-dimensional pgvector cosine similarity between candidate embeddings and job requirement vectors, generating human-readable match explanations.",
    input: "job_id (UUID string), candidate_id (UUID string)",
    output: "{ job_id: string, candidate_id: string, match_percentage: number, breakdown: { skillFit: number, experienceMatch: number, summary: string } }",
    trigger: "Triggered during candidate job browsing or recruiter candidate matching via POST /api/matching/run."
  }
];

/**
 * GET /api/system/agents
 *
 * Returns the architecture documentation layer for all 8 core AI agent modules in the system.
 */
export async function GET() {
  return NextResponse.json(SYSTEM_AGENTS, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
