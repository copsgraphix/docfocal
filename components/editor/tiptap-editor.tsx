"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Toolbar from "./toolbar";
import { updateDocument } from "@/app/actions/documents";
import type { Tables } from "@/lib/supabase/types";

type Document = Tables<"documents">;

type SaveStatus = "saved" | "saving" | "unsaved";

export default function TiptapEditor({ document }: { document: Document }) {
  const [title, setTitle] = useState(document.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");

  const titleRef = useRef(document.title);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      </div>

      {/* Toolbar */}
      {editor && <Toolbar editor={editor} />}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto bg-bg-section">
        <div className="mx-auto max-w-3xl px-8 py-12">
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
