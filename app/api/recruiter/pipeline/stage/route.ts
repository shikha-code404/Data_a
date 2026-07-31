import { NextResponse } from "next/server";
import { createServerDbClient } from "@/lib/db/serverClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidate_id, job_id, stage } = body;

    if (!candidate_id || !job_id || !stage) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: candidate_id, job_id, stage" },
        { status: 400 }
      );
    }

    const supabase = await createServerDbClient();

    // Check if there is an existing pipeline_stages entry
    const { data: existing, error: findError } = await supabase
      .from("pipeline_stages")
      .select("id")
      .eq("job_id", job_id)
      .eq("candidate_id", candidate_id)
      .maybeSingle();

    if (findError) {
      throw new Error(`Database error finding stage: ${findError.message}`);
    }

    let saveResult;
    if (existing) {
      saveResult = await supabase
        .from("pipeline_stages")
        .update({
          stage,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select("*")
        .single();
    } else {
      saveResult = await supabase
        .from("pipeline_stages")
        .insert({
          candidate_id,
          job_id,
          stage,
          updated_at: new Date().toISOString()
        })
        .select("*")
        .single();
    }

    if (saveResult.error) {
      throw new Error(`Failed to update pipeline stage: ${saveResult.error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: saveResult.data
    });
  } catch (err: any) {
    console.error("API POST /api/recruiter/pipeline/stage failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
