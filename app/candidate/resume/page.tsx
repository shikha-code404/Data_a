"use client";

import React, { useState, useRef } from "react";
import { FileText, Download, Upload, CheckCircle2, Loader2, Sparkles, AlertCircle, FileCheck, Briefcase, Award, GraduationCap } from "lucide-react";

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>({
    name: "Alex Rivera",
    email: "candidate@hirespark.com",
    phone: "+1 (555) 019-2834",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "Supabase", "Python"],
    experience: [
      { company: "HireSpark Partner Labs", role: "Senior Full Stack Engineer", start_date: "2023", end_date: "Present", description: "3+ years experience building production Next.js and Supabase web applications." }
    ],
    education: [
      { institution: "Institute of Technology", degree: "B.S. Software Engineering", field: "Computer Science", start_year: 2020, end_year: 2024 }
    ],
    projects: [
      { name: "AI Vector Matcher", description: "Local transformer candidate matching pipeline", technologies: ["React", "Next.js", "TypeScript"] }
    ]
  });

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
        setParsedData(result.parsed_resume);
        setUploadStatus(`Success! Resume '${file.name}' uploaded and parsed into candidate profile.`);
      } else {
        setUploadStatus(`Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Resume upload failed:", err);
      setUploadStatus(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            Resume Builder & PDF Parser
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Upload your PDF resume to automatically extract skills, work history, and sync with your AI Talent Score.
          </p>
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isUploading ? "Parsing PDF..." : "Upload New PDF Resume"}</span>
          </button>
        </div>
      </div>

      {/* Upload Status Banner */}
      {uploadStatus && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          uploadStatus.startsWith("Success")
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : uploadStatus.startsWith("Error")
            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
            : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
        }`}>
          {uploadStatus.startsWith("Success") ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />}
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Main Resume Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center font-bold text-indigo-400 text-lg">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{parsedData?.name || "Candidate Resume"}</h3>
              <p className="text-xs text-slate-400">{parsedData?.email || "candidate@hirespark.com"} • {parsedData?.phone || "+1 (555) 019-2834"}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> AI Parsed & Synced
          </span>
        </div>

        {/* Skills Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Extracted Technical Skills
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.isArray(parsedData?.skills) && parsedData.skills.length > 0 ? (
              parsedData.skills.map((skill: string) => (
                <span key={skill} className="px-3 py-1 bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-semibold rounded-lg">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No skills extracted yet. Upload a PDF resume above.</span>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" /> Work Experience
          </h4>
          <div className="space-y-3">
            {Array.isArray(parsedData?.experience) && parsedData.experience.length > 0 ? (
              parsedData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-start text-sm font-bold text-slate-200">
                    <span>{exp.role}</span>
                    <span className="text-xs text-slate-400 font-normal">{exp.company} ({exp.start_date} - {exp.end_date || "Present"})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{exp.description}</p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-400">
                Upload your PDF resume to extract work history details.
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" /> Education & Degrees
          </h4>
          <div className="space-y-2">
            {Array.isArray(parsedData?.education) && parsedData.education.length > 0 ? (
              parsedData.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{edu.degree} in {edu.field}</span>
                    <span className="text-slate-400">{edu.institution}</span>
                  </div>
                  {edu.start_year && (
                    <span className="text-slate-500 font-mono">{edu.start_year} - {edu.end_year || "Present"}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-400">
                Education history will appear here after parsing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
