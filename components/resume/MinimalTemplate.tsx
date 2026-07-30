import React from "react";
import { StructuredResume } from "@/lib/resume/resumeService";

interface TemplateProps {
  data: StructuredResume;
}

export default function MinimalTemplate({ data }: TemplateProps) {
  return (
    <div className="w-full max-w-[8.5in] min-h-[11in] bg-white text-zinc-800 p-10 md:p-14 shadow-lg font-serif print:shadow-none print:p-0">
      
      {/* Centered Name and Contact */}
      <div className="text-center pb-6 mb-6 border-b border-zinc-200">
        <h1 className="text-3xl font-normal tracking-wide text-zinc-900 font-sans">{data.name}</h1>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-3 font-sans">
          {data.contact.email && <div>{data.contact.email}</div>}
          {data.contact.phone && <div>• {data.contact.phone}</div>}
          {data.contact.location && <div>• {data.contact.location}</div>}
          {data.contact.github && <div>• github.com/{data.contact.github}</div>}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <p className="text-xs text-zinc-600 leading-relaxed text-justify">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-sans text-xs">
                  <div>
                    <span className="font-bold text-zinc-800">{exp.company}</span>
                    <span className="text-zinc-400 mx-1.5">|</span>
                    <span className="font-semibold text-zinc-700 italic">{exp.role}</span>
                  </div>
                  <div className="text-xxs text-zinc-400 font-semibold whitespace-nowrap">
                    {exp.start_date} – {exp.end_date || "Present"}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed text-justify whitespace-pre-line">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
            Technical Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-sans text-xs">
                  <span className="font-bold text-zinc-800">{proj.name}</span>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <span className="text-xxs font-medium text-zinc-500 italic">
                      {proj.technologies.join(", ")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed text-justify">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Two-Column Block (Skills & Education) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Sub-Column */}
        <div>
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Core Competencies
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {data.skills.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Right Sub-Column */}
        <div className="space-y-6">
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Education
              </h2>
              <div className="space-y-3">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="font-bold text-zinc-800 font-sans">{edu.degree} in {edu.field}</div>
                    <div className="text-zinc-600 font-serif italic mt-0.5">{edu.institution}</div>
                    <div className="text-xxs text-zinc-400 mt-0.5 font-sans font-medium">
                      Class of {edu.end_year || "Unknown"} {edu.gpa && `| GPA: ${edu.gpa}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.certifications && data.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Certifications
              </h2>
              <div className="space-y-2">
                {data.certifications.map((cert, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-bold text-zinc-800 font-sans">{cert.name}</span>
                    <span className="text-xxs text-zinc-400 font-sans block mt-0.5">
                      {cert.issuer} {cert.year && `• ${cert.year}`}
                    </span>
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
