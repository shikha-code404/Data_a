import { createHash } from "crypto";
import { getSupabaseAdmin } from "../db/client";
import { HfInference } from "@huggingface/inference";

// Normalize JSON input recursively by sorting keys
export function normalizeInput(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(normalizeInput);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: any = {};
  for (const key of sortedKeys) {
    result[key] = normalizeInput(obj[key]);
  }
  return result;
}

// Generate SHA-256 hash of normalized JSON input
export function generateInputHash(input: object): string {
  const normalized = normalizeInput(input);
  const str = JSON.stringify(normalized);
  return createHash("sha256").update(str).digest("hex");
}

// Extract JSON block or object from string
export function extractJSON(text: string): any {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const match = candidate.match(/[\{\[][\s\S]*[\}\]]/);
  if (!match) {
    throw new Error("No JSON object found in model output: " + text);
  }
  return JSON.parse(match[0]);
}

const COMPANY_RESUME_GUIDANCE: Record<string, string> = {
  google: `Google favors concise, impact-driven bullets: prioritize
measurable outcomes (scale, performance, users impacted) over task
descriptions where the candidate's real data supports it. Favor clarity
and brevity over buzzwords. Do not add specific numbers not present in the
candidate's original data — only reorder/rephrase toward emphasizing
whatever quantifiable outcomes already exist in their profile.`,

  amazon: `Amazon's hiring process is built around their Leadership
Principles (e.g. Customer Obsession, Ownership, Bias for Action, Deliver
Results). Where the candidate's real experience naturally reflects one of
these principles, phrase that bullet using STAR-style structure (brief
situation/action/result) using only facts already present in their data.
Do not force-fit a Leadership Principle onto experience that doesn't
support it.`,

  meta: `Meta values execution speed, ownership of end-to-end features,
and impact at scale. Emphasize the candidate's real experience shipping
features, iterating quickly, or owning a product area end-to-end, using
only what's in their actual history — do not add fabricated scale claims.`,

  microsoft: `Microsoft values collaborative, cross-team impact and a
growth-mindset framing. Emphasize the candidate's genuine collaborative
or mentoring experience and technical depth. Favor a professional, precise
tone over aggressive self-promotion language.`
};

const GENERAL_RESUME_GUIDANCE = `Use a clean, professional, universally
ATS-compatible tone. No company-specific slant.`;

function buildResumeBuilderSystemPrompt(targetCompany: string | null): string {
  const companyGuidance = targetCompany
    ? COMPANY_RESUME_GUIDANCE[targetCompany]
    : GENERAL_RESUME_GUIDANCE;

  return `You are HireSpark's AI Resume Builder agent.

You will receive a candidate's real talent_profile data in the user
message. Your job is to transform THAT candidate's REAL data into a
resume_json object. You must NEVER output placeholder text, generic
example values, or the literal words "string"/"number"/"null" as content.
Every value you output must come from the candidate's actual profile data
provided to you, reworded/reordered as needed per the tailoring
instructions below.

Respond with ONLY a valid JSON object — no markdown fences, no
explanations, no extra top-level keys.

Here is an EXAMPLE of the correct JSON shape, filled with SAMPLE data for
a DIFFERENT, unrelated candidate — this shows you the structure only.
Do NOT reuse, copy, or reference any of the names, companies, skills, or
values in this example. They belong to a different person and must never
appear in your actual output:

{
  "name": "Jordan Ellis",
  "contact": {
    "email": "jordan.ellis@example.com",
    "phone": "+1 (555) 402-8871",
    "location": "Austin, TX",
    "github": "jordanellis-dev"
  },
  "summary": "Backend-focused software engineer with 4 years of experience building distributed systems in Python and Go. Strong track record shipping production services at scale.",
  "experience": [
    {
      "company": "Northwind Systems",
      "role": "Backend Engineer",
      "start_date": "2021",
      "end_date": "Present",
      "description": "Built and maintained microservices handling 2M+ daily requests, reducing p99 latency by 30% through caching and query optimization."
    }
  ],
  "education": [
    {
      "institution": "University of Texas at Austin",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "start_year": 2016,
      "end_year": 2020,
      "gpa": "3.7"
    }
  ],
  "projects": [
    {
      "name": "OpenQueue",
      "description": "Open-source distributed task queue with at-least-once delivery guarantees.",
      "technologies": ["Go", "Redis", "gRPC"]
    }
  ],
  "skills": ["Python", "Go", "PostgreSQL", "Kubernetes", "gRPC"],
  "certifications": []
}

Now, using the SAME structure shown above, build the resume for the ACTUAL
candidate described in the user message. Use only their real name, real
contact info, real companies, real education, real projects, real skills,
and real certifications — pulled directly from the talent_profile data
provided. If a section has no real data for this candidate (e.g. no
certifications on file), return an empty array — do not invent one, and
do not reuse anything from the example above.

TAILORING INSTRUCTIONS FOR THIS RESUME:
${companyGuidance}

RULES:
- Every value in your output must be traceable to the candidate's actual
  profile data provided in the user message, OR be a natural
  rephrasing/reordering of that real data for the target company's
  emphasis — never fabricated, never copied from the example above.
- Every field is required. Omit no key. Rename no key.
- Empty sections → empty arrays, never placeholder entries.
- Double-check before responding: does every name, company, skill, and
  detail in your output actually appear in the candidate's real profile
  data below? If not, remove or correct it.`;
}

/**
 * Executes an agent call by type.
 * Checks Cache -> Tries Local Ollama -> Falls back to Hugging Face -> Saves Cache -> Returns JSON.
 */
export async function callAgent(agentType: string, input: object): Promise<object> {
  const inputHash = generateInputHash(input);
  const adminClient = getSupabaseAdmin();

  // 1. Check database cache
  try {
    const { data, error } = await adminClient
      .from("agent_responses")
      .select("response")
      .eq("agent_type", agentType)
      .eq("input_hash", inputHash)
      .maybeSingle();

    if (data && data.response) {
      console.log(`[Cache Hit] agentType: ${agentType}, hash: ${inputHash}`);
      return data.response;
    }
  } catch (err) {
    console.error("Database cache read failed. Proceeding to call model directly.", err);
  }

  let responseObj: any = null;
  let source = "";

  if (agentType === "talent_score") {
    // For talent_score, Hugging Face is primary, Ollama qwen3.5:cloud is secondary
    try {
      const apiKey = process.env.HF_API_KEY;
      if (!apiKey || apiKey.includes("placeholder")) {
        throw new Error("Hugging Face API key is missing or is placeholder.");
      }

      console.log(`[HF Request] agentType: talent_score, modelId: Qwen/Qwen3-32B`);
      // Try with cerebras provider first
      let res = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "Qwen/Qwen3-32B:cerebras",
          messages: [
            {
              role: "system",
              content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object.`
            },
            {
              role: "user",
              content: JSON.stringify(input)
            }
          ],
          max_tokens: 1024,
          temperature: 0.3,
          extra_body: {
            enable_thinking: false
          }
        })
      });

      // Fallback to standard provider if cerebras is offline
      if (!res.ok) {
        console.warn(`HF Qwen/Qwen3-32B with Cerebras provider failed with status ${res.status}. Trying Qwen/Qwen3-32B without specific provider...`);
        res = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "Qwen/Qwen3-32B",
            messages: [
              {
                role: "system",
                content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object.`
              },
              {
                role: "user",
                content: JSON.stringify(input)
              }
            ],
            max_tokens: 1024,
            temperature: 0.3,
            extra_body: {
              enable_thinking: false
            }
          })
        });
      }

      if (!res.ok) {
        throw new Error(`HF Inference Router responded with status ${res.status}`);
      }

      const resData = await res.json();
      const rawContent = resData.choices?.[0]?.message?.content ?? "";
      responseObj = extractJSON(rawContent);
      source = "huggingface";
      console.log(`[HF Success] Response parsed successfully for talent_score.`);
    } catch (hfErr: any) {
      console.warn(`Hugging Face primary failed for talent_score: ${hfErr.message}. Falling back to Ollama.`);

      // 2. Try Ollama (Local qwen3.5:cloud) as fallback
      const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
      console.log(`[Ollama Fallback] agentType: talent_score, host: ${ollamaHost}, model: qwen3.5:cloud`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const res = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen3.5:cloud",
            messages: [
              {
                role: "system",
                content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object representing your output. Do not include any explanations, markdown code fences, or text outside the JSON.`,
              },
              {
                role: "user",
                content: JSON.stringify(input),
              },
            ],
            stream: false,
            options: {
              temperature: 0.3,
            },
            format: "json",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Ollama responded with status ${res.status}`);
        }

        const data = await res.json();
        const rawContent = data.message?.content;
        if (!rawContent) {
          throw new Error("Ollama returned empty message content");
        }

        responseObj = extractJSON(rawContent);
        source = "ollama";
        console.log(`[Ollama Success] Response parsed successfully for talent_score.`);
      } catch (ollamaErr: any) {
        console.warn(`Ollama fallback failed for talent_score: ${ollamaErr.message}. Applying local intelligence fallback.`);

        const talentProfile = (input as any).talent_profile || {};
        const github = talentProfile.github || {};
        const resume = talentProfile.resume || {};

        const commits = github.commits?.total_last_12_months || 0;
        const prs = (github.pull_requests?.merged || 0) + (github.pull_requests?.opened || 0);
        const stars = github.top_5_repos_by_stars?.reduce((acc: number, r: any) => acc + (r.stars || 0), 0) || 0;
        const reposCount = github.repositories?.length || 0;
        const skillsCount = Array.isArray(resume.skills) ? resume.skills.length : 0;
        const expCount = Array.isArray(resume.experience) ? resume.experience.length : 0;
        const projCount = Array.isArray(resume.projects) ? resume.projects.length : 0;

        const coding = Math.min(98, Math.max(45, 45 + Math.min(30, commits / 5) + Math.min(15, skillsCount * 2) + Math.min(10, reposCount)));
        const projQuality = Math.min(98, Math.max(40, 40 + Math.min(30, stars * 10) + Math.min(20, projCount * 4)));
        const leadership = Math.min(98, Math.max(35, 35 + Math.min(40, expCount * 10) + Math.min(20, prs * 5)));
        const problemSolving = Math.min(98, Math.max(45, 45 + Math.min(30, commits / 6) + Math.min(20, projCount * 3)));
        const innovation = Math.min(98, Math.max(40, 40 + Math.min(30, stars * 15) + Math.min(25, reposCount * 3)));
        const community = Math.min(98, Math.max(30, 30 + Math.min(40, prs * 8) + Math.min(25, stars * 5)));
        const consistency = Math.min(98, Math.max(40, 40 + Math.min(40, commits / 4) + Math.min(20, expCount * 5)));

        const overall = Math.round((coding + projQuality + leadership + problemSolving + innovation + community + consistency) / 7);

        responseObj = {
          scores: {
            coding_ability: coding,
            project_quality: projQuality,
            leadership,
            problem_solving: problemSolving,
            innovation,
            community_participation: community,
            technical_consistency: consistency
          },
          overall_score: overall,
          reasoning: `Heuristic score calculated locally based on ${commits} commits, ${prs} PRs, ${stars} stars, and ${skillsCount} verified skills.`
        };
        source = "local_talent_score";
      }
    }

    // 3. Cache and return response
    try {
      console.log(`[Cache Write] Writing response to cache. Hash: ${inputHash}`);
      await adminClient.from("agent_responses").upsert({
        agent_type: agentType,
        input_hash: inputHash,
        input_payload: input,
        response: responseObj,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "agent_type,input_hash"
      });
    } catch (err) {
      console.error("Failed to cache agent response to database:", err);
    }

    return responseObj;
  }

  if (agentType === "career_guidance") {
    // 1. Try Groq as primary
    try {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey.includes("placeholder")) {
        throw new Error("Groq API key is missing or is placeholder.");
      }

      console.log(`[Groq Request] agentType: career_guidance, modelId: llama-3.3-70b-versatile`);
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are HireSpark's AI Career Guidance agent.

You will receive a candidate's real talent profile and talent score in the user message. Your job is to generate personalized career guidance for THAT candidate. You must NEVER output placeholder text, generic filler, or the literal words "string"/"number"/"null" as content.

Respond with ONLY a valid JSON object — no markdown code fences, no explanations, no text outside the JSON, and no extra top-level keys beyond these four.

Here is an EXAMPLE of the correct JSON shape, filled with SAMPLE data for a DIFFERENT, unrelated candidate — this shows you the structure only. Do NOT reuse, copy, or reference any of the skill gaps, certifications, or roadmap items in this example:

{
  "skill_gaps": [
    {
      "skill": "Distributed Systems Design",
      "current_level": "Intermediate",
      "target_level": "Advanced",
      "why": "Candidate has solid single-service backend experience but lacks production architectural exposure to multi-region distributed storage."
    }
  ],
  "recommended_certifications": [
    {
      "name": "AWS Certified Solutions Architect - Associate",
      "provider": "Amazon Web Services",
      "reason": "Provides structured validation for designing scalable cloud systems to complement existing backend coding skills."
    }
  ],
  "career_roadmap": [
    {
      "stage": "Cloud System Foundations",
      "timeframe": "1-3 months",
      "milestones": [
        "Complete AWS architectural design patterns course",
        "Build and deploy a containerized event-driven microservice"
      ]
    }
  ],
  "reasoning": "Candidate demonstrates strong core engineering capabilities and is well positioned to advance toward Senior/Lead backend roles by expanding cloud architecture expertise."
}

Now, using the SAME structure shown above, generate career guidance for the ACTUAL candidate described in the user message. Base every recommendation on their actual skills, score, and background provided.

RULES:
- skill_gaps: 1-4 entries based on candidate's actual profile
- recommended_certifications: 1-4 entries relevant to candidate's stack
- career_roadmap: 2-3 stages, each with 1-3 concrete milestones
- Every value must be tailored to the candidate in the user message — never fabricated, never copied from the example above.
- Double-check before responding: does every recommendation logically connect to the candidate's real data?`
            },
            {
              role: "user",
              content: JSON.stringify(input)
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });
      if (!res.ok) {
        throw new Error(`Groq API responded with status ${res.status}`);
      }

      const resData = await res.json();
      const rawContent = resData.choices?.[0]?.message?.content ?? "";
      responseObj = extractJSON(rawContent);
      source = "groq";
      console.log(`[Groq Success] Response parsed successfully for career_guidance.`);
    } catch (groqErr: any) {
      console.warn(`Groq primary failed for career_guidance: ${groqErr.message}. Falling back to Ollama.`);

      // 2. Try Ollama (Local qwen3.5:cloud) as secondary fallback
      const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
      console.log(`[Ollama Fallback] agentType: career_guidance, host: ${ollamaHost}, model: qwen3.5:cloud`);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const res = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "qwen3.5:cloud",
            messages: [
              {
                role: "system",
                content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object representing your output. Do not include any explanations, markdown code fences, or text outside the JSON.`,
              },
              {
                role: "user",
                content: JSON.stringify(input),
              },
            ],
            stream: false,
            options: {
              temperature: 0.3,
            },
            format: "json",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Ollama responded with status ${res.status}`);
        }

        const data = await res.json();
        const rawContent = data.message?.content;
        if (!rawContent) {
          throw new Error("Ollama returned empty message content");
        }

        responseObj = extractJSON(rawContent);
        source = "ollama";
        console.log(`[Ollama Success] Response parsed successfully for career_guidance.`);
      } catch (ollamaErr: any) {
        console.warn(`Ollama fallback failed for career_guidance: ${ollamaErr.message}. Falling back to Hugging Face.`);

        // 3. Try Hugging Face as tertiary fallback
        try {
          const hfApiKey = process.env.HF_API_KEY;
          if (!hfApiKey || hfApiKey.includes("placeholder")) {
            throw new Error("Hugging Face API key is missing or is placeholder.");
          }

          const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen3.5-4B";
          console.log(`[HF Fallback] agentType: career_guidance, modelId: ${modelId}`);

          const hf = new HfInference(hfApiKey);
          const completion = await hf.chatCompletion({
            model: modelId,
            messages: [
              {
                role: "system",
                content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object. Do not include any explanations, markdown code fences, or text outside the JSON.`,
              },
              {
                role: "user",
                content: JSON.stringify(input),
              },
            ],
            max_tokens: 1024,
            temperature: 0.3,
          });

          const rawContent = completion.choices[0]?.message?.content ?? "";
          responseObj = extractJSON(rawContent);
          source = "huggingface";
          console.log(`[HF Success] Response parsed successfully for career_guidance.`);
        } catch (hfErr: any) {
          console.warn(`External LLM endpoints unreachable and Ollama failed. Applying local intelligence parser for career_guidance.`);

          // Local fallback heuristics for career guidance
          const talentProfile = (input as any).talent_profile || {};
          const talentScore = (input as any).talent_score || {};
          const resume = talentProfile.resume || {};
          const skills = Array.isArray(resume.skills) ? resume.skills : [];

          responseObj = {
            reasoning: "Local heuristic fallback assessment based on skills and background.",
            skill_gaps: [
              {
                skill: skills.includes("React") ? "Next.js" : "React",
                current_level: "Beginner",
                target_level: "Intermediate",
                why: "To bridge the gap between basic front-end and advanced modern full-stack development."
              },
              {
                skill: "Docker",
                current_level: "Beginner",
                target_level: "Intermediate",
                why: "Essential for modern containerized microservice architectures."
              }
            ],
            career_roadmap: [
              {
                stage: "Advanced Framework Mastery",
                timeframe: "1-3 months",
                milestones: ["Build 2 full-stack projects using modern architectural patterns."]
              },
              {
                stage: "DevOps & Deployment",
                timeframe: "3-6 months",
                milestones: ["Containerize applications and deploy onto AWS or GCP platforms."]
              }
            ],
            recommended_certifications: [
              {
                name: "AWS Certified Developer - Associate",
                provider: "Amazon Web Services",
                reason: "Demonstrates cloud capabilities and increases marketability."
              }
            ]
          };
          source = "local_career_guidance";
        }
      }
    }

    // 4. Cache and return response
    try {
      console.log(`[Cache Write] Writing response to cache. Hash: ${inputHash}`);
      await adminClient.from("agent_responses").upsert({
        agent_type: agentType,
        input_hash: inputHash,
        input_payload: input,
        response: responseObj,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "agent_type,input_hash"
      });
    } catch (err) {
      console.error("Failed to cache agent response to database:", err);
    }

    return responseObj;
  }

  if (agentType === "resume_builder") {
    const targetCompany = (input as any).target_company || null;
    const systemPrompt = buildResumeBuilderSystemPrompt(targetCompany);

    // 1. Try Ollama (Local qwen3.5:cloud) as primary
    const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
    console.log(`[Ollama Request] agentType: resume_builder, host: ${ollamaHost}, model: qwen3.5:cloud, targetCompany: ${targetCompany}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout

      const res = await fetch(`${ollamaHost}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen3.5:cloud",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
          stream: false,
          options: {
            temperature: 0.3,
          },
          format: "json", // JSON enforcement
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Ollama responded with status ${res.status}`);
      }

      const data = await res.json();
      const rawContent = data.message?.content;
      if (!rawContent) {
        throw new Error("Ollama returned empty message content");
      }

      responseObj = extractJSON(rawContent);
      source = "ollama";
      console.log(`[Ollama Success] Response parsed successfully for resume_builder.`);
    } catch (ollamaErr: any) {
      console.warn(`Ollama primary failed for resume_builder: ${ollamaErr.message}. Falling back to Hugging Face.`);

      // 2. Try Hugging Face as secondary fallback
      try {
        const apiKey = process.env.HF_API_KEY;
        if (!apiKey || apiKey.includes("placeholder")) {
          throw new Error("Hugging Face API key is missing or is placeholder.");
        }

        const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen3.5-4B";
        console.log(`[HF Fallback] agentType: resume_builder, modelId: ${modelId}`);

        const hf = new HfInference(apiKey);
        const completion = await hf.chatCompletion({
          model: modelId,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        });

        const rawContent = completion.choices[0]?.message?.content ?? "";
        responseObj = extractJSON(rawContent);
        source = "huggingface";
        console.log(`[HF Success] Response parsed successfully for resume_builder.`);
      } catch (hfErr: any) {
        console.warn(`External LLM endpoints unreachable and Ollama failed. Applying local intelligence parser for resume_builder.`);
        
        // 3. Local fallback heuristics
        const talentProfile = (input as any).talent_profile || {};
        const resumeData = talentProfile.resume_data || (input as any).resume_data || {};
        const rawResume = talentProfile.resume || {};

        const isMockName = rawResume.name === "Candidate User";
        const isMockCompany = rawResume.experience?.[0]?.company === "HireSpark Partner";

        const candidateName = (resumeData.name && resumeData.name !== "Candidate User" ? resumeData.name : null)
          || (!isMockName && rawResume.name ? rawResume.name : null)
          || talentProfile.name
          || "Candidate User";

        const email = (resumeData.email && !resumeData.email.includes("hirespark.com") ? resumeData.email : null)
          || (!isMockName && rawResume.email ? rawResume.email : null)
          || talentProfile.email
          || "candidate@hirespark.com";

        const phone = resumeData.phone || (!isMockName ? rawResume.phone : null) || talentProfile.phone || "";
        const location = resumeData.location || (!isMockName ? rawResume.location : null) || talentProfile.location || "";

        const skillsSet = new Set<string>();
        if (Array.isArray(resumeData.skills)) resumeData.skills.forEach((s: any) => typeof s === "string" && s.trim() && skillsSet.add(s.trim()));
        if (!isMockName && Array.isArray(rawResume.skills)) rawResume.skills.forEach((s: any) => typeof s === "string" && s.trim() && skillsSet.add(s.trim()));
        const githubLangs = talentProfile.github?.languages || {};
        Object.keys(githubLangs).forEach((lang) => skillsSet.add(lang));
        const skills = Array.from(skillsSet);

        let experience = Array.isArray(resumeData.experience) && resumeData.experience.length > 0
          ? resumeData.experience
          : (!isMockCompany && Array.isArray(rawResume.experience) ? rawResume.experience : []);

        if (experience.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
          experience = [
            {
              company: "Independent Software Developer",
              role: "Full Stack Developer",
              start_date: "2022",
              end_date: "Present",
              description: `Developed and deployed ${talentProfile.github.repositories.length}+ software repositories specializing in ${skills.slice(0, 3).join(", ") || "full-stack development"}.`
            }
          ];
        }

        let education = Array.isArray(resumeData.education) && resumeData.education.length > 0
          ? resumeData.education
          : (!isMockName && Array.isArray(rawResume.education) ? rawResume.education : []);

        let projects = Array.isArray(resumeData.projects) && resumeData.projects.length > 0
          ? resumeData.projects
          : (!isMockName && Array.isArray(rawResume.projects) ? rawResume.projects : []);

        if (projects.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
          projects = talentProfile.github.repositories.slice(0, 4).map((repo: any) => ({
            name: repo.name || "Software Project",
            description: repo.description || `Open-source project built with ${repo.primary_language || "TypeScript"}.`,
            technologies: repo.primary_language ? [repo.primary_language] : skills.slice(0, 3)
          }));
        }

        const certifications = Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0
          ? resumeData.certifications
          : (!isMockName && Array.isArray(rawResume.certifications) ? rawResume.certifications : []);

        let summaryText = `Results-driven software professional specializing in ${skills.slice(0, 4).join(", ") || "software engineering"}. Proven track record of delivering high-quality web services and products.`;
        if (targetCompany) {
          summaryText += ` (Tailored for ${targetCompany.toUpperCase()})`;
        }

        responseObj = {
          name: candidateName,
          contact: {
            email,
            phone,
            location,
            github: talentProfile.github_username || null
          },
          summary: summaryText,
          experience: experience.map((exp: any) => ({
            company: exp.company || "Software Company",
            role: exp.role || "Software Developer",
            start_date: String(exp.start_date || exp.start_year || "2022"),
            end_date: exp.end_date ? String(exp.end_date) : "Present",
            description: exp.description || "Contributed to core application design, implementation, and deployment."
          })),
          education: education.map((edu: any) => ({
            institution: edu.institution || "University",
            degree: edu.degree || "Bachelor of Science",
            field: edu.field || "Computer Science",
            start_year: typeof edu.start_year === "number" ? edu.start_year : 2020,
            end_year: typeof edu.end_year === "number" ? edu.end_year : 2024,
            gpa: edu.gpa ? String(edu.gpa) : null
          })),
          projects: projects.map((proj: any) => ({
            name: proj.name || "Full Stack Application",
            description: proj.description || "Designed and built responsive software solutions.",
            technologies: Array.isArray(proj.technologies) ? proj.technologies : skills.slice(0, 3)
          })),
          skills: skills,
          certifications: certifications.map((c: any) => ({
            name: c.name || "Technical Certification",
            issuer: c.issuer || "Authority",
            year: typeof c.year === "number" ? c.year : null
          })),
          target_company: targetCompany,
          evaluation_method: "local_fallback"
        };
        source = "local_resume_builder";
      }
    }

    // 4. Cache and return response
    try {
      console.log(`[Cache Write] Writing response to cache. Hash: ${inputHash}`);
      await adminClient.from("agent_responses").upsert({
        agent_type: agentType,
        input_hash: inputHash,
        input_payload: input,
        response: responseObj,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "agent_type,input_hash"
      });
    } catch (err) {
      console.error("Failed to cache agent response to database:", err);
    }

    return responseObj;
  }

  // 1. Try Ollama (Local qwen3.5:cloud) as primary
  const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  console.log(`[Ollama Request] agentType: ${agentType}, host: ${ollamaHost}, model: qwen3.5:cloud`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 seconds timeout for local model response

    const res = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3.5:cloud",
        messages: [
          {
            role: "system",
            content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object representing your output. Do not include any explanations, markdown code fences, or text outside the JSON.`,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        stream: false,
        options: {
          temperature: 0.3,
        },
        format: "json", // Ollama format json enforcement
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Ollama responded with status ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.message?.content;
    if (!rawContent) {
      throw new Error("Ollama returned empty message content");
    }

    responseObj = extractJSON(rawContent);
    source = "ollama";
    console.log(`[Ollama Success] Response parsed successfully for ${agentType}.`);
  } catch (ollamaErr: any) {
    console.warn(`Ollama primary failed for ${agentType}: ${ollamaErr.message}. Falling back to Hugging Face.`);

    // 2. Try Hugging Face as secondary fallback
    try {
      const apiKey = process.env.HF_API_KEY;
      if (!apiKey || apiKey.includes("placeholder")) {
        throw new Error("Hugging Face API key is missing or is placeholder.");
      }

      if (agentType === "talent_score") {
        console.log(`[HF Request] agentType: talent_score, modelId: Qwen/Qwen3-32B`);
        // Try with cerebras provider first
        let res = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "Qwen/Qwen3-32B:cerebras",
            messages: [
              {
                role: "system",
                content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object.`
              },
              {
                role: "user",
                content: JSON.stringify(input)
              }
            ],
            max_tokens: 1024,
            temperature: 0.3,
            extra_body: {
              enable_thinking: false
            }
          })
        });

        // Fallback to standard provider if cerebras is offline
        if (!res.ok) {
          console.warn(`HF Qwen/Qwen3-32B with Cerebras provider failed with status ${res.status}. Trying Qwen/Qwen3-32B without specific provider...`);
          res = await fetch("https://router.huggingface.co/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "Qwen/Qwen3-32B",
              messages: [
                {
                  role: "system",
                  content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object.`
                },
                {
                  role: "user",
                  content: JSON.stringify(input)
                }
              ],
              max_tokens: 1024,
              temperature: 0.3,
              extra_body: {
                enable_thinking: false
              }
            })
          });
        }

        if (!res.ok) {
          throw new Error(`HF Inference Router responded with status ${res.status}`);
        }

        const resData = await res.json();
        const rawContent = resData.choices?.[0]?.message?.content ?? "";
        responseObj = extractJSON(rawContent);
        source = "huggingface";
        console.log(`[HF Success] Response parsed successfully for talent_score.`);
      } else {
        const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen3.5-4B";
        console.log(`[HF Request] agentType: ${agentType}, modelId: ${modelId}`);

        const hf = new HfInference(apiKey);
        const completion = await hf.chatCompletion({
          model: modelId,
          messages: [
            {
              role: "system",
              content: `You are an AI agent of type '${agentType}'. Respond ONLY with a valid JSON object. Do not include any explanations, markdown code fences, or text outside the JSON.`,
            },
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        });

        const rawContent = completion.choices[0]?.message?.content ?? "";
        responseObj = extractJSON(rawContent);
        source = "huggingface";
        console.log(`[HF Success] Response parsed successfully.`);
      }
    } catch (hfErr: any) {
      console.warn(`External LLM endpoints unreachable (${hfErr.message}) and Ollama failed (${ollamaErr.message}). Applying local intelligence parser for ${agentType}.`);

      if (agentType === "recruiter_copilot") {
        const queryStr = (input as any)?.query || JSON.stringify(input);
        const lower = queryStr.toLowerCase();
        const extractedSkills: string[] = [];
        if (lower.includes("react")) extractedSkills.push("React");
        if (lower.includes("next.js") || lower.includes("nextjs")) extractedSkills.push("Next.js");
        if (lower.includes("typescript")) extractedSkills.push("TypeScript");
        if (lower.includes("python")) extractedSkills.push("Python");
        if (lower.includes("ml") || lower.includes("machine learning")) extractedSkills.push("ML");
        if (lower.includes("supabase")) extractedSkills.push("Supabase");

        let minScore = 0;
        const scoreMatch = lower.match(/(?:above|over|>=|>)\s*(\d{2})/);
        if (scoreMatch) minScore = parseInt(scoreMatch[1], 10);

        responseObj = {
          skills: extractedSkills,
          experience: lower.includes("senior") ? "3+ years" : "",
          min_talent_score: minScore,
          hackathon_required: lower.includes("hackathon"),
          min_github_activity: lower.includes("github") || lower.includes("repo"),
        };
        source = "local_copilot_parser";
      } else if (agentType === "job_match_explainer") {
        responseObj = {
          fitSummary: "Candidate demonstrates strong technical alignment with required skills, verified code contributions, and solid background.",
          keySkillsMatched: ["React", "TypeScript", "Next.js"],
          missingSkills: []
        };
        source = "local_explainer_parser";
      } else if (agentType === "resume_parser") {
        const promptStr = (input as any)?.prompt || JSON.stringify(input);

        // Extract raw resume text from basePrompt
        const rawTextStart = promptStr.indexOf("RAW RESUME TEXT:");
        const resumeText = rawTextStart !== -1 ? promptStr.substring(rawTextStart + 16).trim() : promptStr;
        const lowerText = resumeText.toLowerCase();

        // 1. Extract Email
        const emailMatch = resumeText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const email = emailMatch ? emailMatch[1] : null;

        // 2. Extract Phone
        const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]??\(?\d{1,3}\)?[-.\s]??\d{3,4}[-.\s]??\d{4})/);
        const phone = phoneMatch ? phoneMatch[0] : null;

        // 3. Extract Name from start of resumeText
        let name = "";
        const startChunk = resumeText.substring(0, 100).trim();
        const nameMatch = startChunk.match(/^([A-Z][a-zA-Z\.\-]+(?:\s+[A-Z][a-zA-Z\.\-]+){1,2})/);
        if (nameMatch) {
          name = nameMatch[1];
        }

        // 4. Extract Skills
        const skillList = [
          "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Express",
          "Python", "Django", "Flask", "FastAPI", "PostgreSQL", "MongoDB", "MySQL",
          "Firebase", "Supabase", "Docker", "Kubernetes", "AWS", "Google Cloud",
          "Azure", "Git", "GitHub", "HTML", "CSS", "Tailwind", "Bootstrap",
          "Redux", "GraphQL", "REST API", "Java", "Spring Boot", "C++", "C#", "Rust",
          "Go", "Golang", "PHP", "Laravel", "Ruby", "Ruby on Rails", "Machine Learning",
          "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy"
        ];
        const extractedSkills: string[] = [];
        for (const skill of skillList) {
          const lowerSkill = skill.toLowerCase();
          if (lowerSkill === "c++") {
            if (lowerText.includes("c++")) extractedSkills.push(skill);
          } else if (lowerSkill === "c#") {
            if (lowerText.includes("c#")) extractedSkills.push(skill);
          } else if (lowerSkill === "next.js") {
            if (lowerText.includes("next.js") || lowerText.includes("nextjs")) extractedSkills.push(skill);
          } else if (lowerSkill === "node.js") {
            if (lowerText.includes("node.js") || lowerText.includes("nodejs")) extractedSkills.push(skill);
          } else {
            const escaped = lowerSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`);
            if (regex.test(lowerText)) {
              extractedSkills.push(skill);
            }
          }
        }

        // 5. Extract Education Institution
        const education = [];
        const eduMatches = resumeText.match(/([A-Z][a-zA-Z\s,]+(?:University|College|Institute|Academy|School)(?:\sof\s[A-Z][a-zA-Z\s,]+)?)/g);
        if (eduMatches && eduMatches.length > 0) {
          const institution = eduMatches[0].trim();
          let degree = "Bachelor of Science";
          let field = "Computer Science";
          if (/b\.\s*s|bachelor/i.test(resumeText)) degree = "Bachelor of Science";
          else if (/m\.\s*s|master/i.test(resumeText)) degree = "Master of Science";
          else if (/ph\.\s*d|doctor/i.test(resumeText)) degree = "Ph.D.";

          if (/computer engineering/i.test(resumeText)) field = "Computer Engineering";
          else if (/information technology/i.test(resumeText)) field = "Information Technology";
          else if (/software engineering/i.test(resumeText)) field = "Software Engineering";

          let gpa = null;
          const gpaMatch = resumeText.match(/gpa:?\s*([0-3]\.\d+|4\.0)/i);
          if (gpaMatch) gpa = gpaMatch[1];

          education.push({
            institution,
            degree,
            field,
            start_year: 2020,
            end_year: 2024,
            gpa
          });
        }

        // 6. Extract Experience
        const experience = [];
        const roles = ["Software Engineer", "Full Stack Engineer", "Backend Developer", "Frontend Developer", "Data Scientist", "Product Manager", "Software Developer", "DevOps Engineer"];
        let foundRole = null;
        let foundCompany = null;

        for (const r of roles) {
          const reg = new RegExp(`\\b${r}\\b`, 'i');
          if (reg.test(resumeText)) {
            foundRole = r;
            break;
          }
        }
        const atCompanyMatch = resumeText.match(/(?:at|with)\s+([A-Z][a-zA-Z0-9&\s]{2,20})(?:\s+as|\s+from|,|\.)/i);
        if (atCompanyMatch) {
          foundCompany = atCompanyMatch[1].trim();
        } else {
          const suffixMatch = resumeText.match(/([A-Z][a-zA-Z0-9&\s]{2,20}(?:Inc\.|Corp\.|Ltd\.|Co\.|Group))/i);
          if (suffixMatch) foundCompany = suffixMatch[1].trim();
        }

        if (foundRole || foundCompany) {
          experience.push({
            company: foundCompany || "Unknown Company",
            role: foundRole || "Software Professional",
            start_date: "2021",
            end_date: "Present",
            description: "Responsible for full-lifecycle software development and systems integration."
          });
        }

        // 7. Extract Projects (empty array as default to avoid fabrication)
        const projects: any[] = [];

        responseObj = {
          name,
          email,
          phone,
          education,
          experience,
          projects,
          certifications: [],
          skills: extractedSkills,
        };
        source = "local_resume_parser";
      } else if (agentType === "interview_question_generator") {
        responseObj = {
          technical_questions: [
            "Explain the difference between interface and type in TypeScript, and when to use which.",
            "Explain how React's reconciliation algorithm decides what to re-render.",
            "How does Node.js handle asynchronous operations under the hood?"
          ],
          behavioral_questions: [
            "Tell me about a time you had to optimize performance in a web application.",
            "How do you handle conflict or differing opinions within a development team?"
          ]
        };
        source = "local_interview_question_generator";
      } else if (agentType === "interview_evaluator") {
        const answers = (input as any).answers || {};
        const answerTexts = Object.values(answers).map(v => String(v).trim());

        let techScore = 40;
        let strengths = [];
        let concerns = [];

        // Evaluate based on keyword presence strictly in the candidate's answers
        const answersStr = JSON.stringify(answers).toLowerCase();

        // 1. TS check
        if (answersStr.includes("merging") || answersStr.includes("union") || answersStr.includes("intersection")) {
          techScore += 20;
          strengths.push("Understand TypeScript differences between interface and type (declaration merging/union types).");
        } else {
          concerns.push("Vague or missing explanation of TypeScript interface and type distinctions.");
        }

        // 2. React check
        if (answersStr.includes("reconciliation") || answersStr.includes("diff") || answersStr.includes("virtual dom")) {
          techScore += 20;
          strengths.push("Understand React's reconciliation and re-rendering logic.");
        } else {
          concerns.push("Weak understanding of React rendering mechanics.");
        }

        // 3. Node check
        if (answersStr.includes("event loop") || answersStr.includes("libuv") || answersStr.includes("thread pool")) {
          techScore += 20;
          strengths.push("Demonstrated clear understanding of Node.js event-driven runtime.");
        } else {
          concerns.push("Did not explain Node.js asynchronous architecture.");
        }

        // Substance analysis: Check word counts per answer
        let hasShortAnswer = false;
        let totalWords = 0;

        for (const ans of answerTexts) {
          const words = ans.split(/\s+/).filter(w => w.length > 0);
          totalWords += words.length;
          if (words.length < 15) {
            hasShortAnswer = true;
          }
        }

        // Capping rule: an answer under 15 words should never score above 40
        if (hasShortAnswer || totalWords < 50) {
          techScore = Math.min(techScore, 40);
          concerns.push("One or more answers were too brief (under 15 words) to demonstrate technical depth.");
        } else {
          // Substance bonus for highly detailed responses
          if (totalWords > 150) {
            techScore = Math.min(100, techScore + 10);
          }
        }

        let recommendation = 'maybe';
        if (techScore >= 80) recommendation = 'strong_yes';
        else if (techScore >= 65) recommendation = 'yes';
        else if (techScore >= 45) recommendation = 'maybe';
        else recommendation = 'no';

        responseObj = {
          confidence_score: Math.min(100, Math.max(0, techScore + 5)),
          technical_rating: techScore,
          communication_rating: (hasShortAnswer || totalWords < 50) ? 40 : 85,
          hiring_recommendation: recommendation,
          strengths: strengths.length > 0 ? strengths : ["Responsive communication style."],
          concerns: concerns.length > 0 ? concerns : ["No major concerns detected."],
          summary: `Candidate has completed the interview. Technical rating is ${techScore}%. ${hasShortAnswer ? "Evaluation capped at 40 due to insufficient substance in one or more answers." : "Demonstrated key technical strengths."
            }`,
          evaluation_method: "local_fallback"
        };
        source = "local_interview_evaluator";
      } else if (agentType === "team_contribution_summary") {
        responseObj = {
          summary: "The team shows stable overall progress with contributions distributed across members. A clear primary developer drives the main feature development, with auxiliary members handling support functions."
        };
        source = "local_team_contribution_summary";
      } else if (agentType === "ppt_analyzer") {
        const slidesText = (input as any).slides_text || "";
        const lower = slidesText.toLowerCase();

        let innovation = 50;
        let technical = 50;
        let presentation = 50;
        let business = 50;

        const wordCount = slidesText.split(/\s+/).filter(Boolean).length;

        if (lower.includes("architecture") || lower.includes("stack") || lower.includes("database") || lower.includes("api") || lower.includes("backend") || lower.includes("frontend")) {
          technical += 20;
        }
        if (lower.includes("patent") || lower.includes("novel") || lower.includes("first ever") || lower.includes("innovative") || lower.includes("breakthrough")) {
          innovation += 20;
        }
        if (lower.includes("market") || lower.includes("revenue") || lower.includes("customer") || lower.includes("business model") || lower.includes("monetization")) {
          business += 20;
        }
        if (lower.includes("conclusion") || lower.includes("summary") || lower.includes("timeline") || lower.includes("milestone")) {
          presentation += 20;
        }

        if (wordCount < 100) {
          innovation = Math.max(10, innovation - 30);
          technical = Math.max(10, technical - 35);
          presentation = Math.max(10, presentation - 25);
          business = Math.max(10, business - 30);
        } else if (wordCount > 300) {
          presentation = Math.min(100, presentation + 15);
        }

        const overall = Math.round((innovation + technical + presentation + business) / 4);

        let suggestions = [
          "Provide more concrete technical details regarding the architecture and tech stack.",
          "Elaborate on the business model and target customer acquisition strategy.",
          "Refine the value proposition to highlight what makes the solution unique."
        ];

        if (wordCount < 100) {
          suggestions.push("Expand the overall content of the deck; it currently lacks sufficient details to evaluate.");
        }

        responseObj = {
          scores: {
            innovation: Math.min(100, innovation),
            technical_feasibility: Math.min(100, technical),
            presentation_quality: Math.min(100, presentation),
            business_potential: Math.min(100, business),
            overall_pitch_score: Math.min(100, overall)
          },
          summary: `The pitch deck contains a ${wordCount < 100 ? 'brief summary' : 'detailed description'} of the project. It outlines basic concepts but needs further expansion.`,
          improvement_suggestions: suggestions.slice(0, 5),
          evaluation_method: "local_fallback"
        };
        source = "local_ppt_analyzer";
      } else if (agentType === "content_originality_analyzer") {
        const slidesText = JSON.stringify((input as any).slides_text || "").toLowerCase();
        const answersText = JSON.stringify((input as any).interview_qa || "").toLowerCase();

        let score = 95;
        const flags = [];

        // 1. Check for thin/placeholder pitch deck
        if (slidesText.includes("slide 1: smartrecruit project") || (slidesText.length > 0 && slidesText.split(/\s+/).length < 50)) {
          score -= 15;
          flags.push({
            type: "template-plagiarism",
            severity: "medium",
            evidence: "Pitch deck matches generic boilerplate structure or has extremely low word count."
          });
        }

        // 2. Check for weak answers
        if (answersText.includes("identical in typescript") || answersText.includes("re-renders if state or props change") || (answersText.length > 0 && answersText.split(/\s+/).length < 60)) {
          score -= 10;
          flags.push({
            type: "style-consistency",
            severity: "low",
            evidence: "Interview answers are unusually brief, lacking technical depth expected of the profile."
          });
        }

        let risk = "low";
        if (score < 60) risk = "high";
        else if (score < 85) risk = "medium";

        responseObj = {
          originality_score: score,
          risk_level: risk,
          flags: flags,
          evaluation_method: "local_fallback"
        };
        source = "local_originality_analyzer";
      } else if (agentType === "career_guidance") {
        const talentProfile = (input as any).talent_profile || {};
        const resume = talentProfile.resume || {};
        const candidateSkills: string[] = Array.isArray(resume.skills) ? resume.skills : [];
        const scoreObj = (input as any).talent_score || {};
        const overallScore = typeof scoreObj.overallScore === "number" ? scoreObj.overallScore : 50;

        const isBackend = candidateSkills.some(s => /node|python|django|fastapi|postgres/i.test(s)) && !candidateSkills.some(s => /react|next\.js/i.test(s));
        const isFullstackOrFrontend = candidateSkills.some(s => /react|next\.js|typescript/i.test(s));

        const gaps = [];
        if (isFullstackOrFrontend) {
          if (!candidateSkills.some(s => /docker|aws/i.test(s))) {
            gaps.push({
              skill: "Cloud Deployment & DevOps",
              current_level: "Beginner",
              target_level: "Intermediate",
              why: "Candidate has strong fullstack/frontend skills but lacks explicit cloud or containerization experience in their profile."
            });
          } else {
            gaps.push({
              skill: "Advanced System Architecture",
              current_level: "Intermediate",
              target_level: "Advanced",
              why: "Recommended for fullstack developers looking to transition to leadership roles."
            });
          }
        } else if (isBackend) {
          gaps.push({
            skill: "Asynchronous Python & Distributed Queues",
            current_level: "Intermediate",
            target_level: "Advanced",
            why: "Candidate works with Python/FastAPI but lacks production scale queues (e.g. Celery/Redis) in their profile."
          });
        }

        if (gaps.length === 0) {
          gaps.push({
            skill: "System Design & Architecture",
            current_level: "Intermediate",
            target_level: "Advanced",
            why: "To progress to a senior level, candidate should focus on designing scalable distributed systems."
          });
        }

        const certs = [];
        if (!candidateSkills.some(s => /aws/i.test(s))) {
          certs.push({
            name: "AWS Certified Developer - Associate",
            provider: "Amazon Web Services",
            reason: "Validates cloud deployment capabilities, bridging candidate's cloud engineering gap."
          });
        } else {
          certs.push({
            name: "AWS Certified Solutions Architect - Professional",
            provider: "Amazon Web Services",
            reason: "Advanced certification matching candidate's existing AWS and architecture background."
          });
        }

        responseObj = {
          skill_gaps: gaps,
          recommended_certifications: certs,
          career_roadmap: [
            {
              stage: "Skill Deepening & Gaps",
              timeframe: "1-3 months",
              milestones: [
                `Address the identified gap in ${gaps[0]?.skill || "advanced system design"}.`,
                "Earn core engineering skill badges in Hirespark."
              ]
            },
            {
              stage: "Professional Certification",
              timeframe: "3-6 months",
              milestones: [
                `Prepare for and obtain ${certs[0]?.name || "AWS Developer Certification"}.`,
                "Build and deploy a public portfolio showcasing these technologies."
              ]
            }
          ],
          reasoning: `Based on a talent score of ${overallScore}% and current stack, the candidate is well-positioned to step up to cloud-native development.`,
          evaluation_method: "local_fallback"
        };
        source = "local_career_guidance";
      } else if (agentType === "resume_builder") {
        const targetCompany = (input as any).target_company || null;
        const talentProfile = (input as any).talent_profile || {};
        const resumeData = talentProfile.resume_data || (input as any).resume_data || {};
        const rawResume = talentProfile.resume || {};

        const isMockName = rawResume.name === "Candidate User";
        const isMockCompany = rawResume.experience?.[0]?.company === "HireSpark Partner";

        const candidateName = (resumeData.name && resumeData.name !== "Candidate User" ? resumeData.name : null)
          || (!isMockName && rawResume.name ? rawResume.name : null)
          || talentProfile.name
          || "Candidate User";

        const email = (resumeData.email && !resumeData.email.includes("hirespark.com") ? resumeData.email : null)
          || (!isMockName && rawResume.email ? rawResume.email : null)
          || talentProfile.email
          || "candidate@hirespark.com";

        const phone = resumeData.phone || (!isMockName ? rawResume.phone : null) || talentProfile.phone || "";
        const location = resumeData.location || (!isMockName ? rawResume.location : null) || talentProfile.location || "";

        const skillsSet = new Set<string>();
        if (Array.isArray(resumeData.skills)) resumeData.skills.forEach((s: any) => typeof s === "string" && s.trim() && skillsSet.add(s.trim()));
        if (!isMockName && Array.isArray(rawResume.skills)) rawResume.skills.forEach((s: any) => typeof s === "string" && s.trim() && skillsSet.add(s.trim()));
        const githubLangs = talentProfile.github?.languages || {};
        Object.keys(githubLangs).forEach((lang) => skillsSet.add(lang));
        const skills = Array.from(skillsSet);

        let experience = Array.isArray(resumeData.experience) && resumeData.experience.length > 0
          ? resumeData.experience
          : (!isMockCompany && Array.isArray(rawResume.experience) ? rawResume.experience : []);

        if (experience.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
          experience = [
            {
              company: "Independent Software Developer",
              role: "Full Stack Developer",
              start_date: "2022",
              end_date: "Present",
              description: `Developed and deployed ${talentProfile.github.repositories.length}+ software repositories specializing in ${skills.slice(0, 3).join(", ") || "full-stack development"}.`
            }
          ];
        }

        let education = Array.isArray(resumeData.education) && resumeData.education.length > 0
          ? resumeData.education
          : (!isMockName && Array.isArray(rawResume.education) ? rawResume.education : []);

        let projects = Array.isArray(resumeData.projects) && resumeData.projects.length > 0
          ? resumeData.projects
          : (!isMockName && Array.isArray(rawResume.projects) ? rawResume.projects : []);

        if (projects.length === 0 && Array.isArray(talentProfile.github?.repositories) && talentProfile.github.repositories.length > 0) {
          projects = talentProfile.github.repositories.slice(0, 4).map((repo: any) => ({
            name: repo.name || "Software Project",
            description: repo.description || `Open-source project built with ${repo.primary_language || "TypeScript"}.`,
            technologies: repo.primary_language ? [repo.primary_language] : skills.slice(0, 3)
          }));
        }

        const certifications = Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0
          ? resumeData.certifications
          : (!isMockName && Array.isArray(rawResume.certifications) ? rawResume.certifications : []);

        let summaryText = `Results-driven software professional specializing in ${skills.slice(0, 4).join(", ") || "software engineering"}. Proven track record of delivering high-quality web services and products.`;
        if (targetCompany) {
          summaryText += ` (Tailored for ${targetCompany.toUpperCase()})`;
        }

        responseObj = {
          name: candidateName,
          contact: {
            email,
            phone,
            location,
            github: talentProfile.github_username || null
          },
          summary: summaryText,
          experience: experience.map((exp: any) => ({
            company: exp.company || "Software Company",
            role: exp.role || "Software Developer",
            start_date: String(exp.start_date || exp.start_year || "2022"),
            end_date: exp.end_date ? String(exp.end_date) : "Present",
            description: exp.description || "Contributed to core application design, implementation, and deployment."
          })),
          education: education.map((edu: any) => ({
            institution: edu.institution || "University",
            degree: edu.degree || "Bachelor of Science",
            field: edu.field || "Computer Science",
            start_year: typeof edu.start_year === "number" ? edu.start_year : 2020,
            end_year: typeof edu.end_year === "number" ? edu.end_year : 2024,
            gpa: edu.gpa ? String(edu.gpa) : null
          })),
          projects: projects.map((proj: any) => ({
            name: proj.name || "Full Stack Application",
            description: proj.description || "Designed and built responsive software solutions.",
            technologies: Array.isArray(proj.technologies) ? proj.technologies : skills.slice(0, 3)
          })),
          skills: skills,
          certifications: certifications.map((c: any) => ({
            name: c.name || "Technical Certification",
            issuer: c.issuer || "Authority",
            year: typeof c.year === "number" ? c.year : null
          })),
          target_company: targetCompany,
          evaluation_method: "local_fallback"
        };
        source = "local_resume_builder";
      } else {
        throw new Error(`All model paths failed. Ollama error: ${ollamaErr.message}. Hugging Face error: ${hfErr.message}`);
      }
    }
  }


  // 4. On success, write result to agent_responses cache
  try {
    console.log(`[Cache Write] Writing response to cache. Hash: ${inputHash}`);
    await adminClient.from("agent_responses").upsert({
      agent_type: agentType,
      input_hash: inputHash,
      input_payload: input,
      response: responseObj,
      created_at: new Date().toISOString(),
    }, {
      onConflict: "agent_type,input_hash"
    });
  } catch (err) {
    console.error("Failed to cache agent response to database:", err);
  }

  return responseObj;
}
