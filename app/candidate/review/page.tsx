"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCandidateProfileData, saveTalentProfile } from "../actions";
import {
  FileText,
  User,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Compass,
} from "lucide-react";

export default function CandidateReview() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile states corresponding to talent_profile columns
  const [rawProfile, setRawProfile] = useState<any>(null);
  
  // Editable form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Manual additions
  const [manualCertifications, setManualCertifications] = useState<any[]>([]);
  const [manualHackathons, setManualHackathons] = useState<any[]>([]);
  const [manualAwards, setManualAwards] = useState<any[]>([]);

  const loadData = async () => {
    const res = await getCandidateProfileData();
    if (res.success) {
      if (!res.talentProfile) {
        router.push("/candidate/onboarding");
        return;
      }
      
      const tp = res.talentProfile;
      setRawProfile(tp);

      const resume = tp.resume || {};
      setName(resume.name || "");
      setEmail(resume.email || "");
      setPhone(resume.phone || "");
      setSkillsStr((resume.skills || []).join(", "));
      
      setExperience(resume.experience || []);
      setEducation(resume.education || []);
      setProjects(resume.projects || []);

      const manual = tp.manual || {};
      setManualCertifications(manual.certifications || []);
      setManualHackathons(manual.hackathons || []);
      setManualAwards(manual.awards || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // List editing utility helpers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      { company: "", role: "", start_date: "", end_date: "", description: "" }
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  const handleExperienceChange = (index: number, key: string, val: string) => {
    const nextExp = [...experience];
    nextExp[index] = { ...nextExp[index], [key]: val };
    setExperience(nextExp);
  };

  const handleAddEducation = () => {
    setEducation([
      ...education,
      { institution: "", degree: "", field: "", start_year: null, end_year: null, gpa: "" }
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, idx) => idx !== index));
  };

  const handleEducationChange = (index: number, key: string, val: any) => {
    const nextEdu = [...education];
    nextEdu[index] = { ...nextEdu[index], [key]: val };
    setEducation(nextEdu);
  };

  const handleAddProject = () => {
    setProjects([
      ...projects,
      { name: "", description: "", technologies: [] }
    ]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  const handleProjectChange = (index: number, key: string, val: any) => {
    const nextProj = [...projects];
    nextProj[index] = { ...nextProj[index], [key]: val };
    setProjects(nextProj);
  };

  const handleAddManualCert = () => {
    setManualCertifications([...manualCertifications, { name: "", issuer: "", year: null }]);
  };

  const handleRemoveManualCert = (index: number) => {
    setManualCertifications(manualCertifications.filter((_, idx) => idx !== index));
  };

  const handleManualCertChange = (index: number, key: string, val: any) => {
    const nextCerts = [...manualCertifications];
    nextCerts[index] = { ...nextCerts[index], [key]: val };
    setManualCertifications(nextCerts);
  };

  const handleAddManualHackathon = () => {
    setManualHackathons([...manualHackathons, { name: "", project: "", rank: "" }]);
  };

  const handleRemoveManualHackathon = (index: number) => {
    setManualHackathons(manualHackathons.filter((_, idx) => idx !== index));
  };

  const handleManualHackathonChange = (index: number, key: string, val: any) => {
    const nextHacks = [...manualHackathons];
    nextHacks[index] = { ...nextHacks[index], [key]: val };
    setManualHackathons(nextHacks);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Split skills string back to array tags
      const skills = skillsStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Reassemble talent_profile
      const updatedProfile = {
        ...rawProfile,
        resume: {
          ...rawProfile.resume,
          name,
          email,
          phone,
          skills,
          experience,
          education,
          projects,
        },
        manual: {
          certifications: manualCertifications,
          hackathons: manualHackathons,
          awards: manualAwards,
        },
      };

      const res = await saveTalentProfile(updatedProfile);
      if (res.success) {
        setSuccessMessage("Profile saved successfully! Redirecting...");
        setTimeout(() => {
          router.push("/candidate");
        }, 1200);
      } else {
        setErrorMessage(res.error || "Failed to update profile.");
        setIsSaving(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="mt-4 text-xs font-semibold text-zinc-650 dark:text-zinc-400">Loading parsed candidate records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans py-8">
      <div className="max-w-3xl mx-auto w-full px-4 space-y-6">
        
        {/* Title Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Onboarding Stage 2
            </span>
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Review & Edit Merged Profile
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Verify parsed details from your resume and optionally add manual achievements.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-650 hover:bg-indigo-500 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.01]"
          >
            {isSaving ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
            Save & Finish Onboarding
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-xl p-4 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-250 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl p-4 text-xs">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section 1: Contact Information */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <User className="w-4.5 h-4.5 text-indigo-500" />
            Contact Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Experience */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-indigo-500" />
              Work History
            </h2>
            <button
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/30 dark:bg-zinc-950/20 relative space-y-3">
                <button
                  onClick={() => handleRemoveExperience(idx)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Role/Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Start Date</label>
                    <input
                      type="text"
                      value={exp.start_date}
                      onChange={(e) => handleExperienceChange(idx, "start_date", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">End Date (or Present)</label>
                    <input
                      type="text"
                      value={exp.end_date || ""}
                      onChange={(e) => handleExperienceChange(idx, "end_date", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Education */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              Education
            </h2>
            <button
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/30 dark:bg-zinc-950/20 relative space-y-3">
                <button
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(idx, "field", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">GPA</label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Skills Comma List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 rounded-2xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <Compass className="w-4.5 h-4.5 text-indigo-500" />
            Skills Profile
          </h2>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Extracted Skills (Comma Separated)</label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 5: Manual Submissions */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <User className="w-4.5 h-4.5 text-indigo-500" />
            Manual Additions (Hackathons & Certifications)
          </h2>

          {/* Manual Hackathons */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Hackathons</h3>
              <button
                onClick={handleAddManualHackathon}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Hackathon
              </button>
            </div>
            <div className="space-y-3">
              {manualHackathons.map((hack, idx) => (
                <div key={idx} className="p-3 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 relative grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRemoveManualHackathon(idx)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Name</label>
                    <input
                      type="text"
                      value={hack.name}
                      onChange={(e) => handleManualHackathonChange(idx, "name", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Project</label>
                    <input
                      type="text"
                      value={hack.project}
                      onChange={(e) => handleManualHackathonChange(idx, "project", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Rank/Award</label>
                    <input
                      type="text"
                      value={hack.rank}
                      onChange={(e) => handleManualHackathonChange(idx, "rank", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Certifications */}
          <div className="space-y-3 border-t border-zinc-150 dark:border-zinc-850 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Certifications</h3>
              <button
                onClick={handleAddManualCert}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Certification
              </button>
            </div>
            <div className="space-y-3">
              {manualCertifications.map((cert, idx) => (
                <div key={idx} className="p-3 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 relative grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRemoveManualCert(idx)}
                    className="absolute top-2 right-2 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Certificate Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleManualCertChange(idx, "name", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleManualCertChange(idx, "issuer", e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-550 uppercase">Year</label>
                    <input
                      type="number"
                      value={cert.year || ""}
                      onChange={(e) => handleManualCertChange(idx, "year", parseInt(e.target.value) || null)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-650 hover:bg-indigo-500 disabled:bg-zinc-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.01]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile & Finish
          </button>
        </div>

      </div>
    </div>
  );
}
