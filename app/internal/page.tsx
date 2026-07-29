"use client";

import React, { useState, useEffect } from "react";
import { submitAgentTest, testGitHubIngestion, testResumePDFUpload, testTalentScoring, testBadgesVerification, testCompletenessCalculation } from "./actions";

const AGENT_PRESETS = [
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
      raw_ocr_text: "Shikha Singh - Full Stack Engineer. Experience: 3 years building AI applications with React, Next.js, Node.js, and Postgres. Lead developer for multiple hackathons.",
      target_role: "Senior AI Platform Developer"
    }
  },
  {
    type: "interviewAgent",
    label: "Interview Analysis Agent",
    defaultPayload: {
      candidate_id: "uuid-candidate-123",
      transcript: "Interviewer: How do you handle RLS in Supabase?\nCandidate: I set up restrictive policies matching auth.uid() with the user_id column. For system services, I use the service_role key to bypass RLS safely on secure server routes.",
      communication_skills_rating: 9,
      technical_skills_rating: 9
    }
  },
  {
    type: "fraudAgent",
    label: "Fraud & Content Auditor",
    defaultPayload: {
      candidate_id: "uuid-candidate-123",
      submitted_documents: [
        { type: "resume", character_count: 2400, perplexity_score: 12.5 },
        { type: "github_contribution", prs_merged: 42 }
      ],
      ai_content_likelihood: "low"
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
    type: "resume_upload",
    label: "Resume Upload Pipeline",
    defaultPayload: {
      note: "Use the file upload field below to parse a PDF resume."
    }
  },
  {
    type: "talent_score_pipeline",
    label: "Talent Score Pipeline",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },
  {
    type: "skill_badges_pipeline",
    label: "Verified Skill Badges",
    defaultPayload: {
      candidateId: "0ee73e0e-0529-4480-a16c-15748a277bde"
    }
  },
  {
    type: "profile_completeness_pipeline",
    label: "Profile Completeness",
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
      if (agentType === "github_ingestion") {
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
      } else if (agentType === "resume_upload") {
        if (!uploadFile) {
          setErrorMsg("Please select a PDF resume file to upload.");
          setIsLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", uploadFile);
        const res = await testResumePDFUpload(formData);
        setIsLoading(false);
        if (res.success) {
          setResult({
            response: {
              extractedRawTextSnippet: res.rawText,
              parsedResumeData: res.resumeData,
              needsManualReview: res.needsReview
            },
            cachedRows: []
          });
        } else {
          setErrorMsg(res.error || "Resume parsing failed.");
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
              Ollama: qwen2.5:7b-instruct
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
              HF Fallback: Enabled
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
                  key={preset.type}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all ${
                    agentType === preset.type
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

            {agentType === "resume_upload" ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-350">Select PDF Resume File</label>
                <input
                  type="file"
                  accept=".pdf"
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
              {result && (
                <span className="text-xs text-purple-400 font-semibold">
                  {result.cachedRows.length} rows written for {activeAgentType}
                </span>
              )}
            </div>
            <div className="mt-4 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs flex-1 min-h-[200px] overflow-auto max-h-[350px]">
              {result && result.cachedRows.length > 0 ? (
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
