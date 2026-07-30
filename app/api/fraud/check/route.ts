import { NextResponse } from "next/server";
import { runFraudChecks } from "@/lib/verification/fraud";

export async function POST(req: Request) {
  try {
    const { candidate_id } = await req.json();

    if (!candidate_id) {
      return NextResponse.json(
        { success: false, error: "candidate_id is required." },
        { status: 400 }
      );
    }

    const report = await runFraudChecks(candidate_id);

    return NextResponse.json({
      success: true,
      message: "Fraud checks executed and recorded successfully!",
      report,
    });
  } catch (err: any) {
    console.error("API POST /api/fraud/check failed:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 } // Return 400 for verification/existential failures
    );
  }
}
