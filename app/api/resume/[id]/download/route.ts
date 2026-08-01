import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import { renderModernHTML, renderMinimalHTML } from "@/lib/resume/templates";
import { inMemoryResumeStore } from "@/lib/resume/resumeService";

/**
 * GET /api/resume/[id]/download
 *
 * Renders the generated resume into a print-optimized HTML template
 * and appends an auto-print script triggering a clean system print/save dialogue.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Resume ID is required." },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdmin();

    // Fetch resume (DB or fallback memory store)
    let resume: any = null;
    try {
      const { data, error } = await adminClient
        .from("resumes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        resume = data;
      }
    } catch (e) {
      // Ignore DB fetch error
    }

    if (!resume) {
      const mem = inMemoryResumeStore.get(id);
      if (mem) {
        resume = mem;
      }
    }

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found in database." },
        { status: 404 }
      );
    }

    const resumeJson: any = resume.resume_json;
    const templateName = resume.template_name;

    // Render Markup server-side
    let templateMarkup = "";
    if (templateName === "Minimal") {
      templateMarkup = renderMinimalHTML(resumeJson);
    } else {
      templateMarkup = renderModernHTML(resumeJson);
    }

    // Build standalone self-contained print page
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${resumeJson.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body {
        background-color: white !important;
        color: black !important;
      }
      .no-print {
        display: none !important;
      }
      @page {
        size: letter;
        margin: 0.5in;
      }
      div {
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body class="bg-slate-100 min-h-screen flex flex-col items-center py-8 print:py-0 print:bg-white selection:bg-indigo-600 selection:text-white">
  <!-- Interactive Print Helper Controls -->
  <div class="no-print mb-6 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg flex gap-4 items-center">
    <span class="text-sm font-semibold">Print Preview (${templateName} Template)</span>
    <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded transition cursor-pointer">
      Save / Print to PDF
    </button>
  </div>

  <!-- Template container -->
  <div class="print:m-0">
    ${templateMarkup}
  </div>

  <script>
    // Trigger print dialogue automatically on load after 1s delay unless in preview mode
    if (!window.location.search.includes('preview=true')) {
      window.onload = () => {
        setTimeout(() => {
          window.print();
        }, 1000);
      };
    }
  </script>
</body>
</html>
    `;

    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("[GET /api/resume/[id]/download] Error:", err?.message);
    return NextResponse.json(
      { error: "Failed to load and render print resume." },
      { status: 500 }
    );
  }
}
