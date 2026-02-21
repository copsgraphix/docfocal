"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import { Extension } from "@tiptap/core";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, Loader2, CheckCircle2, X } from "lucide-react";
import Toolbar from "./toolbar";
import { updateDocument } from "@/app/actions/documents";
import type { Tables } from "@/lib/supabase/types";
import { AiEnergyModal } from "@/components/dashboard/ai-energy-modal";
import { NoEnergyModal } from "@/components/no-energy-modal";

type Document = Tables<"documents">;
type SaveStatus = "saved" | "saving" | "unsaved";
type ExportFormat = "txt" | "pdf" | "docx" | "epub";

// ── Indent extension ───────────────────────────────────────────────────────
const IndentExtension = Extension.create({
  name: "indent",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          indent: {
            default: 0,
            renderHTML: (attrs) =>
              attrs.indent > 0
                ? { style: `padding-left: ${(attrs.indent as number) * 2}rem` }
                : {},
            parseHTML: (el) => {
              const match = el.style.paddingLeft?.match(/^([\d.]+)rem$/);
              return match ? Math.round(parseFloat(match[1]) / 2) : 0;
            },
          },
        },
      },
    ];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      increaseIndent:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (["paragraph", "heading"].includes(node.type.name)) {
              const indent = Math.min((node.attrs.indent || 0) + 1, 8);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
      decreaseIndent:
        () =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (["paragraph", "heading"].includes(node.type.name)) {
              const indent = Math.max((node.attrs.indent || 0) - 1, 0);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (
          this.editor.isActive("bulletList") ||
          this.editor.isActive("orderedList")
        ) {
          return this.editor.commands.sinkListItem("listItem");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.editor.commands as any).increaseIndent();
      },
      "Shift-Tab": () => {
        if (
          this.editor.isActive("bulletList") ||
          this.editor.isActive("orderedList")
        ) {
          return this.editor.commands.liftListItem("listItem");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this.editor.commands as any).decreaseIndent();
      },
    };
  },
});

// ── Line Height extension ──────────────────────────────────────────────────
const LineHeightExtension = Extension.create({
  name: "lineHeight",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          lineHeight: {
            default: null,
            renderHTML: (attrs) =>
              attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {},
            parseHTML: (el) => el.style.lineHeight || null,
          },
        },
      },
    ];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      setLineHeight:
        (lineHeight: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (["paragraph", "heading"].includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, lineHeight });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});

// ── Letter Spacing extension ───────────────────────────────────────────────
const LetterSpacingExtension = Extension.create({
  name: "letterSpacing",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          letterSpacing: {
            default: null,
            renderHTML: (attrs) =>
              attrs.letterSpacing
                ? { style: `letter-spacing: ${attrs.letterSpacing}` }
                : {},
            parseHTML: (el) => el.style.letterSpacing || null,
          },
        },
      },
    ];
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(): any {
    return {
      setLetterSpacing:
        (letterSpacing: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ tr, state, dispatch }: any) => {
          const { from, to } = state.selection;
          state.doc.nodesBetween(from, to, (node: any, pos: number) => {
            if (["paragraph", "heading"].includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, letterSpacing });
            }
          });
          if (dispatch) dispatch(tr);
          return true;
        },
    };
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Component ──────────────────────────────────────────────────────────────
export default function TiptapEditor({ document }: { document: Document }) {
  const [title, setTitle]             = useState(document.title);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>("saved");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting]     = useState<ExportFormat | null>(null);

  // Grammar Pro state
  const [grammarConfirmOpen, setGrammarConfirmOpen] = useState(false);
  const [grammarLoading, setGrammarLoading]         = useState(false);
  const [grammarResult, setGrammarResult]           = useState<{ corrected: string; changes: string[] } | null>(null);
  const [grammarError, setGrammarError]             = useState("");
  const [grammarNoEnergy, setGrammarNoEnergy]       = useState(false);

  const titleRef       = useRef(document.title);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exportMenuRef  = useRef<HTMLDivElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

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
      saveTimeoutRef.current = setTimeout(() => save(currentTitle, content), 1000);
    },
    [save]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
      Highlight.configure({ multicolor: true }),
      TiptapImage.configure({ allowBase64: true }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      CharacterCount,
      IndentExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LineHeightExtension,
      LetterSpacingExtension,
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

  // Image upload handler
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      editor?.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const handleGrammarCheck = async () => {
    if (!editor) return;
    setGrammarLoading(true);
    setGrammarResult(null);
    setGrammarError("");
    setGrammarConfirmOpen(false);
    try {
      const text = editor.getText();
      if (!text.trim()) {
        setGrammarError("The document is empty — write some text first.");
        return;
      }
      const res = await fetch("/api/ai/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 402) { setGrammarNoEnergy(true); return; }
      if (!res.ok) {
        const err = await res.json();
        setGrammarError(err.error ?? "Grammar check failed.");
        return;
      }
      const data = await res.json();
      setGrammarResult(data);
    } finally {
      setGrammarLoading(false);
    }
  };

  const applyGrammarCorrections = () => {
    if (!grammarResult || !editor) return;
    // Replace editor content with the corrected text (plain text → paragraphs)
    const paragraphs = grammarResult.corrected
      .split(/\n+/)
      .map((p) => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
      .join("");
    editor.commands.setContent(paragraphs);
    setGrammarResult(null);
    scheduleSave(titleRef.current, JSON.stringify(editor.getJSON()));
  };

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

  // Word / page count
  const wordCount = editor?.storage?.characterCount?.words?.() ?? 0;
  const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;
  const pageCount = Math.max(1, Math.ceil(wordCount / 250));

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col">
      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />

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
          {saveStatus === "saving" ? "Saving…" : saveStatus === "unsaved" ? "Unsaved" : "Saved"}
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
      {editor && (
        <Toolbar
          editor={editor}
          onImageClick={() => fileInputRef.current?.click()}
          onGrammarClick={() => setGrammarConfirmOpen(true)}
        />
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto bg-bg-section">
        <div id="doc-print-area" className="mx-auto max-w-3xl px-8 py-12">
          {/* Editable title */}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              titleRef.current = e.target.value;
              scheduleSave(e.target.value, JSON.stringify(editor?.getJSON() ?? {}));
            }}
            placeholder="Untitled Document"
            className="mb-8 w-full bg-transparent text-4xl font-bold text-text-primary outline-none placeholder:text-text-secondary/30"
          />
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar — word count, page count */}
      <div className="shrink-0 flex items-center justify-between border-t border-border bg-bg-main px-5 py-1.5 text-xs text-text-secondary">
        <span>
          {wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""} ·{" "}
          {charCount.toLocaleString()} characters
        </span>
        <span>
          ~{pageCount} page{pageCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grammar Pro loading indicator */}
      {grammarLoading && (
        <div className="shrink-0 flex items-center gap-2 border-t border-brand-primary/20 bg-brand-primary/5 px-5 py-2.5 text-sm text-brand-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          AI is checking your grammar…
        </div>
      )}

      {/* Grammar Pro error */}
      {grammarError && !grammarLoading && (
        <div className="shrink-0 flex items-center justify-between border-t border-red-200 bg-red-50 px-5 py-2.5">
          <span className="text-sm text-red-700">{grammarError}</span>
          <button onClick={() => setGrammarError("")} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grammar Pro result panel */}
      {grammarResult && !grammarLoading && (
        <div className="shrink-0 border-t border-brand-primary/20 bg-brand-primary/5">
          <div className="flex items-start justify-between px-5 py-3">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-primary" />
                <span className="text-sm font-semibold text-text-primary">Grammar check complete</span>
              </div>
              {grammarResult.changes.length > 0 && (
                <ul className="space-y-0.5 mb-2">
                  {grammarResult.changes.slice(0, 5).map((change, i) => (
                    <li key={i} className="text-xs text-text-secondary">• {change}</li>
                  ))}
                  {grammarResult.changes.length > 5 && (
                    <li className="text-xs text-text-secondary">
                      + {grammarResult.changes.length - 5} more corrections
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setGrammarResult(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-section"
              >
                Dismiss
              </button>
              <button
                onClick={applyGrammarCorrections}
                className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Apply corrections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Pro modals */}
      <AiEnergyModal
        open={grammarConfirmOpen}
        onCancel={() => setGrammarConfirmOpen(false)}
        onConfirm={handleGrammarCheck}
        loading={grammarLoading}
      />
      <NoEnergyModal open={grammarNoEnergy} onClose={() => setGrammarNoEnergy(false)} />
    </div>
  );
}
