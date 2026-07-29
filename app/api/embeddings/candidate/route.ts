import { NextResponse } from "next/server";
import { generateCandidateEmbedding } from "@/lib/embeddings/generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required." },
        { status: 400 }
      );
    }

    const result = await generateCandidateEmbedding(userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("API /api/embeddings/candidate failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
