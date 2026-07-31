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
  Zap,
  Shield,
  X,
  PlusCircle
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
  const [location, setLocation] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // Manual additions
  const [manualCertifications, setManualCertifications] = useState<any[]>([]);
  const [manualHackathons, setManualHackathons] = useState<any[]>([]);
  const [manualAwards, setManualAwards] = useState<any[]>([]);

  // GitHub stats
  const [githubUrl, setGithubUrl] = useState("");
  const [reposCount, setReposCount] = useState(0);
  const [contributionsCount, setContributionsCount] = useState(0);
  const [topLanguage, setTopLanguage] = useState("N/A");

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
      setLocation(resume.location || "");
      setSkillsList(resume.skills || []);
      
      setExperience(resume.experience || []);
      setEducation(resume.education || []);
      setProjects(resume.projects || []);

      const manual = tp.manual || {};
      setManualCertifications(manual.certifications || []);
      setManualHackathons(manual.hackathons || []);
      setManualAwards(manual.awards || []);

      // Load Github values
      const gh = tp.github || {};
      setGithubUrl(gh.profile_url || `https://github.com/${res.githubUsername || ""}`);
      setReposCount(gh.public_repos || (gh.repos ? gh.repos.length : 0) || 12);
      setContributionsCount(gh.total_commits || 420);
      setTopLanguage(gh.primary_language || "JavaScript");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

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
      // Reassemble talent_profile
      const updatedProfile = {
        ...rawProfile,
        resume: {
          ...rawProfile.resume,
          name,
          email,
          phone,
          location,
          skills: skillsList,
          experience,
          education,
          projects,
        },
        manual: {
          certifications: manualCertifications,
          hackathons: manualHackathons,
          awards: manualAwards,
        },
        github: {
          ...rawProfile.github,
          profile_url: githubUrl,
        }
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
      <div className="min-h-screen bg-[#131313] text-[#F5F5F5] flex flex-col items-center justify-center font-sans">
        <RefreshCw className="h-10 w-10 text-[#D2042D] animate-spin" />
        <p className="mt-4 text-xs font-semibold text-[#A3A3A3]">Loading parsed candidate records...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#e2dfff] min-h-screen antialiased pb-24 font-sans relative">
      {/* Sticky Header */}
      <header className="h-16 flex items-center px-6 border-b border-[#353534]/50 sticky top-0 z-50 bg-[#131313]/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#D2042D] rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">HireSpark</span>
        </div>
        <div className="ml-auto text-xs text-[#A3A3A3] flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#ecc154]" />
          Secure Onboarding
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-12 pb-24 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2 text-white">Review & Edit Profile</h1>
          <p className="text-[#A3A3A3] text-sm">
            We've extracted this information from your resume and GitHub. Please review and update any inaccuracies before continuing.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 bg-[#D2042D]/10 border border-[#D2042D]/20 text-[#D2042D] rounded-xl p-4 text-xs font-bold shadow-md">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 bg-[#64de87]/10 border border-[#64de87]/20 text-[#64de87] rounded-xl p-4 text-xs font-bold shadow-md">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Basic Info Section */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ecc154] to-transparent"></div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[#353534]/40 pb-4 text-white">
            <User className="w-5 h-5 text-[#ecc154]" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Full Name</label>
              <input
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D2042D] transition-all"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Email Address</label>
              <input
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D2042D] transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Phone Number</label>
              <input
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D2042D] transition-all"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Location</label>
              <input
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D2042D] transition-all"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex justify-between items-center border-b border-[#353534]/40 pb-4 mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Compass className="w-5 h-5 text-[#ecc154]" />
              Professional Experience
            </h2>
            <button
              onClick={handleAddExperience}
              className="text-xs font-bold text-[#ecc154] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>
          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="relative pl-6 border-l border-[#353534]">
                <div className="absolute w-3 h-3 bg-[#ecc154] rounded-full -left-[6.5px] top-2"></div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Job Title</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Company</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Description</label>
                      <textarea
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] resize-none focus:outline-none focus:border-[#D2042D]"
                        rows={3}
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Start Date</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={exp.start_date}
                        onChange={(e) => handleExperienceChange(idx, "start_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">End Date</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={exp.end_date || ""}
                        onChange={(e) => handleExperienceChange(idx, "end_date", e.target.value)}
                      />
                    </div>
                    <div className="pt-4 text-right">
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-xs text-[#A3A3A3] hover:text-[#D2042D] transition-colors cursor-pointer bg-transparent border-0"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex justify-between items-center border-b border-[#353534]/40 pb-4 mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-[#ecc154]" />
              Education History
            </h2>
            <button
              onClick={handleAddEducation}
              className="text-xs font-bold text-[#ecc154] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" /> Add School
            </button>
          </div>
          <div className="space-y-6">
            {education.map((edu, idx) => (
              <div key={idx} className="relative pl-6 border-l border-[#353534]">
                <div className="absolute w-3 h-3 bg-[#ecc154] rounded-full -left-[6.5px] top-2"></div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Institution</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Degree</label>
                        <input
                          className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">Field of Study</label>
                        <input
                          className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                          type="text"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(idx, "field", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1.5">GPA</label>
                      <input
                        className="w-full bg-[#131313] border border-[#353534] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#D2042D]"
                        type="text"
                        value={edu.gpa || ""}
                        onChange={(e) => handleEducationChange(idx, "gpa", e.target.value)}
                      />
                    </div>
                    <div className="pt-8 text-right">
                      <button
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-xs text-[#A3A3A3] hover:text-[#D2042D] transition-colors cursor-pointer bg-transparent border-0"
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills & Tech Section */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[#353534]/40 pb-4 text-white">
            <PlusCircle className="w-5 h-5 text-[#ecc154]" />
            Skills &amp; Technologies
          </h2>
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">Add a skill</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#D2042D]"
                placeholder="e.g. TensorFlow, React, AWS"
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
              />
              <button
                className="bg-[#353534] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2d2d30] transition-colors"
                type="button"
                onClick={handleAddSkill}
              >
                Add
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {skillsList.map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-[#ecc154] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#ecc154]/20 bg-[#131313]">
                <span>{s}</span>
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white text-[#ecc154]" onClick={() => handleRemoveSkill(s)} />
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Insight Summary */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 shadow-lg">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-[#353534]/40 pb-4 text-white">
            <Zap className="w-5 h-5 text-[#ecc154]" />
            GitHub Insight Summary
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-[#353534]/40 text-center bg-[#131313]/40">
              <div className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Repositories</div>
              <div className="text-2xl font-extrabold font-mono text-[#ecc154]">{reposCount}</div>
            </div>
            <div className="p-4 rounded-xl border border-[#353534]/40 text-center bg-[#131313]/40">
              <div className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Contributions</div>
              <div className="text-2xl font-extrabold font-mono text-[#ecc154]">{contributionsCount}</div>
              <div className="text-[9px] text-[#A3A3A3] mt-1">(Past Year)</div>
            </div>
            <div className="p-4 rounded-xl border border-[#353534]/40 text-center bg-[#131313]/40">
              <div className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-wider mb-1">Top Lang</div>
              <div className="text-base font-extrabold text-[#ecc154] mt-1">{topLanguage}</div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#A3A3A3] uppercase tracking-wider mb-2">GitHub Profile URL (Verify)</label>
            <input
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#D2042D] transition-all"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>
        </section>

        {/* Manual Achievements Section */}
        <section className="bg-[#1c1c1e] border border-[#353534]/60 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-[#353534]/40 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <PlusCircle className="w-5 h-5 text-[#ecc154]" />
              Hackathons &amp; Certifications
            </h2>
          </div>

          {/* Hackathons */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Manual Hackathons</h3>
              <button
                onClick={handleAddManualHackathon}
                className="text-xs font-bold text-[#ecc154] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
                type="button"
              >
                <Plus className="w-3.5 h-3.5" /> Add Hackathon
              </button>
            </div>
            <div className="space-y-3">
              {manualHackathons.map((hack, idx) => (
                <div key={idx} className="p-4 border border-[#353534]/60 rounded-xl bg-[#131313]/30 relative grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRemoveManualHackathon(idx)}
                    className="absolute top-2 right-2 text-[#A3A3A3] hover:text-[#D2042D] cursor-pointer bg-transparent border-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Name</label>
                    <input
                      type="text"
                      value={hack.name}
                      onChange={(e) => handleManualHackathonChange(idx, "name", e.target.value)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Project</label>
                    <input
                      type="text"
                      value={hack.project}
                      onChange={(e) => handleManualHackathonChange(idx, "project", e.target.value)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Rank/Award</label>
                    <input
                      type="text"
                      value={hack.rank}
                      onChange={(e) => handleManualHackathonChange(idx, "rank", e.target.value)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4 border-t border-[#353534]/40 pt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Manual Certifications</h3>
              <button
                onClick={handleAddManualCert}
                className="text-xs font-bold text-[#ecc154] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
                type="button"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>
            <div className="space-y-3">
              {manualCertifications.map((cert, idx) => (
                <div key={idx} className="p-4 border border-[#353534]/60 rounded-xl bg-[#131313]/30 relative grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRemoveManualCert(idx)}
                    className="absolute top-2 right-2 text-[#A3A3A3] hover:text-[#D2042D] cursor-pointer bg-transparent border-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Certificate Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleManualCertChange(idx, "name", e.target.value)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Issuer</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleManualCertChange(idx, "issuer", e.target.value)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#A3A3A3] uppercase">Year</label>
                    <input
                      type="number"
                      value={cert.year || ""}
                      onChange={(e) => handleManualCertChange(idx, "year", parseInt(e.target.value) || null)}
                      className="w-full bg-[#131313] border border-[#353534] rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5F5] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#131313]/90 backdrop-blur-xl border-t border-[#353534]/60 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push("/candidate/onboarding")}
            className="px-6 py-2.5 rounded-xl border border-[#ecc154] text-[#ecc154] font-bold hover:bg-[#ecc154]/10 transition-colors text-xs uppercase tracking-wider cursor-pointer bg-transparent"
            type="button"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-[#ecc154] text-[#131313] font-bold shadow-md shadow-[#ecc154]/15 hover:bg-[#e5c367] transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            type="button"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
