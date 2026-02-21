"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";

// Must stay in sync with TOOL_META in sidebar.tsx
const TOOL_META: Record<string, { label: string }> = {
  "/dashboard/editor":              { label: "New Document" },
  "/dashboard/cv":                  { label: "CV Builder" },
  "/dashboard/pdf-editor":          { label: "PDF Editor" },
  "/dashboard/pdf/merge":           { label: "Merge PDFs" },
  "/dashboard/pdf/split":           { label: "Split PDF" },
  "/dashboard/pdf/compress":        { label: "Compress PDF" },
  "/dashboard/pdf/rotate":          { label: "Rotate PDF" },
  "/dashboard/pdf/delete-pages":    { label: "Delete Pages" },
  "/dashboard/pdf/crop":            { label: "Crop PDF" },
  "/dashboard/pdf/numbering":       { label: "Add Numbering" },
  "/dashboard/pdf/add-image":       { label: "Add Image" },
  "/dashboard/pdf/sign":            { label: "Sign PDF" },
  "/dashboard/pdf/watermark":       { label: "Add Watermark" },
  "/dashboard/pdf/to-word":         { label: "PDF → Word" },
  "/dashboard/pdf/to-jpeg":         { label: "PDF → JPEG" },
  "/dashboard/pdf/to-epub":         { label: "PDF → EPUB" },
  "/dashboard/pdf/from-word":       { label: "Word → PDF" },
  "/dashboard/pdf/from-image":      { label: "Image → PDF" },
  "/dashboard/pdf/from-epub":       { label: "EPUB → PDF" },
  "/dashboard/pdf/compress-image":  { label: "Compress Image" },
  // AI Lab
  "/dashboard/ai/summarizer":       { label: "AI Summarizer" },
  "/dashboard/ai/exam-gen":         { label: "Exam Q&A Gen" },
  "/dashboard/ai/slidedeck":        { label: "SlideDeck Creator" },
  "/dashboard/ai/ocr":              { label: "Image OCR" },
  "/dashboard/ai/chatbot":          { label: "Academic Chat" },
};

export function RecentTools() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("docfocal_recent_tools") ?? "[]"
      ) as string[];
      setRecent(stored.filter((p) => TOOL_META[p]).slice(0, 4));
    } catch {
      // ignore
    }
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className="mb-10">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
        <Clock className="h-3.5 w-3.5" />
        Recently Used
      </h3>
      <div className="flex flex-wrap gap-2">
        {recent.map((href) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-border bg-bg-main px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-all hover:border-brand-primary/40 hover:shadow-md hover:text-brand-primary"
          >
            {TOOL_META[href]?.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
