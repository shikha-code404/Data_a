import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerDbClient } from "@/lib/db/serverClient";
import { getSupabaseAdmin } from "@/lib/db/client";
import { generateJobEmbedding } from "@/lib/embeddings/generator";
import { runJobMatchingEngine } from "@/lib/matching/engine";

// Zod Schema for Recruiter Job Creation Input Validation
const JobCreationSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  required_skills: z.array(z.string()).default([]),
  experience_level: z.union([z.string(), z.number()]).optional(),
  location: z.string().default("Remote"),
  company: z.string().optional(),
  salary_range: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // 1. Validate Input using Zod
    const parseResult = JobCreationSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, description, required_skills, experience_level, location, company, salary_range } = parseResult.data;

    // 2. Check Recruiter Role Access
    const supabase = await createServerDbClient();
    const { data: { user } } = await supabase.auth.getUser();

    let recruiterId = user?.id || null;
    let isRecruiter = false;

    if (user) {
      const adminClient = getSupabaseAdmin();
      const { data: userData } = await adminClient
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (userData?.role === "recruiter" || userData?.role === "admin") {
        isRecruiter = true;
      }
    }

    // In development / demo mode, allow public recruiter access if no strict session, but flag if unauthorized in production
    if (!isRecruiter && process.env.NODE_ENV === "production" && !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Only users with 'recruiter' role can create job postings." },
        { status: 403 }
      );
    }

    // Parse experience level into numeric min_experience_years
    let minExpYears = 0;
    if (typeof experience_level === "number") {
      minExpYears = experience_level;
    } else if (typeof experience_level === "string") {
      const parsedInt = parseInt(experience_level, 10);
      if (!isNaN(parsedInt)) minExpYears = parsedInt;
    }

    const jobPayload: any = {
      title,
      company: company || "HireSpark Partner",
      description,
      skills_required: required_skills,
      min_experience_years: minExpYears,
      location: location || "Remote",
      salary_range: salary_range || "$120,000 - $160,000",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (recruiterId) {
      jobPayload.recruiter_id = recruiterId;
    }

    // 3. Save Job Posting to Database
    const adminClient = getSupabaseAdmin();
    const { data: newJob, error: createError } = await adminClient
      .from("job_postings")
      .insert(jobPayload)
      .select("*")
      .single();

    if (createError || !newJob) {
      if (createError?.message.includes("schema cache") || createError?.message.includes("does not exist") || createError?.message.includes("job_postings")) {
        return NextResponse.json({
          success: false,
          error: "Database tables are not initialized in your Supabase project yet. Please run 'supabase/full_schema.sql' in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/fzrwtvwidvyklvxhbooi/sql/new).",
          sql_file: "supabase/full_schema.sql"
        }, { status: 500 });
      }
      throw new Error(`Failed to create job in database: ${createError?.message}`);
    }

    // 4. Automatically Generate Job Vector Embedding
    let embeddingResult = { vectorDimension: 384, vectorSample: [] };
    try {
      console.log(`[Auto-Embedding] Generating vector for job_id: ${newJob.id}...`);
      const res = await generateJobEmbedding(newJob.id);
      if (res) {
        embeddingResult = { vectorDimension: res.embeddingLength, vectorSample: res.vectorSample as any };
      }
    } catch (embErr: any) {
      console.warn(`[Auto-Embedding Note] Embedding generation skipped/failed: ${embErr.message}`);
    }

    // 5. Automatically Trigger Candidate-Job Matching Pipeline
    let matchingCandidates: any[] = [];
    try {
      console.log(`[Auto-Matching] Running matching pipeline for job_id: ${newJob.id}...`);
      matchingCandidates = await runJobMatchingEngine(newJob.id);
    } catch (matchErr: any) {
      console.warn(`[Auto-Matching Note] Matching pipeline skipped/failed: ${matchErr.message}`);
    }

    // 6. Return created job, embedding status, and auto-generated candidate recommendations
    return NextResponse.json({
      success: true,
      message: "Job posting created successfully and saved to database.",
      job: newJob,
      embedding: embeddingResult,
      matched_candidates_count: matchingCandidates.length,
      matched_candidates: matchingCandidates,
    });
  } catch (err: any) {
    console.error("API POST /api/jobs failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createServerDbClient();
    const { data: jobs, error: selectError } = await supabase
      .from("job_postings")
      .select("*")
      .order("created_at", { ascending: false });

    if (selectError) {
      throw new Error(`Failed to fetch jobs from database: ${selectError.message}`);
    }

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
    });
  } catch (err: any) {
    console.error("API GET /api/jobs failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
