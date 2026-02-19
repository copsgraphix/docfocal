"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, Loader2 } from "lucide-react";
import Toolbar from "./toolbar";
import { updateDocument } from "@/app/actions/documents";
import type { Tables } from "@/lib/supabase/types";

type Document = Tables<"documents">;
type SaveStatus = "saved" | "saving" | "unsaved";
type ExportFormat = "txt" | "pdf" | "docx" | "epub";

const EXPORT_OPTIONS: { label: string; format: ExportFormat; ext: string }[] = [
  { label: "Plain Text (.txt)", format: "txt", ext: "txt" },
  { label: "PDF (.pdf)",        format: "pdf", ext: "pdf" },
  { label: "Word (.docx)",      format: "docx", ext: "docx" },
  { label: "EPUB (.epub)",      format: "epub", ext: "epub" },
];

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TiptapEditor({ document }: { document: Document }) {
  const [title, setTitle] = useState(document.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const titleRef = useRef(document.title);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    window.document.addEventListener("mousedown", handler);
    return () => window.document.removeEventListener("mousedown", handler);
  }, []);

  const save = useCallback(
    async (currentTitle: string, content: string) => {
      setSaveStatus("saving");
      await updateDocument(document.id, currentTitle, content);
      setSaveStatus("saved");
    },
    [document.id]
  );

  const scheduleSave = useCallback(
    (currentTitle: string, content: string) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(
        () => save(currentTitle, content),
        1000
      );
    },
    [save]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: (() => {
      try {
        return document.content ? JSON.parse(document.content) : undefined;
      } catch {
        return document.content ?? undefined;
      }
    })(),
    onUpdate({ editor }) {
      scheduleSave(titleRef.current, JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: { class: "editor-prose" },
    },
  });

  const exportAs = async (format: ExportFormat) => {
    setShowExportMenu(false);
    const text = editor?.getText() ?? "";
    const safeName = (title || "document").replace(/[^a-z0-9_\-. ]/gi, "_");

    if (format === "txt") {
      triggerDownload(new Blob([text], { type: "text/plain" }), `${safeName}.txt`);
      return;
    }

    if (format === "pdf") {
      window.print();
      return;
    }

    setExporting(format);
    try {
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: title || "Untitled Document" }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      triggerDownload(blob, `${safeName}.${format}`);
    } catch {
      // silent — user can retry
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Sub-header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-bg-main px-5 py-3">
        <Link
          href="/dashboard/editor"
          className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Documents
        </Link>
        <div className="flex-1" />
        <span className="text-xs text-text-secondary">
          {saveStatus === "saving"
            ? "Saving…"
            : saveStatus === "unsaved"
              ? "Unsaved changes"
              : "Saved"}
        </span>

        {/* Export dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setShowExportMenu((v) => !v)}
            disabled={exporting !== null}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-section px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-main disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export
            <ChevronDown className="h-3 w-3 text-text-secondary" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-bg-main shadow-lg">
              {EXPORT_OPTIONS.map(({ label, format }) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => exportAs(format)}
                  className="block w-full px-4 py-2.5 text-left text-xs text-text-primary transition-colors hover:bg-bg-section"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {editor && <Toolbar editor={editor} />}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto bg-bg-section">
        <div id="doc-print-area" className="mx-auto max-w-3xl px-8 py-12">
          {/* Editable title */}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              titleRef.current = e.target.value;
              scheduleSave(
                e.target.value,
                JSON.stringify(editor?.getJSON() ?? {})
              );
            }}
            placeholder="Untitled Document"
            className="mb-8 w-full bg-transparent text-4xl font-bold text-text-primary outline-none placeholder:text-text-secondary/30"
          />
          {/* Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
