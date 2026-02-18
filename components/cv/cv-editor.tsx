"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Printer } from "lucide-react";
import { updateCV } from "@/app/actions/cvs";
import CVPreview from "./cv-preview";
import type { Tables } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────
export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
}

const DEFAULT_DATA: CVData = {
  personalInfo: { name: "", title: "", email: "", phone: "", location: "", website: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
};

function uid() {
  return Math.random().toString(36).slice(2);
}

// ── Field helpers ─────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-border bg-bg-main px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary";
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-text-secondary">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
      {children}
    </h3>
  );
}

// ── Main editor ───────────────────────────────────────────────
type CVRow = Tables<"cvs">;

export default function CVEditor({ cv }: { cv: CVRow }) {
  const [title, setTitle] = useState(cv.title);
  const [data, setData] = useState<CVData>(() => {
    try {
      return cv.data ? (cv.data as unknown as CVData) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const titleRef = useRef(cv.title);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (t: string, d: CVData) => {
      setSaveStatus("saving");
      await updateCV(cv.id, t, d);
      setSaveStatus("saved");
    },
    [cv.id]
  );

  const scheduleSave = useCallback(
    (t: string, d: CVData) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => save(t, d), 1000);
    },
    [save]
  );

  const update = (patch: Partial<CVData>) => {
    const next = { ...data, ...patch };
    setData(next);
    scheduleSave(titleRef.current, next);
  };

  const updatePersonal = (key: keyof CVData["personalInfo"], value: string) => {
    const next = { ...data, personalInfo: { ...data.personalInfo, [key]: value } };
    setData(next);
    scheduleSave(titleRef.current, next);
  };

  const updateTitle = (value: string) => {
    setTitle(value);
    titleRef.current = value;
    scheduleSave(value, data);
  };

  // Experience helpers
  const addExperience = () =>
    update({
      experience: [
        ...data.experience,
        { id: uid(), company: "", role: "", startDate: "", endDate: "", current: false, description: "" },
      ],
    });

  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    update({
      experience: data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });

  const removeExperience = (id: string) =>
    update({ experience: data.experience.filter((e) => e.id !== id) });

  // Education helpers
  const addEducation = () =>
    update({
      education: [
        ...data.education,
        { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "" },
      ],
    });

  const updateEducation = (id: string, patch: Partial<EducationEntry>) =>
    update({
      education: data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });

  const removeEducation = (id: string) =>
    update({ education: data.education.filter((e) => e.id !== id) });

  // Skills helpers (comma-separated in one input, stored as array)
  const skillsString = data.skills.join(", ");

  const updateSkills = (raw: string) =>
    update({ skills: raw.split(",").map((s) => s.trimStart()) });

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Sub-header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-bg-main px-5 py-3">
        <Link
          href="/dashboard/cv"
          className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          CVs
        </Link>
        <div className="flex-1" />
        <span className="text-xs text-text-secondary">
          {saveStatus === "saving" ? "Saving…" : saveStatus === "unsaved" ? "Unsaved changes" : "Saved"}
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Printer className="h-3.5 w-3.5" />
          Download PDF
        </button>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left: form ─────────────────────────── */}
        <div className="w-80 shrink-0 space-y-6 overflow-y-auto border-r border-border bg-bg-section p-5">
          {/* CV title (internal label) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              CV Title (internal)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => updateTitle(e.target.value)}
              placeholder="e.g. Software Engineer CV"
              className="w-full rounded-lg border border-border bg-bg-main px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Personal info */}
          <div>
            <SectionHeading>Personal Info</SectionHeading>
            <div className="space-y-3">
              <Field label="Full Name" value={data.personalInfo.name} onChange={(v) => updatePersonal("name", v)} placeholder="Jane Smith" />
              <Field label="Job Title / Headline" value={data.personalInfo.title} onChange={(v) => updatePersonal("title", v)} placeholder="Senior Software Engineer" />
              <Field label="Email" value={data.personalInfo.email} onChange={(v) => updatePersonal("email", v)} placeholder="jane@example.com" />
              <Field label="Phone" value={data.personalInfo.phone} onChange={(v) => updatePersonal("phone", v)} placeholder="+1 555 000 0000" />
              <Field label="Location" value={data.personalInfo.location} onChange={(v) => updatePersonal("location", v)} placeholder="London, UK" />
              <Field label="Website / LinkedIn" value={data.personalInfo.website} onChange={(v) => updatePersonal("website", v)} placeholder="linkedin.com/in/jane" />
            </div>
          </div>

          {/* Summary */}
          <div>
            <SectionHeading>Summary</SectionHeading>
            <Field label="" value={data.summary} onChange={(v) => update({ summary: v })} placeholder="A brief professional summary…" multiline />
          </div>

          {/* Experience */}
          <div>
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-border bg-bg-main p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">Entry</span>
                    <button type="button" onClick={() => removeExperience(exp.id)} className="text-text-secondary hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="Company" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} placeholder="Acme Corp" />
                  <Field label="Role" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} placeholder="Product Manager" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start" value={exp.startDate} onChange={(v) => updateExperience(exp.id, { startDate: v })} placeholder="Jan 2020" />
                    <Field label="End" value={exp.current ? "Present" : exp.endDate} onChange={(v) => updateExperience(exp.id, { endDate: v })} placeholder="Dec 2022" />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, { current: e.target.checked })} />
                    Current role
                  </label>
                  <Field label="Description" value={exp.description} onChange={(v) => updateExperience(exp.id, { description: v })} placeholder="Key achievements and responsibilities…" multiline />
                </div>
              ))}
            </div>
            <button type="button" onClick={addExperience} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add experience
            </button>
          </div>

          {/* Education */}
          <div>
            <SectionHeading>Education</SectionHeading>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="rounded-lg border border-border bg-bg-main p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary">Entry</span>
                    <button type="button" onClick={() => removeEducation(edu.id)} className="text-text-secondary hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Field label="Institution" value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} placeholder="MIT" />
                  <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} placeholder="BSc" />
                  <Field label="Field of Study" value={edu.field} onChange={(v) => updateEducation(edu.id, { field: v })} placeholder="Computer Science" />
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Start" value={edu.startDate} onChange={(v) => updateEducation(edu.id, { startDate: v })} placeholder="2016" />
                    <Field label="End" value={edu.endDate} onChange={(v) => updateEducation(edu.id, { endDate: v })} placeholder="2020" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addEducation} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add education
            </button>
          </div>

          {/* Skills */}
          <div>
            <SectionHeading>Skills</SectionHeading>
            <Field
              label="Skills (comma-separated)"
              value={skillsString}
              onChange={updateSkills}
              placeholder="React, TypeScript, SQL, Figma"
            />
          </div>
        </div>

        {/* ── Right: live preview ─────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div id="cv-preview">
            <CVPreview title={title} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
