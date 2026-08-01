"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Info, 
  Check, 
  ExternalLink,
  Mail,
  Link as LinkIcon,
  MapPin,
  FileCheck
} from "lucide-react";

interface Experience {
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  start_year?: number | null;
  end_year?: number | null;
  gpa?: string | null;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

interface Certification {
  name: string;
  issuer: string;
  year?: number | null;
}

interface ResumeData {
  name: string;
  contact: {
    email: string | null;
    phone: string | null;
    location: string | null;
    github?: string | null;
  };
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
}

const emptyResumeData: ResumeData = {
  name: "",
  contact: {
    email: "",
    phone: "",
    location: "",
    github: null
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: []
};

interface TalentScoreData {
  overall: number;
  scores: Record<string, number>;
  reasoning?: string;
}

import { useAuth } from "@/lib/auth-context";
import { getCandidateProfileData, getGeneratedResumeAction } from "../actions";

function normalizeResumeData(raw: any): ResumeData {
  if (!raw) return emptyResumeData;
  const contact = raw.contact || {
    email: raw.email || null,
    phone: raw.phone || null,
    location: raw.location || null,
    github: raw.github || null
  };
  return {
    name: raw.name || "",
    contact: {
      email: contact.email || null,
      phone: contact.phone || null,
      location: contact.location || null,
      github: contact.github || null
    },
    summary: raw.summary || "",
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    education: Array.isArray(raw.education) ? raw.education : [],
    projects: Array.isArray(raw.projects) ? raw.projects : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : []
  };
}


export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [parsedData, setParsedData] = useState<ResumeData>(emptyResumeData);
  const [talentScore, setTalentScore] = useState<TalentScoreData | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"structure" | "pdf">("structure");
  const { candidate_id } = useAuth();

  const loadResumeMetadata = async () => {
    const res = await getCandidateProfileData();
    if (res.success) {
      if (res.talentScore) {
        setTalentScore(res.talentScore as TalentScoreData);
      }
      if (res.githubUsername) {
        setGithubUsername(res.githubUsername);
      }
      if (res.resumeData && !resumeId) {
        setParsedData(normalizeResumeData(res.resumeData));
      }
    }
  };

  const loadOrGenerateResume = async (companyId: string | null, forceFresh = false) => {
    if (!candidate_id) return;
    setIsLoading(true);
    setUploadStatus("Checking cache or generating resume variant...");
    try {
      const templateName = selectedTemplate === "modern" ? "Modern" : "Minimal";

      // 1. Try to fetch cached variant first
      if (!forceFresh) {
        const cachedRes = await getGeneratedResumeAction(templateName, companyId);
        if (cachedRes.success && cachedRes.resume) {
          setParsedData(normalizeResumeData(cachedRes.resume.resume_json));
          setResumeId(cachedRes.resume.id);
          setUploadStatus("Loaded resume variant successfully.");
          setIsLoading(false);
          return;
        }
      }

      // 2. Generate new tailored resume
      setUploadStatus(`Generating ATS-optimized resume for ${companyId ? companyId.toUpperCase() : "General"}...`);
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id,
          template: templateName,
          target_company: companyId,
          force_fresh: forceFresh
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.resume_json) {
        setParsedData(normalizeResumeData(data.resume_json));
        setResumeId(data.resume_id);
        setUploadStatus(`Resume generated successfully for ${companyId ? companyId.toUpperCase() : "General"}!`);
      } else {
        setResumeId(null);
        setUploadStatus(`Failed to generate resume: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error(err);
      setResumeId(null);
      setUploadStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      loadResumeMetadata();
    }
  }, [candidate_id]);

  useEffect(() => {
    if (candidate_id) {
      loadOrGenerateResume(selectedCompany, false);
    } else {
      setIsLoading(false);
    }
  }, [candidate_id, selectedCompany, selectedTemplate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadStatus("Error: Please select a valid .pdf file.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading PDF resume and extracting text...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/candidate/resume", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.parsed_resume) {
        setUploadStatus(`Success! Resume '${file.name}' uploaded and parsed. Generating new optimized variant...`);
        // Trigger a fresh generation for the currently selected company
        await loadOrGenerateResume(selectedCompany, true);
        await loadResumeMetadata();
      } else {
        setUploadStatus(`Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      console.error("Resume upload failed:", err);
      setUploadStatus(`Upload error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!candidate_id) return;
    setUploadStatus("Retrieving ATS-optimized resume...");
    try {
      const templateName = selectedTemplate === "modern" ? "Modern" : "Minimal";
      const res = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id,
          template: templateName,
          target_company: selectedCompany,
          force_fresh: false // quickly fetch cached variant ID
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.resume_id) {
        setUploadStatus("Resume ready! Opening print window...");
        window.open(`/api/resume/${data.resume_id}/download`, "_blank");
      } else {
        setUploadStatus(`Failed to retrieve resume: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto w-full px-4 md:px-0 text-[#e5e2e1] font-sans print:p-0">
      {/* Header (hidden on print) */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#353534]/50 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#D2042D]" />
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F5]">Resume Builder &amp; PDF Parser</h1>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-5 py-2.5 bg-[#2B2B2B] hover:bg-[#353535] border border-[#353535] text-[#F5F5F5] rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-[#D2042D]" /> : <Upload className="w-4 h-4 text-[#A3A3A3]" />}
            <span>{isUploading ? "Parsing PDF..." : "Upload PDF Resume"}</span>
          </button>
        </div>
      </header>

      {/* Upload Status Banner (hidden on print) */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border print:hidden ${
          uploadStatus.startsWith("Success")
            ? "bg-[#064e3b]/30 border-[#059669]/50 text-[#34d399]"
            : uploadStatus.startsWith("Error")
            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
            : "bg-[#2B2B2B] border-[#353535] text-[#F5F5F5]"
        }`}>
          {uploadStatus.startsWith("Success") ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <Sparkles className="w-4 h-4 shrink-0 text-[#D2042D]" />}
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Talent Score + GitHub Summary Card (hidden on print) */}
      {!isLoading && (talentScore || githubUsername) && (
        <div className="bg-[#262626] border border-[#353535] rounded-xl p-5 flex flex-col md:flex-row gap-6 print:hidden">
          {/* Talent Score */}
          {talentScore && (
            <div className="flex items-center gap-5 flex-1">
              <div className="flex flex-col items-center justify-center min-w-[80px]">
                <span className="text-[40px] font-extrabold text-[#D2042D] leading-none tracking-tighter">{talentScore.overall}</span>
                <span className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider mt-1">Talent Score</span>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                {Object.entries(talentScore.scores || {}).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#A3A3A3] font-semibold capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-[#F5F5F5] font-bold">{value}</span>
                    </div>
                    <div className="h-1 bg-[#353535] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D2042D] rounded-full transition-all" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Badge */}
          {githubUsername && (
            <div className="flex items-center gap-3 border-l border-[#353535] pl-5">
              <img src={`https://avatars.githubusercontent.com/${githubUsername}`} alt="GitHub" className="w-10 h-10 rounded-full border border-[#353535]" />
              <div>
                <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#F5F5F5] hover:text-[#D2042D] transition-colors flex items-center gap-1">
                  @{githubUsername}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-[#A3A3A3]">GitHub Connected</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 print:hidden">
          <Loader2 className="w-8 h-8 animate-spin text-[#D2042D]" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: Settings / Templates (hidden on print) */}
        <aside className="lg:col-span-4 flex flex-col gap-6 print:hidden">
          <div className="bg-[#262626] border border-[#353535] p-6 rounded-xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5] mb-4">Resume Templates</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Modern Template Selector */}
                <button 
                  onClick={() => setSelectedTemplate("modern")}
                  className="relative flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div className={`w-full aspect-[3/4] bg-[#171717] rounded overflow-hidden flex items-center justify-center p-2 relative transition-all border-2 ${selectedTemplate === "modern" ? "border-[#D2042D]" : "border-[#353535] hover:border-[#A3A3A3]"}`}>
                    <div className="w-full h-full p-2 flex flex-col gap-1 bg-[#222]/80">
                      <div className="h-2 w-1/2 bg-[#555] rounded"></div>
                      <div className="h-1 w-1/3 bg-[#333] rounded mb-2"></div>
                      <div className="h-1 w-full bg-[#333] rounded"></div>
                      <div className="h-1 w-5/6 bg-[#333] rounded"></div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${selectedTemplate === "modern" ? "text-[#D2042D]" : "text-[#A3A3A3] group-hover:text-[#F5F5F5]"}`}>Modern</span>
                  {selectedTemplate === "modern" && (
                    <div className="absolute top-2 right-2 bg-[#D2042D] text-white rounded-full p-0.5 shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* Minimal Template Selector */}
                <button 
                  onClick={() => setSelectedTemplate("minimal")}
                  className="relative flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <div className={`w-full aspect-[3/4] bg-[#171717] rounded overflow-hidden flex items-center justify-center p-2 relative transition-all border-2 ${selectedTemplate === "minimal" ? "border-[#D2042D]" : "border-[#353535] hover:border-[#A3A3A3]"}`}>
                    <div className="w-full h-full p-2 flex flex-col items-center gap-1 bg-[#222]/80">
                      <div className="h-2 w-1/3 bg-[#555] rounded"></div>
                      <div className="h-1 w-1/4 bg-[#333] rounded mb-2"></div>
                      <div className="h-1 w-4/5 bg-[#333] rounded"></div>
                      <div className="h-1 w-3/4 bg-[#333] rounded"></div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${selectedTemplate === "minimal" ? "text-[#D2042D]" : "text-[#A3A3A3] group-hover:text-[#F5F5F5]"}`}>Minimal</span>
                  {selectedTemplate === "minimal" && (
                    <div className="absolute top-2 right-2 bg-[#D2042D] text-white rounded-full p-0.5 shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Target Company Selector */}
            <div className="border-t border-[#353535] pt-6">
              <h3 className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-3">Target Company (ATS Optimization)</h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className={`py-2 px-3 text-xs font-bold border rounded transition-all active:scale-[0.98] ${selectedCompany === null ? "bg-[#D2042D]/20 border-[#D2042D] text-[#D2042D]" : "bg-[#171717] border-[#353535] text-[#A3A3A3] hover:border-[#A3A3A3]"}`}
                >
                  General (Standard)
                </button>
                <button 
                  onClick={() => setSelectedCompany("google")}
                  className={`py-2 px-3 text-xs font-bold border rounded transition-all active:scale-[0.98] ${selectedCompany === "google" ? "bg-[#D2042D]/20 border-[#D2042D] text-[#D2042D]" : "bg-[#171717] border-[#353535] text-[#A3A3A3] hover:border-[#A3A3A3]"}`}
                >
                  Google
                </button>
                <button 
                  onClick={() => setSelectedCompany("microsoft")}
                  className={`py-2 px-3 text-xs font-bold border rounded transition-all active:scale-[0.98] ${selectedCompany === "microsoft" ? "bg-[#D2042D]/20 border-[#D2042D] text-[#D2042D]" : "bg-[#171717] border-[#353535] text-[#A3A3A3] hover:border-[#A3A3A3]"}`}
                >
                  Microsoft
                </button>
                <button 
                  onClick={() => setSelectedCompany("amazon")}
                  className={`py-2 px-3 text-xs font-bold border rounded transition-all active:scale-[0.98] ${selectedCompany === "amazon" ? "bg-[#D2042D]/20 border-[#D2042D] text-[#D2042D]" : "bg-[#171717] border-[#353535] text-[#A3A3A3] hover:border-[#A3A3A3]"}`}
                >
                  Amazon
                </button>
                <button 
                  onClick={() => setSelectedCompany("meta")}
                  className={`py-2 px-3 text-xs font-bold border rounded transition-all active:scale-[0.98] ${selectedCompany === "meta" ? "bg-[#D2042D]/20 border-[#D2042D] text-[#D2042D]" : "bg-[#171717] border-[#353535] text-[#A3A3A3] hover:border-[#A3A3A3]"}`}
                >
                  Meta
                </button>
              </div>
              <p className="text-[10px] text-[#A3A3A3]/80 leading-normal">
                {selectedCompany 
                  ? `Tailoring bullet points, leadership principles, and scale framing for ${selectedCompany.toUpperCase()}'s hiring norms.` 
                  : "Using a clean, universally ATS-compatible format without specific company slant."}
              </p>
            </div>

            {/* Info callout */}
            <div className="bg-[#171717] border border-[#353535] rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#A3A3A3] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-[#A3A3A3]">
                Add education or projects to strengthen your resume. Ensure your profile data is fully complete for optimal parsing by ATS systems.
                <a className="inline-flex items-center gap-0.5 text-[#F5F5F5] hover:text-[#D2042D] transition-colors underline underline-offset-2 ml-1" href="/candidate">
                  Update Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {/* Generate / Download Button */}
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-[#ecc154] hover:bg-[#ecc154]/90 text-[#131313] font-bold text-sm rounded transition-colors shadow flex justify-center items-center gap-2 active:scale-[0.99]"
            >
              <FileCheck className="w-5 h-5" />
              <span>Download PDF Resume</span>
            </button>
          </div>
        </aside>

        {/* Right Panel: Resume Preview */}
        <section className="lg:col-span-8 flex flex-col items-center gap-4 bg-[#171717] p-6 border border-[#353535] rounded-xl h-[850px] overflow-y-auto print:bg-white print:border-none print:p-0 print:h-auto">
          
          {/* Tab Selector */}
          <div className="flex gap-2 p-1 bg-[#262626] border border-[#353535] rounded-lg print:hidden">
            <button
              onClick={() => setActiveTab("structure")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all active:scale-[0.98] ${activeTab === "structure" ? "bg-[#D2042D] text-white" : "text-[#A3A3A3] hover:text-[#F5F5F5]"}`}
            >
              Structured Preview
            </button>
            <button
              disabled={!resumeId}
              onClick={() => setActiveTab("pdf")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all active:scale-[0.98] ${activeTab === "pdf" ? "bg-[#D2042D] text-white" : "text-[#A3A3A3] hover:text-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed"}`}
              title={!resumeId ? "Generate or load a resume first to view the PDF layout" : ""}
            >
              PDF Layout (Print Preview)
            </button>
          </div>

          {activeTab === "pdf" && resumeId ? (
            <div className="w-full h-[750px] bg-white rounded-lg overflow-hidden border border-gray-300 shadow-2xl relative">
              <iframe
                src={`/api/resume/${resumeId}/download?preview=true`}
                className="w-full h-full border-none"
                title="PDF Print Preview"
              />
            </div>
          ) : (
            /* The Resume Document */
            <article className="bg-white text-gray-900 w-full max-w-[480px] min-h-[680px] p-8 md:p-10 flex flex-col gap-4 rounded shadow-2xl relative print:shadow-none print:p-0">
              
              {/* Template Header layout */}
              {selectedTemplate === "modern" ? (
                <header className="flex flex-col gap-1 border-b border-gray-800 pb-3">
                  <h1 className="text-lg font-extrabold tracking-tight text-gray-900">{parsedData.name || "Candidate Name"}</h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8.5px] text-gray-600 font-semibold font-mono">
                    <span className="flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5 text-gray-500" />
                      {parsedData.contact?.email || "email@example.com"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-2.5 h-2.5 text-gray-500" />
                      {parsedData.contact?.phone || "+1 (555) 010-0000"}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-gray-500" />
                      {parsedData.contact?.location || "San Francisco, CA"}
                    </span>
                  </div>
                </header>
              ) : (
                <header className="flex flex-col items-center gap-0.5 border-b border-gray-350 pb-3 text-center">
                  <h1 className="text-base font-bold tracking-wide uppercase text-gray-900">{parsedData.name || "Candidate Name"}</h1>
                  <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[8.5px] text-gray-600 font-medium">
                    <span>{parsedData.contact?.email || "email@example.com"}</span>
                    <span className="text-gray-400">•</span>
                    <span>{parsedData.contact?.phone || "+1 (555) 010-0000"}</span>
                    <span className="text-gray-400">•</span>
                    <span>{parsedData.contact?.location || "San Francisco, CA"}</span>
                  </div>
                </header>
              )}

              {/* Professional Summary */}
              <section className="flex flex-col gap-1">
                <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Professional Summary</h2>
                <p className="text-[9px] leading-relaxed text-gray-700 text-justify">
                  {parsedData.summary || "No professional summary generated yet. Optimize or upload a resume to populate."}
                </p>
              </section>

              {/* Experience Section */}
              {parsedData.experience && parsedData.experience.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Experience</h2>
                  <div className="flex flex-col gap-2.5">
                    {parsedData.experience.map((exp, index) => (
                      <div key={index} className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-[10px] font-bold text-gray-900">{exp.role}</h3>
                          <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                            {exp.start_date} - {exp.end_date || "Present"}
                          </span>
                        </div>
                        <div className="text-[9.5px] text-gray-600 font-bold mb-0.5">{exp.company}</div>
                        <ul className="list-disc list-outside ml-3 text-[9px] leading-normal text-gray-700 flex flex-col gap-0.5">
                          {exp.description.split(". ").map((sentence, sIdx) => {
                            if (!sentence.trim()) return null;
                            return (
                              <li key={sIdx} className="text-justify">
                                {sentence.trim()}{sentence.endsWith(".") ? "" : "."}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Section */}
              {parsedData.projects && parsedData.projects.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Projects</h2>
                  <div className="flex flex-col gap-2">
                    {parsedData.projects.map((proj, index) => (
                      <div key={index} className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-[10px] font-bold text-gray-900">{proj.name}</h3>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <span className="text-[8px] font-semibold text-gray-500 italic">
                              {proj.technologies.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] leading-normal text-gray-700 text-justify">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Section */}
              {parsedData.education && parsedData.education.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Education</h2>
                  <div className="flex flex-col gap-1">
                    {parsedData.education.map((edu, index) => (
                      <div key={index} className="flex justify-between items-start text-[9.5px]">
                        <div>
                          <span className="font-bold text-gray-900 block">{edu.degree} in {edu.field}</span>
                          <span className="text-gray-600 font-medium">{edu.institution}</span>
                        </div>
                        {edu.start_year && (
                          <span className="text-[8.5px] font-bold text-gray-500 font-mono">
                            {edu.start_year} - {edu.end_year || "Present"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications Section */}
              {parsedData.certifications && parsedData.certifications.length > 0 && (
                <section className="flex flex-col gap-1.5">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Certifications</h2>
                  <div className="flex flex-col gap-1">
                    {parsedData.certifications.map((cert, index) => (
                      <div key={index} className="flex justify-between items-start text-[9.5px]">
                        <div>
                          <span className="font-bold text-gray-900 block">{cert.name}</span>
                          <span className="text-gray-600 font-medium">{cert.issuer}</span>
                        </div>
                        {cert.year && (
                          <span className="text-[8.5px] font-bold text-gray-500 font-mono">
                            {cert.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills Section */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <section className="flex flex-col gap-1">
                  <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-0.5">Technical Skills</h2>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {parsedData.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-800 text-[8.5px] font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Watermark */}
              <div className="absolute bottom-4 right-4 opacity-[0.02] pointer-events-none print:hidden">
                <FileText className="w-12 h-12 text-gray-900" />
              </div>
            </article>
          )}

          {/* Tailoring Label */}
          <div className="text-xs font-semibold text-[#A3A3A3] bg-[#262626] px-4 py-2 border border-[#353535] rounded-full print:hidden">
            Active Variant: <span className="text-[#D2042D]">{selectedCompany ? `Tailored for ${selectedCompany.toUpperCase()}` : "General (Standard)"}</span>
          </div>
        </section>
      </div>
    </div>
  );
}
