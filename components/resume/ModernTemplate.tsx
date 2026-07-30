import React from "react";
import { StructuredResume } from "@/lib/resume/resumeService";

interface TemplateProps {
  data: StructuredResume;
}

export default function ModernTemplate({ data }: TemplateProps) {
  return (
    <div className="w-full max-w-[8.5in] min-h-[11in] bg-white text-slate-800 p-8 md:p-12 shadow-lg font-sans border-t-[8px] border-indigo-600 print:shadow-none print:p-0 print:border-none">
      {/* Header Section */}
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.name}</h1>
            <p className="text-indigo-600 font-semibold tracking-wide text-sm uppercase mt-1">Software Professional</p>
          </div>
          
          <div className="text-xs text-slate-500 space-y-1 md:text-right">
            {data.contact.email && <div>✉ {data.contact.email}</div>}
            {data.contact.phone && <div>📞 {data.contact.phone}</div>}
            {data.contact.location && <div>📍 {data.contact.location}</div>}
            {data.contact.github && <div>💻 github.com/{data.contact.github}</div>}
          </div>
        </div>

        {data.summary && (
          <p className="text-sm text-slate-600 mt-4 leading-relaxed italic">
            {data.summary}
          </p>
        )}
      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Work Experience */}
        <div className="md:col-span-2 space-y-6">
          {data.experience && data.experience.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Work Experience
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{exp.role}</h3>
                        <div className="text-xs font-semibold text-slate-500">{exp.company}</div>
                      </div>
                      <div className="text-xxs text-slate-400 font-medium md:text-right whitespace-nowrap">
                        {exp.start_date} – {exp.end_date || "Present"}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.projects && data.projects.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((proj, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-sm">{proj.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.technologies.map((tech, tIdx) => (
                          <span key={tIdx} className="text-xxs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Skills, Education, Certifications */}
        <div className="space-y-6">
          {data.skills && data.skills.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Skills & Tech
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-slate-800 text-xs">{edu.degree} in {edu.field}</h3>
                    <div className="text-xs text-slate-500">{edu.institution}</div>
                    <div className="text-xxs text-slate-400 mt-0.5">
                      {edu.start_year && edu.end_year ? `${edu.start_year} – ${edu.end_year}` : "Graduated"}
                      {edu.gpa && ` (GPA: ${edu.gpa})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Certifications
              </h2>
              <div className="space-y-2.5">
                {data.certifications.map((cert, idx) => (
                  <div key={idx} className="text-xs">
                    <h3 className="font-bold text-slate-800">{cert.name}</h3>
                    <div className="text-slate-500 text-xxs mt-0.5">
                      Issued by {cert.issuer} {cert.year && `(${cert.year})`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
