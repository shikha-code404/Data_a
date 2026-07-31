import { getSupabaseAdmin } from "../db/client";
import { generateCandidateEmbedding } from "../embeddings/generator";
import { cosineSimilarity } from "../matching/engine";
import { MOCK_PROFILES } from "../db/mockProfiles";

export interface DuplicateMatch {
  candidate_id: string;
  similarity_score: number;
}

export interface Mismatch {
  skill: string;
  evidence: string;
  details: string;
}

export interface CertificateFlag {
  certification_name: string;
  issuer: string;
  reason: string;
  evidence: string;
  needs_manual_review: boolean;
}

export interface FraudReport {
  candidate_id: string;
  duplicate_matches: DuplicateMatch[];
  resume_github_mismatches: Mismatch[];
  certificate_flags: CertificateFlag[];
  created_at: string;
}

/**
 * Calculates Levenshtein distance between two strings
 */
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Main fraud checks executor
 */
export async function runFraudChecks(candidateId: string): Promise<FraudReport> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  const supabase = getSupabaseAdmin();

  // 1. Fetch Candidate Profile (verify existence, fallback to mock profiles if unconfigured DB)
  let profile: any = null;
  try {
    const { data, error: profileErr } = await supabase
      .from("candidate_profiles")
      .select("user_id, resume_data, github_data")
      .eq("user_id", candidateId)
      .maybeSingle();
    if (!profileErr && data) {
      profile = data;
    }
  } catch (e) {
    // Network/DB unconfigured error fallback
  }

  if (!profile) {
    profile = MOCK_PROFILES[candidateId];
  }

  if (!profile) {
    throw new Error(`Candidate profile not found in database for ID: ${candidateId}`);
  }

  const resumeData = (profile.resume_data as any) || {};
  const githubData = (profile.github_data as any) || {};

  // ==========================================
  // CHECK 1: Duplicate Profile Detection
  // ==========================================
  console.log(`[Fraud Checks] Running duplicate check for candidate: ${candidateId}...`);
  let targetEmbedding: number[] | null = null;

  // Retrieve candidate's own embedding
  const { data: embedRow, error: embedErr } = await supabase
    .from("candidate_embeddings")
    .select("embedding")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (embedErr) {
    console.warn(`Error fetching candidate embedding: ${embedErr.message}`);
  }

  if (embedRow && embedRow.embedding) {
    targetEmbedding = embedRow.embedding;
  } else {
    // Generate if missing
    try {
      console.log(`[Fraud Checks] Embedding missing for ${candidateId}. Generating...`);
      const genResult = await generateCandidateEmbedding(candidateId);
      targetEmbedding = genResult.embedding;
    } catch (e: any) {
      console.error(`Failed to generate candidate embedding: ${e.message}`);
    }
  }

  const duplicateMatches: DuplicateMatch[] = [];

  if (targetEmbedding) {
    // Fetch all other embeddings in the database
    const { data: allEmbeds, error: allEmbedsErr } = await supabase
      .from("candidate_embeddings")
      .select("candidate_id, embedding, created_at")
      .order("created_at", { ascending: false });

    if (allEmbedsErr) {
      console.warn(`Failed to fetch other embeddings: ${allEmbedsErr.message}`);
    } else if (allEmbeds) {
      // Group by candidate_id to only check the latest embedding per candidate
      const latestEmbeddingsMap = new Map<string, number[]>();
      for (const row of allEmbeds) {
        if (row.candidate_id !== candidateId && row.embedding && !latestEmbeddingsMap.has(row.candidate_id)) {
          latestEmbeddingsMap.set(row.candidate_id, row.embedding);
        }
      }

      // Compute similarities
      for (const [otherId, otherEmbed] of latestEmbeddingsMap.entries()) {
        const sim = cosineSimilarity(targetEmbedding, otherEmbed);
        if (sim >= 0.95) {
          duplicateMatches.push({
            candidate_id: otherId,
            similarity_score: Math.round(sim * 100) / 100, // round to 2 decimal places
          });
        }
      }
    }
  }

  // ==========================================
  // CHECK 2: Resume-vs-GitHub Mismatch
  // ==========================================
  console.log(`[Fraud Checks] Running resume-vs-github mismatch check for candidate: ${candidateId}...`);
  const resumeGithubMismatches: Mismatch[] = [];
  const skills: string[] = Array.isArray(resumeData.skills) ? resumeData.skills : [];
  const githubLanguages = githubData.languages || {};
  const githubRepos: any[] = Array.isArray(githubData.repositories) ? githubData.repositories : [];

  const STANDARD_LANGUAGES = [
    "typescript", "javascript", "python", "go", "ruby", "java", "c++", "c#", 
    "rust", "php", "html", "css", "sql", "shell", "swift", "kotlin", "c"
  ];

  for (const skill of skills) {
    if (!skill || typeof skill !== "string") continue;
    const skillLower = skill.trim().toLowerCase();

    // Check if skill is a standard language
    const isStandardLang = STANDARD_LANGUAGES.includes(skillLower);

    // 1. Cross-check against GitHub Languages
    const hasLanguageMatch = Object.keys(githubLanguages).some((lang) => {
      const langLower = lang.toLowerCase();
      return langLower.includes(skillLower) || skillLower.includes(langLower);
    });

    // 2. Cross-check against repositories (name, description, or primary language)
    const matchingRepos = githubRepos.filter((repo) => {
      const name = (repo.name || "").toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      const lang = (repo.primary_language || "").toLowerCase();
      return (
        name.includes(skillLower) ||
        desc.includes(skillLower) ||
        lang.includes(skillLower) ||
        (skillLower === "next.js" && (name.includes("next") || desc.includes("next"))) ||
        (skillLower === "node.js" && (name.includes("node") || desc.includes("node"))) ||
        (skillLower === "react" && (name.includes("react") || desc.includes("react"))) ||
        (skillLower === "supabase" && (name.includes("supabase") || desc.includes("supabase")))
      );
    });

    // Flag mismatch if the skill is claimed but completely absent from languages and repositories
    if (!hasLanguageMatch && matchingRepos.length === 0) {
      const type = isStandardLang ? "Programming Language" : "Technology/Framework";
      resumeGithubMismatches.push({
        skill,
        evidence: `No primary language usage or repositories matching '${skill}' found in GitHub account.`,
        details: `Claimed skill '${skill}' categorized as ${type} could not be validated against github_data.languages keys [${Object.keys(githubLanguages).join(", ")}] or any repository names/descriptions.`,
      });
    }
  }

  // ==========================================
  // CHECK 3: Fake Certificate Heuristic
  // ==========================================
  console.log(`[Fraud Checks] Running fake certificate heuristic check for candidate: ${candidateId}...`);
  const certificateFlags: CertificateFlag[] = [];
  const certifications: any[] = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];

  const KNOWN_ISSUERS = [
    "Amazon Web Services", "AWS", "Microsoft", "Google", "Oracle", "Cisco", 
    "Scrum Alliance", "Project Management Institute", "PMI", "Salesforce", 
    "Udemy", "Coursera", "edX"
  ];

  for (const cert of certifications) {
    if (!cert || !cert.name) continue;
    const certName = String(cert.name);
    const certIssuer = String(cert.issuer || "");
    const issuerLower = certIssuer.trim().toLowerCase();

    let flagged = false;
    let reason = "";
    let evidence = "";

    // 1. Typos against known valid issuers (Levenshtein distance <= 2, but not exact match)
    if (certIssuer) {
      for (const known of KNOWN_ISSUERS) {
        const knownLower = known.toLowerCase();
        if (issuerLower !== knownLower) {
          const dist = getLevenshteinDistance(issuerLower, knownLower);
          if (dist > 0 && dist <= 2) {
            flagged = true;
            reason = "Suspicious issuer name typo";
            evidence = `Issuer '${certIssuer}' is very close (edit distance: ${dist}) to the recognized issuer '${known}'.`;
            break;
          }
        }
      }
    }

    // 2. Suspicious name/placeholder patterns in name or issuer
    if (!flagged) {
      const suspiciousRegex = /\b(placeholder|test|fake|sequential|123456|000000|111111|123-456|abcde)\b/i;
      if (suspiciousRegex.test(certName) || suspiciousRegex.test(certIssuer)) {
        flagged = true;
        reason = "Suspicious certificate metadata pattern";
        evidence = `Certificate name/issuer contains suspect words or placeholder numeric patterns (e.g. '123456' or 'placeholder').`;
      }
    }

    if (flagged) {
      certificateFlags.push({
        certification_name: certName,
        issuer: certIssuer,
        reason,
        evidence,
        needs_manual_review: true,
      });
    }
  }

  // ==========================================
  // SAVE & RETURN REPORT
  // ==========================================
  const created_at = new Date().toISOString();
  console.log(`[Fraud Checks] Saving report for ${candidateId} to database...`);
  
  const { error: saveErr } = await supabase
    .from("fraud_checks")
    .upsert({
      candidate_id: candidateId,
      duplicate_matches: duplicateMatches,
      resume_github_mismatches: resumeGithubMismatches,
      certificate_flags: certificateFlags,
      created_at,
    }, {
      onConflict: "candidate_id"
    });

  if (saveErr) {
    console.warn(`[Fraud Checks] Failed to save fraud report to database:`, saveErr.message);
  }

  return {
    candidate_id: candidateId,
    duplicate_matches: duplicateMatches,
    resume_github_mismatches: resumeGithubMismatches,
    certificate_flags: certificateFlags,
    created_at,
  };
}
