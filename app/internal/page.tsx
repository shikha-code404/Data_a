"use client";

import React, { useState, useEffect } from "react";
import {
  submitAgentTest,
  testGitHubIngestion,
  testResumePDFUpload,
  testTalentScoring,
  testBadgesVerification,
  testCompletenessCalculation,
  testCandidateEmbeddingAction,
  testJobEmbeddingAction,
  testMatchingEngineAction,
  testRecruiterSearchAction,
  testCreateJobFlowAction,
  testSkillVerificationAction,
  testInterviewGenerationAction,
  testInterviewSubmitAction,
  testTeamContributionsAction,
  testPitchDeckAnalysis,
  testPitchDeckAnalysisPreset,
  testFraudDetectionAction,
  testAuthenticityScoreAction,
} from "./actions";

const AGENT_PRESETS = [
  {
    type: "authenticity_score",
    label: "🚀 Phase 4: Authenticity Score & Fraud Report",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
    }
  },
  {
    type: "fraud_detection_check",
    label: "🚀 Phase 4: Fraud Detection Check",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
    }
  },
  {
    type: "pitch_deck_analyzer_thin",
    label: "🚀 Phase 4: Pitch Deck — Thin Deck",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      slidesText: [
        "Slide 1: SmartRecruit project",
        "Slide 2: We use React to build interfaces.",
        "Slide 3: That is all. Simple resume parser."
      ]
    }
  },
  {
    type: "pitch_deck_analyzer_detailed",
    label: "🚀 Phase 4: Pitch Deck — Detailed Deck",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      slidesText: [
        "Slide 1: SmartRecruit - AI-driven Enterprise Talent Acquisition System",
        "Slide 2: Problem & Solution. Traditional recruiting is slow. SmartRecruit uses a robust pipeline. We ingest GitHub repositories and parse developer portfolios using NLP models, generating a vector space embedding for matching.",
        "Slide 3: Technology Stack & Core Architecture. Built using Next.js App Router, TypeScript, and Supabase Postgres. Vector similarities are calculated in pgvector with cosine similarity. LLMs are integrated via the CallAgent abstraction, utilizing Ollama's qwen3.5:9b locally, and falling back to Hugging Face APIs.",
        "Slide 4: Business Potential & Market Strategy. Targeting mid-to-large tech companies. Our subscription SaaS model charges per seat. Initial traction shows a 40% decrease in screening time during pilot testing.",
        "Slide 5: Conclusions & Growth Milestones. Raising $1M seed funding to expand the ML feature set and scale backend ingestion servers. Expected milestones include integration with major ATS software by Q4."
      ]
    }
  },
  {
    type: "pitch_deck_analyzer_upload",
    label: "🚀 Phase 4: Pitch Deck — File Upload",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },
  {
    type: "skill_verification_pass",
    label: "⭐ Phase 3: Skill Verify — React PASS",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      skill: "React",
      mode: "pass"
    }
  },
  {
    type: "skill_verification_fail",
    label: "⭐ Phase 3: Skill Verify — SQL FAIL",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      skill: "SQL",
      mode: "fail"
    }
  },
  {
    type: "interview_generate",
    label: "⭐ Phase 3: Interview — Generate Questions",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },
  {
    type: "interview_submit_strong",
    label: "⭐ Phase 3: Interview — Submit STRONG Answers",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      mode: "strong"
    }
  },
  {
    type: "interview_submit_weak",
    label: "⭐ Phase 3: Interview — Submit WEAK Answers",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde",
      mode: "weak"
    }
  },
  {
    type: "team_analytics_balanced",
    label: "⭐ Phase 3: Team Analytics — Balanced Team (A, B, C)",
    defaultPayload: {
      teamId: "hackathon-team-1",
      memberIds: [
        "0ee73e0e-0529-4480-a16c-15748a277bde",
        "1ee73e0e-0529-4480-a16c-15748a277bdf",
        "2ee73e0e-0529-4480-a16c-15748a277be0"
      ]
    }
  },
  {
    type: "team_analytics_unbalanced",
    label: "⭐ Phase 3: Team Analytics — Unbalanced Team (A, C)",
    defaultPayload: {
      teamId: "hackathon-team-2",
      memberIds: [
        "0ee73e0e-0529-4480-a16c-15748a277bde",
        "2ee73e0e-0529-4480-a16c-15748a277be0"
      ]
    }
  },
  {
    type: "recruiter_job_creation_flow",
    label: "Recruiter: Job Creation & Auto-Matching Flow",
    defaultPayload: {
      title: "Senior Full Stack AI Developer",
      description: "Build intelligent candidate matching applications with Next.js App Router, Supabase vector embeddings, and TypeScript.",
      skills: "React, Next.js, Supabase, TypeScript",
      location: "Remote"
    }
  },
  {
    type: "candidate_embedding",
    label: "Phase 2: Candidate Embedding (@xenova)",
    defaultPayload: {
      userId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },

  {
    type: "job_embedding",
    label: "Phase 2: Job Embedding (@xenova)",
    defaultPayload: {
      title: "Senior Full Stack Engineer",
      company: "Hirespark Labs",
      description: "Building next-gen AI recruitment platforms with Next.js, Supabase, and Transformers.",
      skills: "React, Next.js, TypeScript, Supabase"
    }
  },
  {
    type: "matching_engine",
    label: "Phase 2: Hybrid Matching Engine",
    defaultPayload: {
      jobId: "default-test-job-id",
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },
  {
    type: "recruiter_nl_search",
    label: "Copilot Rehearsed 1: React + Hackathons",
    defaultPayload: {
      query: "Find React developers with hackathon experience"
    }
  },
  {
    type: "recruiter_nl_search",
    label: "Copilot Rehearsed 2: ML + GitHub Activity",
    defaultPayload: {
      query: "Show ML engineers with strong GitHub activity"
    }
  },
  {
    type: "recruiter_nl_search",
    label: "Copilot Rehearsed 3: Score > 85",
    defaultPayload: {
      query: "Find candidates above 85 talent score"
    }
  },
  {
    type: "talentScoreAgent",
    label: "Talent Score Agent",
    defaultPayload: {
      github_username: "shikha-singh",
      repositories: [
        { name: "next-ai-platform", stars: 12, forks: 4, main_language: "TypeScript" },
        { name: "supabase-rls-helper", stars: 25, forks: 2, main_language: "SQL" }
      ],
      years_experience: 3
    }
  },
  {
    type: "resumeAgent",
    label: "Resume Parsing Agent",
    defaultPayload: {
      raw_ocr_text: "Shikha Singh - Full Stack Engineer. Experience: 3 years building AI applications with React, Next.js, Node.js, and Postgres.",
      target_role: "Senior AI Platform Developer"
    }
  },
  {
    type: "github_ingestion",
    label: "GitHub Ingestion Pipeline",
    defaultPayload: {
      username: "alexrivera-dev"
    }
  },
  {
    type: "talent_score_pipeline",
    label: "Talent Score Pipeline",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  }
];


export default function DebugRoute() {
  const [selectedPreset, setSelectedPreset] = useState(AGENT_PRESETS[0]);
  const [agentType, setAgentType] = useState(AGENT_PRESETS[0].type);
  const [customAgentType, setCustomAgentType] = useState("");
  const [payloadText, setPayloadText] = useState(JSON.stringify(AGENT_PRESETS[0].defaultPayload, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const activeAgentType = agentType === "custom" ? customAgentType : agentType;

  // Handle Preset Change
  const handlePresetSelect = (preset: typeof AGENT_PRESETS[0]) => {
    setSelectedPreset(preset);
    setAgentType(preset.type);
    setPayloadText(JSON.stringify(preset.defaultPayload, null, 2));
    setErrorMsg(null);
    setUploadFile(null);
  };

  // Submit test
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      if (agentType === "skill_verification_pass" || agentType === "skill_verification_fail") {
        const payload = JSON.parse(payloadText);
        const mode: "pass" | "fail" = payload.mode === "fail" ? "fail" : "pass";
        const res = await testSkillVerificationAction(
          payload.candidateId,
          payload.skill,
          mode
        );
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Skill Verification failed.");
        }
      } else if (agentType === "interview_generate") {
        const payload = JSON.parse(payloadText);
        const res = await testInterviewGenerationAction(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Interview Question Generation failed.");
        }
      } else if (agentType === "interview_submit_strong" || agentType === "interview_submit_weak") {
        const payload = JSON.parse(payloadText);
        const mode: "strong" | "weak" = agentType === "interview_submit_weak" ? "weak" : "strong";
        const res = await testInterviewSubmitAction(payload.candidateId, mode);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Interview Evaluation failed.");
        }
      } else if (agentType === "team_analytics_balanced" || agentType === "team_analytics_unbalanced") {
        const payload = JSON.parse(payloadText);
        const res = await testTeamContributionsAction(payload.teamId, payload.memberIds);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Team Contributions Analytics failed.");
        }
      } else if (agentType === "recruiter_job_creation_flow") {

        const payload = JSON.parse(payloadText);
        const res = await testCreateJobFlowAction(payload.title, payload.description, payload.skills, payload.location);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Job creation flow failed.");
        }
      } else if (agentType === "candidate_embedding") {
        const payload = JSON.parse(payloadText);
        const res = await testCandidateEmbeddingAction(payload.userId);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Candidate Embedding failed.");
        }
      } else if (agentType === "job_embedding") {
        const payload = JSON.parse(payloadText);
        const res = await testJobEmbeddingAction(payload.title, payload.company, payload.description, payload.skills);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Job Embedding failed.");
        }
      } else if (agentType === "matching_engine") {
        const payload = JSON.parse(payloadText);
        const res = await testMatchingEngineAction(payload.jobId, payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res });
        } else {
          setErrorMsg(res.error || "Matching Engine failed.");
        }
      } else if (agentType === "recruiter_nl_search") {
        const payload = JSON.parse(payloadText);
        const res = await testRecruiterSearchAction(payload.query);
        setIsLoading(false);
        if (res.success) {
          setResult({ response: res.results, query: res.query });
        } else {
          setErrorMsg(res.error || "Recruiter Search failed.");
        }
      } else if (agentType === "github_ingestion") {
        const payload = JSON.parse(payloadText);
        const res = await testGitHubIngestion(payload.username);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.githubData,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "GitHub Ingestion failed.");
        }
      } else if (agentType === "talent_score_pipeline") {
        const payload = JSON.parse(payloadText);
        const res = await testTalentScoring(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.talentScore,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "Talent Scoring failed.");
        }

      } else if (agentType === "skill_badges_pipeline") {
        const payload = JSON.parse(payloadText);
        const res = await testBadgesVerification(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.badges,
            cachedRows: []
          });
        } else {
          setErrorMsg(res.error || "Skill Badges Verification failed.");
        }
      } else if (agentType === "profile_completeness_pipeline") {
        const payload = JSON.parse(payloadText);
        const res = await testCompletenessCalculation(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.completeness,
            cachedRows: []
          });
        } else {
          setErrorMsg(res.error || "Profile completeness calculation failed.");
        }
      } else if (agentType === "pitch_deck_analyzer_thin" || agentType === "pitch_deck_analyzer_detailed") {
        const payload = JSON.parse(payloadText);
        const label = agentType === "pitch_deck_analyzer_thin" ? "Thin Pitch Deck" : "Detailed Pitch Deck";
        const res = await testPitchDeckAnalysisPreset(payload.candidateId, payload.slidesText, label);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.analysis,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "Pitch Deck Analysis Preset failed.");
        }
      } else if (agentType === "pitch_deck_analyzer_upload") {
        if (!uploadFile) {
          setErrorMsg("Please select a file to upload.");
          setIsLoading(false);
          return;
        }
        const payload = JSON.parse(payloadText);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("team_id_or_candidate_id", payload.candidateId);
        
        const res = await testPitchDeckAnalysis(formData);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.analysis,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "Pitch Deck Analysis Upload failed.");
        }
      } else if (agentType === "fraud_detection_check") {
        const payload = JSON.parse(payloadText);
        const res = await testFraudDetectionAction(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.report,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "Fraud Detection check failed.");
        }
      } else if (agentType === "authenticity_score") {
        const payload = JSON.parse(payloadText);
        const res = await testAuthenticityScoreAction(payload.candidateId);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: res.report,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "Authenticity Score check failed.");
        }
      } else {
        if (agentType === "custom" && !customAgentType.trim()) {
          setErrorMsg("Please specify a custom agent type.");
          setIsLoading(false);
          return;
        }

        const res = await submitAgentTest(activeAgentType, payloadText);
        setIsLoading(false);

        if (res.success) {
          setResult({
            response: res.response,
            cachedRows: res.cachedRows
          });
        } else {
          setErrorMsg(res.error || "An unknown error occurred.");
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 selection:bg-purple-600 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">Developer Console</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mt-1">
              Phase 0 Agent Playground
            </h1>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Ollama: qwen3.5:9b
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
              HF Fallback: Enabled
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Phase 3: Verification
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <section className="lg:col-span-5 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-200">1. Select Agent Template</h2>
            <p className="text-xs text-slate-400 mt-1">Select a predefined agent preset or specify a custom type</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {AGENT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all ${
                    agentType === preset.type && payloadText.includes(JSON.stringify(preset.defaultPayload).slice(0, 15))
                      ? "bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-md"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAgentType("custom");
                  setPayloadText("{\n  \"message\": \"Enter custom payload here\"\n}");
                  setErrorMsg(null);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all col-span-2 ${
                  agentType === "custom"
                    ? "bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-md"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                Custom Agent Configuration
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {agentType === "custom" && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Custom Agent Type</label>
                <input
                  type="text"
                  placeholder="e.g. matchingScoringAgent"
                  value={customAgentType}
                  onChange={(e) => setCustomAgentType(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
              </div>
            )}

            {agentType === "resume_upload" || agentType === "pitch_deck_analyzer_upload" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">
                  {agentType === "resume_upload" ? "Select PDF Resume File" : "Select Pitch Deck File (PDF, PPTX)"}
                </label>
                <input
                  type="file"
                  accept={agentType === "resume_upload" ? ".pdf" : ".pdf,.pptx,.ppt"}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition file:bg-slate-900 file:border-slate-800 file:text-slate-200 file:text-xs file:py-1 file:px-2.5 file:rounded file:mr-2"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">Input Payload (JSON)</label>
                <textarea
                  rows={10}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono text-xs text-purple-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition leading-relaxed"
                />
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg p-3">
                <p className="font-semibold">Execution Failed</p>
                <p className="mt-1 opacity-90">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isLoading
                  ? "bg-purple-600/40 text-purple-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30 hover:scale-[1.01]"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Invoking AI Agent...
                </>
              ) : (
                "Run Agent Pipeline"
              )}
            </button>
          </form>
        </section>

        {/* Right Output Column */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Raw Output */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-slate-200">2. Agent Structured JSON Response</h2>
            <div className="mt-4 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs flex-1 min-h-[250px] overflow-auto max-h-[450px]">
              {result ? (
                <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  Run the agent to inspect the parsed structured response
                </div>
              )}
            </div>
          </div>

          {/* Card 2: DB Cache */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-200">3. Cached Database Entries</h2>
              {result && Array.isArray(result.cachedRows) && (
                <span className="text-xs text-purple-400 font-semibold">
                  {result.cachedRows.length} rows written for {activeAgentType}
                </span>
              )}
            </div>
            <div className="mt-4 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs flex-1 min-h-[200px] overflow-auto max-h-[350px]">
              {result && Array.isArray(result.cachedRows) && result.cachedRows.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {result.cachedRows.map((row: any, idx: number) => (
                    <div key={row.id || idx} className="border-b border-slate-800/80 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                        <span className="bg-slate-800/60 px-2 py-0.5 rounded text-purple-300">
                          ID: {row.id}
                        </span>
                        <span>
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Normalized Input Hash</p>
                          <p className="text-[11px] text-yellow-500/80 break-all">{row.input_hash}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Payload Content</p>
                          <pre className="text-[10px] text-slate-300 truncate max-w-full">
                            {JSON.stringify(row.input_payload)}
                          </pre>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cached Response Block</p>
                        <pre className="text-[11px] text-green-300 bg-slate-900/60 p-2 rounded overflow-x-auto max-h-[150px]">
                          {JSON.stringify(row.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  Run the agent to inspect the cached Rows in agent_responses table
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
