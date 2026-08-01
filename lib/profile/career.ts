import { z } from "zod";
import { getSupabaseAdmin } from "../db/client";
import { callAgent } from "../agents/callAgent";
import { MOCK_PROFILES } from "../db/mockProfiles";

// Zod schemas defining strict target format
export const CareerGuidanceSchema = z.object({
  skill_gaps: z.array(z.object({
    skill: z.string(),
    current_level: z.string(),
    target_level: z.string(),
    why: z.string()
  })),
  recommended_certifications: z.array(z.object({
    name: z.string(),
    provider: z.string(),
    reason: z.string()
  })),
  career_roadmap: z.array(z.object({
    stage: z.string(),
    timeframe: z.string(),
    milestones: z.array(z.string())
  })),
  reasoning: z.string()
});

export type CareerGuidance = z.infer<typeof CareerGuidanceSchema>;

interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface CareerGuidanceResult {
  success: boolean;
  career_roadmap: CareerGuidance;
  salary_estimate: {
    estimated_range: SalaryRange;
    basis: string;
  };
  needs_review: boolean;
}

/**
 * Calculates years of experience from profile history.
 */
export function extractYearsOfExperience(profile: any): number {
  const resume = profile.talent_profile?.resume || {};
  const experienceList = Array.isArray(resume.experience) ? resume.experience : [];
  
  let totalYears = 0;
  
  for (const exp of experienceList) {
    const startStr = String(exp.start_date || exp.start_year || "");
    const endStr = String(exp.end_date || exp.end_year || "Present");
    
    const startYear = parseInt(startStr.match(/\b\d{4}\b/)?.[0] || "", 10);
    let endYear = parseInt(endStr.match(/\b\d{4}\b/)?.[0] || "", 10);
    
    if (isNaN(endYear) && /present|current|now/i.test(endStr)) {
      endYear = new Date().getFullYear();
    }
    
    if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear) {
      totalYears += (endYear - startYear);
    } else {
      const desc = String(exp.description || "");
      const match = desc.match(/(\d+)\+?\s*years?/i);
      if (match) {
        totalYears += parseInt(match[1], 10);
      }
    }
  }

  if (totalYears === 0 && profile.resume_data) {
    const resExp = Array.isArray(profile.resume_data.experience) ? profile.resume_data.experience : [];
    for (const exp of resExp) {
      const startYear = parseInt(String(exp.start_date || "").match(/\b\d{4}\b/)?.[0] || "", 10);
      let endYear = parseInt(String(exp.end_date || "").match(/\b\d{4}\b/)?.[0] || "", 10);
      if (isNaN(endYear) && /present|current|now/i.test(String(exp.end_date || ""))) {
        endYear = new Date().getFullYear();
      }
      if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear) {
        totalYears += (endYear - startYear);
      } else {
        const desc = String(exp.description || "");
        const match = desc.match(/(\d+)\+?\s*years?/i);
        if (match) {
          totalYears += parseInt(match[1], 10);
        }
      }
    }
  }

  if (totalYears === 0) {
    const title = String(resume.title || profile.headline || "").toLowerCase();
    if (title.includes("senior") || title.includes("lead") || title.includes("principal")) {
      totalYears = 6;
    } else if (title.includes("junior") || title.includes("intern") || title.includes("associate")) {
      totalYears = 1;
    } else {
      totalYears = 3;
    }
  }

  return totalYears || 3;
}

/**
 * Static heuristic salary lookup table.
 */
export function estimateSalary(
  primaryStack: string,
  yearsExp: number,
  location: string
): { estimated_range: SalaryRange; basis: string } {
  const stack = primaryStack.toLowerCase();
  const locationLower = location.toLowerCase();

  let tier: 1 | 2 | 3 = 3;
  if (
    locationLower.includes("us") ||
    locationLower.includes("united states") ||
    locationLower.includes("sf") ||
    locationLower.includes("san francisco") ||
    locationLower.includes("ny") ||
    locationLower.includes("new york") ||
    locationLower.includes("california")
  ) {
    tier = 1;
  } else if (
    locationLower.includes("europe") ||
    locationLower.includes("uk") ||
    locationLower.includes("london") ||
    locationLower.includes("india") ||
    locationLower.includes("remote") ||
    locationLower.includes("germany") ||
    locationLower.includes("singapore")
  ) {
    tier = 2;
  }

  let level: "junior" | "mid" | "senior" = "junior";
  if (yearsExp >= 6) {
    level = "senior";
  } else if (yearsExp >= 3) {
    level = "mid";
  }

  let tech: "frontend" | "backend" | "fullstack" | "general" = "general";
  if (stack.includes("react") || stack.includes("next.js") || stack.includes("frontend") || stack.includes("angular") || stack.includes("vue")) {
    if (stack.includes("node") || stack.includes("python") || stack.includes("supabase") || stack.includes("backend")) {
      tech = "fullstack";
    } else {
      tech = "frontend";
    }
  } else if (stack.includes("python") || stack.includes("node") || stack.includes("go") || stack.includes("java") || stack.includes("rust") || stack.includes("backend") || stack.includes("fastapi")) {
    tech = "backend";
  }

  const lookup: Record<
    "frontend" | "backend" | "fullstack" | "general",
    Record<"junior" | "mid" | "senior", Record<1 | 2 | 3, [number, number]>>
  > = {
    frontend: {
      junior: { 1: [80, 110], 2: [45, 70], 3: [30, 45] },
      mid: { 1: [110, 150], 2: [70, 105], 3: [45, 65] },
      senior: { 1: [150, 200], 2: [105, 150], 3: [65, 95] },
    },
    backend: {
      junior: { 1: [85, 115], 2: [50, 75], 3: [35, 50] },
      mid: { 1: [115, 160], 2: [75, 115], 3: [50, 75] },
      senior: { 1: [160, 220], 2: [115, 170], 3: [75, 110] },
    },
    fullstack: {
      junior: { 1: [90, 120], 2: [55, 80], 3: [38, 55] },
      mid: { 1: [120, 170], 2: [80, 125], 3: [55, 80] },
      senior: { 1: [170, 240], 2: [125, 190], 3: [80, 120] },
    },
    general: {
      junior: { 1: [75, 100], 2: [40, 60], 3: [25, 40] },
      mid: { 1: [100, 140], 2: [60, 95], 3: [40, 60] },
      senior: { 1: [140, 180], 2: [95, 140], 3: [60, 90] },
    },
  };

  const [minVal, maxVal] = lookup[tech][level][tier];
  
  let currency = "USD";
  if (tier === 2) {
    if (locationLower.includes("india")) {
      return {
        estimated_range: {
          min: minVal * 80000,
          max: maxVal * 80000,
          currency: "INR",
        },
        basis: "ESTIMATE ONLY: This figure is a heuristic lookup based on a static table mapping tech stack (fullstack/backend/frontend), years of experience, and location tier. It is NOT verified market data or an authoritative salary quote."
      };
    } else if (locationLower.includes("uk") || locationLower.includes("london")) {
      return {
        estimated_range: {
          min: Math.round(minVal * 0.8),
          max: Math.round(maxVal * 0.8),
          currency: "GBP",
        },
        basis: "ESTIMATE ONLY: This figure is a heuristic lookup based on a static table mapping tech stack (fullstack/backend/frontend), years of experience, and location tier. It is NOT verified market data or an authoritative salary quote."
      };
    } else if (locationLower.includes("europe") || locationLower.includes("germany")) {
      return {
        estimated_range: {
          min: Math.round(minVal * 0.95),
          max: Math.round(maxVal * 0.95),
          currency: "EUR",
        },
        basis: "ESTIMATE ONLY: This figure is a heuristic lookup based on a static table mapping tech stack (fullstack/backend/frontend), years of experience, and location tier. It is NOT verified market data or an authoritative salary quote."
      };
    }
  }

  return {
    estimated_range: {
      min: minVal * 1000,
      max: maxVal * 1000,
      currency,
    },
    basis: "ESTIMATE ONLY: This figure is a heuristic lookup based on a static table mapping tech stack (fullstack/backend/frontend), years of experience, and location tier. It is NOT verified market data or an authoritative salary quote."
  };
}

/**
 * Sanitizes partial or failed JSON responses to ensure schema conformity.
 */
function sanitizeCareerGuidance(raw: any): CareerGuidance {
  return {
    skill_gaps: Array.isArray(raw?.skill_gaps)
      ? raw.skill_gaps.map((g: any) => ({
          skill: typeof g?.skill === "string" ? g.skill : "Unknown Skill",
          current_level: typeof g?.current_level === "string" ? g.current_level : "Beginner",
          target_level: typeof g?.target_level === "string" ? g.target_level : "Intermediate",
          why: typeof g?.why === "string" ? g.why : "Missing description."
        }))
      : [],
    recommended_certifications: Array.isArray(raw?.recommended_certifications)
      ? raw.recommended_certifications.map((c: any) => ({
          name: typeof c?.name === "string" ? c.name : "Professional Certification",
          provider: typeof c?.provider === "string" ? c.provider : "Industry standard",
          reason: typeof c?.reason === "string" ? c.reason : "To expand technical capability."
        }))
      : [],
    career_roadmap: Array.isArray(raw?.career_roadmap)
      ? raw.career_roadmap.map((r: any) => ({
          stage: typeof r?.stage === "string" ? r.stage : "Phase of development",
          timeframe: typeof r?.timeframe === "string" ? r.timeframe : "3-6 months",
          milestones: Array.isArray(r?.milestones) ? r.milestones.map((m: any) => String(m)) : ["Complete training courses."]
        }))
      : [],
    reasoning: typeof raw?.reasoning === "string" ? raw.reasoning : "Review required due to model formatting error."
  };
}

/**
 * Core function to run AI Career Guidance System.
 */
export async function generateCareerGuidance(
  candidateId: string,
  forceFresh = false
): Promise<CareerGuidanceResult> {
  const adminClient = getSupabaseAdmin();

  // 1. Fetch Candidate Profile (verify existence, fallback to mock profiles if unconfigured DB)
  let profile: any = null;
  try {
    const { data, error: profileErr } = await adminClient
      .from("candidate_profiles")
      .select("*")
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

  // 2. Fetch Skill Verifications
  const { data: verifications, error: verErr } = await adminClient
    .from("skill_verifications")
    .select("*")
    .eq("candidate_id", candidateId);

  if (verErr) {
    console.warn(`[Career Guidance] Failed to fetch skill verifications: ${verErr.message}`);
  }

  // 3. Return cached data if not force_fresh and present
  if (!forceFresh && profile.career_roadmap && profile.salary_estimate) {
    console.log(`[Career Guidance] Returning cached roadmap & salary for ${candidateId}`);
    return {
      success: true,
      career_roadmap: profile.career_roadmap as CareerGuidance,
      salary_estimate: profile.salary_estimate,
      needs_review: profile.career_roadmap_needs_review || false
    };
  }

  const talentProfile = profile.talent_profile || {};
  const talentScore = profile.talent_score || {};
  const verificationsList = verifications || [];

  // 4. Formulate Model prompt and execute agent
  const basePrompt = `You are a Career Guidance AI. Analyze the candidate's talent profile, score, and verified skills to determine skill gaps, recommend certifications, and build a career roadmap.
  
INPUT DETAILS:
- Profile: ${JSON.stringify(talentProfile)}
- Overall Talent Score: ${JSON.stringify(talentScore)}
- Verified Badges/Scores: ${JSON.stringify(verificationsList)}

EVIDENCE RULES:
- Base every single recommendation on concrete evidence actually present in the candidate's profile, stack, or scores.
- Recommendations must be specific to this candidate's real stack and gaps, not generic filler. E.g. only recommend a certification if it connects directly as a logical next step to skills they already claim or need.
- Keep the roadmap milestones actionable and realistic.

You MUST respond with ONLY a valid JSON object matching the following structure:
{
  "skill_gaps": [
    { "skill": "skill name", "current_level": "current level", "target_level": "target level", "why": "evidence-based reason" }
  ],
  "recommended_certifications": [
    { "name": "certification name", "provider": "provider name", "reason": "why this matches their career path" }
  ],
  "career_roadmap": [
    { "stage": "stage name", "timeframe": "timeframe e.g. 1-3 months", "milestones": ["milestone 1", "milestone 2"] }
  ],
  "reasoning": "brief 1-3 sentence summary explaining recommendations"
}

Do not include any code fences, explanations, markdown formatting, or text outside the JSON object.`;

  let finalRoadmap: CareerGuidance | null = null;
  let needsReview = false;

  try {
    console.log(`[Career Guidance] Invoking agent for candidate ${candidateId}...`);
    const rawResponse = await callAgent("career_guidance", {
      talent_profile: talentProfile,
      talent_score: talentScore,
      skill_verifications: verificationsList,
      timestamp: Date.now()
    });

    const parsed = CareerGuidanceSchema.safeParse(rawResponse);
    if (parsed.success) {
      finalRoadmap = parsed.data;
      console.log(`[Career Guidance] Attempt 1 Successful.`);
    } else {
      console.warn(`[Career Guidance] Attempt 1 validation failed. Retrying...`);
      const errorList = parsed.error.issues.map(i => `- Path "${i.path.join(".")}": ${i.message}`).join("\n");
      
      const retryPrompt = `You are a Career Guidance AI. Your previous JSON response failed schema validation.
Please correct these errors and return ONLY a valid JSON object matching the exact schema:

VALIDATION ERRORS:
${errorList}

INPUT DETAILS:
- Profile: ${JSON.stringify(talentProfile)}
- Overall Talent Score: ${JSON.stringify(talentScore)}
- Verified Badges/Scores: ${JSON.stringify(verificationsList)}`;

      const rawRetryResponse = await callAgent("career_guidance", {
        talent_profile: talentProfile,
        talent_score: talentScore,
        skill_verifications: verificationsList,
        prompt: retryPrompt,
        validation_errors: errorList,
        timestamp: Date.now()
      });

      const parsedRetry = CareerGuidanceSchema.safeParse(rawRetryResponse);
      if (parsedRetry.success) {
        finalRoadmap = parsedRetry.data;
        console.log(`[Career Guidance] Attempt 2 Successful.`);
      } else {
        console.error(`[Career Guidance] Attempt 2 validation failed. Falling back.`, parsedRetry.error.format());
        finalRoadmap = sanitizeCareerGuidance(rawRetryResponse);
        needsReview = true;
      }
    }
  } catch (err: any) {
    console.error(`[Career Guidance Agent Error]: ${err.message}`);
    finalRoadmap = sanitizeCareerGuidance({});
    needsReview = true;
  }

  // 5. Run Heuristic Salary Estimation
  const yearsExp = extractYearsOfExperience(profile);
  const location = profile.location || "Remote";
  const resumeSkills = Array.isArray(talentProfile?.resume?.skills) ? talentProfile.resume.skills : [];
  const primaryStack = resumeSkills[0] || "General";
  
  console.log(`[Career Guidance] Heuristic Salary inputs -> stack: ${primaryStack}, years: ${yearsExp}, location: ${location}`);
  const salaryResult = estimateSalary(primaryStack, yearsExp, location);

  // 6. Save to candidate_profiles in DB
  const { error: saveErr } = await adminClient
    .from("candidate_profiles")
    .update({
      career_roadmap: finalRoadmap,
      salary_estimate: salaryResult,
      career_roadmap_needs_review: needsReview,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", candidateId);

  if (saveErr) {
    console.error(`[Career Guidance] Failed to save result to DB: ${saveErr.message}`);
  }

  return {
    success: true,
    career_roadmap: finalRoadmap,
    salary_estimate: salaryResult,
    needs_review: needsReview
  };
}
