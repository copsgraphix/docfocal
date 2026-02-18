"use client";

import type { CVData } from "./cv-editor";

interface CVPreviewProps {
  title: string;
  data: CVData;
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
        {heading}
      </h2>
      {children}
    </section>
  );
}

export default function CVPreview({ title, data }: CVPreviewProps) {
  const { personalInfo, summary, experience, education, skills } = data;
  const displayName = personalInfo.name || title;
  const activeSkills = skills.filter(Boolean);

  return (
    <div className="cv-preview-sheet bg-white p-10 text-gray-900 shadow-md">
      {/* Header */}
      <header className="mb-6 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold leading-tight">
          {displayName || <span className="text-gray-300">Your Name</span>}
        </h1>
        {personalInfo.title && (
          <p className="mt-1 text-base text-gray-500">{personalInfo.title}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && <span>{personalInfo.website}</span>}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <Section heading="Summary">
          <p className="text-sm leading-relaxed text-gray-700">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section heading="Experience">
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-900">{exp.company || "Company"}</span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {exp.startDate}
                    {(exp.startDate || exp.endDate || exp.current) && " – "}
                    {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.role && (
                  <p className="text-sm italic text-gray-500">{exp.role}</p>
                )}
                {exp.description && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section heading="Education">
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-gray-900">
                    {edu.institution || "Institution"}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400">
                    {edu.startDate}
                    {(edu.startDate || edu.endDate) && " – "}
                    {edu.endDate}
                  </span>
                </div>
                {(edu.degree || edu.field) && (
                  <p className="text-sm text-gray-500">
                    {edu.degree}
                    {edu.degree && edu.field ? " in " : ""}
                    {edu.field}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {activeSkills.length > 0 && (
        <Section heading="Skills">
          <p className="text-sm text-gray-700">{activeSkills.join(" · ")}</p>
        </Section>
      )}
    </div>
  );
}
