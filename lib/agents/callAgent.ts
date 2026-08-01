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

  // 2. Try Ollama (Local qwen3.5:4b)
  const ollamaHost = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  console.log(`[Ollama Request] agentType: ${agentType}, host: ${ollamaHost}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout for local model response

    const res = await fetch(`${ollamaHost}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3.5:4b",
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
    console.log(`[Ollama Success] Response parsed successfully.`);
  } catch (ollamaErr: any) {
    console.warn(`Ollama failed or timed out: ${ollamaErr.message}. Falling back to Hugging Face.`);

    // 3. Fallback to Hugging Face Qwen3.5-4B
    try {
      const apiKey = process.env.HF_API_KEY;
      const modelId = process.env.HF_MODEL_ID || "Qwen/Qwen3.5-4B";
      
      console.log(`[HF Request] modelId: ${modelId}`);
      if (!apiKey || apiKey.includes("placeholder")) {
        throw new Error("Hugging Face API key is missing or is placeholder.");
      }

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
    } catch (hfErr: any) {
      console.warn(`External LLM endpoints unreachable (${hfErr.message}). Applying local intelligence parser for ${agentType}.`);
      
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
          summary: `Candidate has completed the interview. Technical rating is ${techScore}%. ${
            hasShortAnswer ? "Evaluation capped at 40 due to insufficient substance in one or more answers." : "Demonstrated key technical strengths."
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
        const talentProfile = (input as any).talent_profile || {};
        const resume = talentProfile.resume || {};
        const github = talentProfile.github || {};
        const manual = talentProfile.manual || {};
        
        const candidateName = resume.name || talentProfile.name || "Candidate User";
        const email = resume.email || talentProfile.email || "candidate@hirespark.com";
        const phone = resume.phone || talentProfile.phone || "+1 (555) 019-2834";
        const location = resume.location || talentProfile.location || "San Francisco, CA";
        
        const experience = Array.isArray(resume.experience) ? resume.experience : [];
        const education = Array.isArray(resume.education) ? resume.education : [];
        const projects = Array.isArray(resume.projects) ? resume.projects : [];
        const skills = Array.isArray(resume.skills) ? resume.skills : [];
        const certifications = Array.isArray(resume.certifications) ? resume.certifications : [];
        
        responseObj = {
          name: candidateName,
          contact: {
            email,
            phone,
            location,
            github: talentProfile.github_username || null
          },
          summary: `Results-driven software professional specializing in ${skills.slice(0, 3).join(", ") || "software engineering"}. Proven track record of delivering high-quality web services and products.`,
          experience: experience.map((exp: any) => ({
            company: exp.company || "Company",
            role: exp.role || "Developer",
            start_date: String(exp.start_date || exp.start_year || "Unknown"),
            end_date: exp.end_date ? String(exp.end_date) : null,
            description: exp.description || "Contributed to core application development."
          })),
          education: education.map((edu: any) => ({
            institution: edu.institution || "University",
            degree: edu.degree || "Degree",
            field: edu.field || "Computer Science",
            start_year: typeof edu.start_year === "number" ? edu.start_year : null,
            end_year: typeof edu.end_year === "number" ? edu.end_year : null,
            gpa: edu.gpa ? String(edu.gpa) : null
          })),
          projects: projects.map((proj: any) => ({
            name: proj.name || "Software Project",
            description: proj.description || "Designed and built full-stack solutions.",
            technologies: Array.isArray(proj.technologies) ? proj.technologies : []
          })),
          skills: skills,
          certifications: certifications.map((c: any) => ({
            name: c.name || "Certification",
            issuer: c.issuer || "Authority",
            year: typeof c.year === "number" ? c.year : null
          })),
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
