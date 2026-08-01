import { NextResponse } from "next/server";
import { extractTextFromPDF, parseResumeAndSave } from "@/lib/resume/parser";
import { createServerDbClient } from "@/lib/db/serverClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Determine target user ID and verify session first
    const supabase = await createServerDbClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      console.warn("Unauthorized API call to candidate resume endpoint:", authError);
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }
    const userId = user.id;

    // 2. Extract text from PDF buffer
    let rawText = "";
    try {
      rawText = await extractTextFromPDF(buffer);
    } catch (pdfErr) {
      console.error("PDF text extraction failed:", pdfErr);
      return NextResponse.json(
        { success: false, error: "Could not extract text from this PDF — try a different file or format" },
        { status: 422 }
      );
    }

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from this PDF — try a different file or format" },
        { status: 422 }
      );
    }

    // 3. Run AI resume parser and update DB
    const parseResult = await parseResumeAndSave(rawText, userId);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error || "Failed to save parsed resume data to candidate profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resume PDF uploaded and parsed successfully!",
      parsed_resume: parseResult.data,
      needsReview: parseResult.needsReview,
      raw_text_length: rawText.length,
    });
  } catch (err: any) {
    console.error("API POST /api/candidate/resume failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
