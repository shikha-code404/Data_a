import { StructuredResume } from "./resumeService";

export function renderModernHTML(data: StructuredResume): string {
  const contact = data.contact || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];

  const experienceHTML = experience.map(exp => `
    <div class="mb-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-slate-800 text-sm">${exp.role}</h3>
          <div class="text-xs font-semibold text-slate-500">${exp.company}</div>
        </div>
        <div class="text-[10px] text-slate-400 font-medium text-right whitespace-nowrap">
          ${exp.start_date} – ${exp.end_date || "Present"}
        </div>
      </div>
      <p class="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">${exp.description}</p>
    </div>
  `).join("");

  const projectsHTML = projects.map(proj => `
    <div class="mb-4">
      <h3 class="font-bold text-slate-800 text-sm">${proj.name}</h3>
      <p class="text-xs text-slate-600 mt-1 leading-relaxed">${proj.description}</p>
      ${proj.technologies && proj.technologies.length > 0 ? `
        <div class="flex flex-wrap gap-1 mt-2">
          ${proj.technologies.map(tech => `
            <span class="text-[9px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
              ${tech}
            </span>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `).join("");

  const skillsHTML = skills.map(skill => `
    <span class="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded">
      ${skill}
    </span>
  `).join("");

  const educationHTML = education.map(edu => `
    <div class="mb-3">
      <h3 class="font-bold text-slate-800 text-xs">${edu.degree} in ${edu.field}</h3>
      <div class="text-xs text-slate-500">${edu.institution}</div>
      <div class="text-[10px] text-slate-400 mt-0.5">
        ${edu.start_year && edu.end_year ? `${edu.start_year} – ${edu.end_year}` : "Graduated"}
        ${edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
      </div>
    </div>
  `).join("");

  const certificationsHTML = certifications.map(cert => `
    <div class="text-xs mb-2.5">
      <h3 class="font-bold text-slate-800">${cert.name}</h3>
      <div class="text-slate-500 text-[10px] mt-0.5">
        Issued by ${cert.issuer} ${cert.year ? `(${cert.year})` : ""}
      </div>
    </div>
  `).join("");

  return `
    <div class="w-full max-w-[8.5in] min-h-[11in] bg-white text-slate-800 p-8 md:p-12 shadow-lg font-sans border-t-[8px] border-indigo-600 print:shadow-none print:p-0 print:border-none">
      <div class="border-b border-slate-200 pb-6 mb-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">${data.name}</h1>
            <p class="text-indigo-600 font-semibold tracking-wide text-sm uppercase mt-1">Software Professional</p>
          </div>
          <div class="text-xs text-slate-500 space-y-1 md:text-right">
            ${contact.email ? `<div>✉ ${contact.email}</div>` : ""}
            ${contact.phone ? `<div>📞 ${contact.phone}</div>` : ""}
            ${contact.location ? `<div>📍 ${contact.location}</div>` : ""}
            ${contact.github ? `<div>💻 github.com/${contact.github}</div>` : ""}
          </div>
        </div>
        ${data.summary ? `<p class="text-sm text-slate-600 mt-4 leading-relaxed italic">${data.summary}</p>` : ""}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="md:col-span-2 space-y-6">
          ${experience.length > 0 ? `
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Work Experience
              </h2>
              <div class="space-y-4">${experienceHTML}</div>
            </div>
          ` : ""}
          ${projects.length > 0 ? `
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Projects
              </h2>
              <div class="space-y-4">${projectsHTML}</div>
            </div>
          ` : ""}
        </div>

        <div class="space-y-6">
          ${skills.length > 0 ? `
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Skills & Tech
              </h2>
              <div class="flex flex-wrap gap-1.5">${skillsHTML}</div>
            </div>
          ` : ""}
          ${education.length > 0 ? `
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Education
              </h2>
              <div class="space-y-3">${educationHTML}</div>
            </div>
          ` : ""}
          ${certifications.length > 0 ? `
            <div>
              <h2 class="text-base font-bold text-slate-900 border-b-2 border-indigo-100 pb-1 mb-4 uppercase tracking-wider">
                Certifications
              </h2>
              <div class="space-y-2.5">${certificationsHTML}</div>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderMinimalHTML(data: StructuredResume): string {
  const contact = data.contact || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const skills = data.skills || [];
  const certifications = data.certifications || [];

  const experienceHTML = experience.map(exp => `
    <div class="mb-4">
      <div class="flex justify-between items-baseline font-sans text-xs">
        <div>
          <span class="font-bold text-zinc-800">${exp.company}</span>
          <span class="text-zinc-400 mx-1.5">|</span>
          <span class="font-semibold text-zinc-700 italic">${exp.role}</span>
        </div>
        <div class="text-[10px] text-zinc-400 font-semibold whitespace-nowrap">
          ${exp.start_date} – ${exp.end_date || "Present"}
        </div>
      </div>
      <p class="text-xs text-zinc-600 mt-1.5 leading-relaxed text-justify whitespace-pre-line">${exp.description}</p>
    </div>
  `).join("");

  const projectsHTML = projects.map(proj => `
    <div class="mb-4">
      <div class="flex justify-between items-baseline font-sans text-xs">
        <span class="font-bold text-zinc-800">${proj.name}</span>
        ${proj.technologies && proj.technologies.length > 0 ? `
          <span class="text-[10px] font-medium text-zinc-500 italic">
            ${proj.technologies.join(", ")}
          </span>
        ` : ""}
      </div>
      <p class="text-xs text-zinc-600 mt-1.5 leading-relaxed text-justify">${proj.description}</p>
    </div>
  `).join("");

  const educationHTML = education.map(edu => `
    <div class="text-xs mb-3">
      <div class="font-bold text-zinc-800 font-sans">${edu.degree} in ${edu.field}</div>
      <div class="text-zinc-600 font-serif italic mt-0.5">${edu.institution}</div>
      <div class="text-[10px] text-zinc-400 mt-0.5 font-sans font-medium">
        Class of ${edu.end_year || "Unknown"} ${edu.gpa ? `| GPA: ${edu.gpa}` : ""}
      </div>
    </div>
  `).join("");

  const certificationsHTML = certifications.map(cert => `
    <div class="text-xs mb-2">
      <span class="font-bold text-zinc-800 font-sans">${cert.name}</span>
      <span class="text-[10px] text-zinc-400 font-sans block mt-0.5">
        ${cert.issuer} ${cert.year ? `• ${cert.year}` : ""}
      </span>
    </div>
  `).join("");

  return `
    <div class="w-full max-w-[8.5in] min-h-[11in] bg-white text-zinc-800 p-10 md:p-14 shadow-lg font-serif print:shadow-none print:p-0">
      <div class="text-center pb-6 mb-6 border-b border-zinc-200">
        <h1 class="text-3xl font-normal tracking-wide text-zinc-900 font-sans">${data.name}</h1>
        <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 mt-3 font-sans">
          ${contact.email ? `<div>${contact.email}</div>` : ""}
          ${contact.phone ? `<div>• ${contact.phone}</div>` : ""}
          ${contact.location ? `<div>• ${contact.location}</div>` : ""}
          ${contact.github ? `<div>• github.com/${contact.github}</div>` : ""}
        </div>
      </div>

      ${data.summary ? `<div class="mb-6"><p class="text-xs text-zinc-600 leading-relaxed text-justify">${data.summary}</p></div>` : ""}

      ${experience.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
            Professional Experience
          </h2>
          <div>${experienceHTML}</div>
        </div>
      ` : ""}

      ${projects.length > 0 ? `
        <div class="mb-6">
          <h2 class="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
            Technical Projects
          </h2>
          <div>${projectsHTML}</div>
        </div>
      ` : ""}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          ${skills.length > 0 ? `
            <div class="mb-6">
              <h2 class="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Core Competencies
              </h2>
              <p class="text-xs text-zinc-600 leading-relaxed">${skills.join(", ")}</p>
            </div>
          ` : ""}
        </div>
        <div class="space-y-6">
          ${education.length > 0 ? `
            <div>
              <h2 class="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Education
              </h2>
              <div class="space-y-3">${educationHTML}</div>
            </div>
          ` : ""}
          ${certifications.length > 0 ? `
            <div>
              <h2 class="text-xs font-semibold text-zinc-900 border-b border-zinc-300 pb-1 mb-3 uppercase tracking-wider font-sans">
                Certifications
              </h2>
              <div class="space-y-2">${certificationsHTML}</div>
            </div>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}
