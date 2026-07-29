import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import { generateJobEmbedding } from "@/lib/embeddings/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, title, company, description, skills_required, location, salary_range } = body;

    let targetJobId = jobId;

    // If no jobId provided, create a new job posting record first
    if (!targetJobId) {
      if (!title || !company || !description) {
        return NextResponse.json(
          { success: false, error: "title, company, and description are required to create a job posting." },
          { status: 400 }
        );
      }

      const adminClient = getSupabaseAdmin();
      const { data: newJob, error: createError } = await adminClient
        .from("job_postings")
        .insert({
          title,
          company,
          description,
          skills_required: Array.isArray(skills_required) ? skills_required : [],
          location: location || "Remote",
          salary_range: salary_range || "$120,000 - $160,000",
        })
        .select("id")
        .single();

      if (createError || !newJob) {
        throw new Error(`Failed to create job posting: ${createError?.message}`);
      }

      targetJobId = newJob.id;
    }

    const result = await generateJobEmbedding(targetJobId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("API /api/embeddings/job failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
