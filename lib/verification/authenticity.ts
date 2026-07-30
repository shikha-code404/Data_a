import { getSupabaseAdmin } from "../db/client";
import { runFraudChecks } from "./fraud";
import { callAgent } from "../agents/callAgent";

export interface AuthenticityFlag {
  type: string;
  severity: "low" | "medium" | "high";
  evidence: string;
}

export interface CombinedAuthenticityReport {
  candidate_id: string;
  authenticity_score: number;
  risk_level: "low" | "medium" | "high";
  flags: AuthenticityFlag[];
  generated_at: string;
}

/**
 * Runs Content Originality Checks (Prompt 19)
 */
export async function runContentOriginalityChecks(candidateId: string): Promise<{
  originality_score: number;
  risk_level: "low" | "medium" | "high";
  flags: AuthenticityFlag[];
}> {
  const supabase = getSupabaseAdmin();

  // 1. Fetch Candidate Profile (verify existence)
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("talent_profile")
    .eq("user_id", candidateId)
    .maybeSingle();

  const talentProfile = profile?.talent_profile || {};

  // 2. Fetch latest pitch deck analysis
  const { data: pitchRow } = await supabase
    .from("pitch_analyses")
    .select("summary, scores, improvement_suggestions, ppt_url")
    .eq("team_id_or_candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Fetch latest interview report
  const { data: interviewRow } = await supabase
    .from("interview_reports")
    .select("answers, report")
    .eq("candidate_id", candidateId)
    .maybeSingle();

  // If no data exists to check, return default clean report
  if (!pitchRow && !interviewRow) {
    return {
      originality_score: 100,
      risk_level: "low",
      flags: []
    };
  }

  // Construct context for the AI agent
  const slidesTextEvidence = pitchRow
    ? `Pitch Deck URL/Preset: ${pitchRow.ppt_url}. Summary: ${pitchRow.summary}. Scores: ${JSON.stringify(pitchRow.scores)}.`
    : "";

  const payload = {
    slides_text: slidesTextEvidence,
    interview_qa: interviewRow?.answers || {},
    talent_profile: talentProfile
  };

  try {
    console.log(`[Authenticity] Invoking content_originality_analyzer for candidate: ${candidateId}...`);
    const agentResponse = (await callAgent("content_originality_analyzer", payload)) as any;

    const originalityScore = typeof agentResponse?.originality_score === "number"
      ? Math.min(100, Math.max(0, agentResponse.originality_score))
      : 100;
    const riskLevel = ["low", "medium", "high"].includes(agentResponse?.risk_level)
      ? agentResponse.risk_level
      : "low";
    const flags = Array.isArray(agentResponse?.flags) ? agentResponse.flags : [];

    return {
      originality_score: originalityScore,
      risk_level: riskLevel,
      flags: flags.map((f: any) => ({
        type: typeof f?.type === "string" ? f.type : "style-consistency",
        severity: ["low", "medium", "high"].includes(f?.severity) ? f.severity : "low",
        evidence: typeof f?.evidence === "string" ? f.evidence : "Identified suspicious pattern."
      }))
    };
  } catch (err: any) {
    console.warn(`[Authenticity] content_originality_analyzer agent failed: ${err.message}. Using fallback.`, err);
    return {
      originality_score: 90,
      risk_level: "low",
      flags: [
        {
          type: "style-consistency",
          severity: "low",
          evidence: "Originality analyzer failed or timed out; defaulting to a manual review flag."
        }
      ]
    };
  }
}

/**
 * Combines Prompt 19 (content originality) and Prompt 20 (fraud checks) outputs
 * using the custom weighting logic to compute a single per-candidate report.
 */
export async function getOrComputeAuthenticityScore(
  candidateId: string,
  forceFresh = false
): Promise<CombinedAuthenticityReport> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  const supabase = getSupabaseAdmin();

  // 1. Check for cached result less than 24 hours old
  if (!forceFresh) {
    const { data: cached, error: cacheErr } = await supabase
      .from("authenticity_scores")
      .select("*")
      .eq("candidate_id", candidateId)
      .maybeSingle();

    if (cacheErr) {
      console.warn(`[Authenticity] Error checking cache: ${cacheErr.message}`);
    }

    if (cached) {
      const createdAt = new Date(cached.created_at);
      const now = new Date();
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        console.log(`[Authenticity] Cache HIT for candidate ${candidateId}. Age: ${diffInHours.toFixed(1)} hours.`);
        return {
          candidate_id: cached.candidate_id,
          authenticity_score: cached.score,
          risk_level: cached.risk_level as "low" | "medium" | "high",
          flags: cached.flags as AuthenticityFlag[],
          generated_at: new Date(cached.created_at).toISOString()
        };
      }
    }
  }

  console.log(`[Authenticity] Cache MISS/Stale/ForceFresh. Running checks for candidate ${candidateId}...`);

  // 2. Run both checks in parallel
  const [fraudReport, originalityReport] = await Promise.all([
    runFraudChecks(candidateId),
    runContentOriginalityChecks(candidateId)
  ]);

  // 3. Combine flags and apply custom weighting
  let baseScore = 100;
  const combinedFlags: AuthenticityFlag[] = [];

  // A. Duplicate Profile Risk (Weight: 40%)
  if (fraudReport.duplicate_matches && fraudReport.duplicate_matches.length > 0) {
    baseScore -= 50;
    combinedFlags.push({
      type: "duplicate_profile",
      severity: "high",
      evidence: `Profile similarity matching other candidates: ${fraudReport.duplicate_matches
        .map((m) => `${m.candidate_id.substring(0, 8)} (${Math.round(m.similarity_score * 100)}%)`)
        .join(", ")}.`
    });
  }

  // B. Resume-vs-GitHub Mismatch (Weight: 30%)
  if (fraudReport.resume_github_mismatches && fraudReport.resume_github_mismatches.length > 0) {
    for (const mismatch of fraudReport.resume_github_mismatches) {
      const skillLower = (mismatch.skill || "").toLowerCase();
      const isStandardLang = [
        "typescript", "javascript", "python", "go", "ruby", "java", "c++", "c#",
        "rust", "php", "html", "css", "sql", "shell", "swift", "kotlin", "c"
      ].includes(skillLower);

      const deduction = isStandardLang ? 15 : 10;
      baseScore -= deduction;

      combinedFlags.push({
        type: "resume_github_mismatch",
        severity: isStandardLang ? "high" : "medium",
        evidence: `Skill '${mismatch.skill}' claimed on resume is absent from GitHub profile: ${mismatch.evidence}`
      });
    }
  }

  // C. Fake Certificate Flags (Weight: 15%)
  if (fraudReport.certificate_flags && fraudReport.certificate_flags.length > 0) {
    for (const cert of fraudReport.certificate_flags) {
      const isPlaceholder = /placeholder|test|fake|123456/i.test(cert.certification_name || "") ||
        /placeholder|test|fake|123456/i.test(cert.issuer || "");
      const deduction = isPlaceholder ? 15 : 10;
      baseScore -= deduction;

      combinedFlags.push({
        type: "suspicious_certificate",
        severity: isPlaceholder ? "high" : "medium",
        evidence: `Suspicious certification '${cert.certification_name}' by '${cert.issuer}': ${cert.evidence}`
      });
    }
  }

  // D. Content Originality Concerns (Weight: 15%)
  if (originalityReport.flags && originalityReport.flags.length > 0) {
    for (const origFlag of originalityReport.flags) {
      let deduction = 5; // Default for low/ambiguous
      if (origFlag.severity === "high") {
        deduction = 20;
      } else if (origFlag.severity === "medium") {
        deduction = 10;
      }
      baseScore -= deduction;

      combinedFlags.push({
        type: origFlag.type,
        severity: origFlag.severity,
        evidence: `Content originality concern: ${origFlag.evidence}`
      });
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, baseScore));

  // Determine Overall Risk Level
  let finalRiskLevel: "low" | "medium" | "high" = "low";
  if (finalScore < 50 || combinedFlags.some((f) => f.severity === "high")) {
    finalRiskLevel = "high";
  } else if (finalScore < 80) {
    finalRiskLevel = "medium";
  }

  const generatedAt = new Date().toISOString();

  // 4. Save to authenticity_scores table
  console.log(`[Authenticity] Saving combined authenticity score for candidate ${candidateId}...`);
  const { error: saveErr } = await supabase
    .from("authenticity_scores")
    .upsert({
      candidate_id: candidateId,
      score: finalScore,
      risk_level: finalRiskLevel,
      flags: combinedFlags,
      created_at: generatedAt
    }, {
      onConflict: "candidate_id"
    });

  if (saveErr) {
    console.warn(`[Authenticity] Failed to save authenticity report: ${saveErr.message}`);
  }

  return {
    candidate_id: candidateId,
    authenticity_score: finalScore,
    risk_level: finalRiskLevel,
    flags: combinedFlags,
    generated_at: generatedAt
  };
}
