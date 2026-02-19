"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Undo, Redo, Link, ImageIcon, Minus,
  Highlighter, Indent, Outdent, Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// ── Emoji / Symbol data ────────────────────────────────────────────────────
const EMOJIS = [
  "😀","😂","🥰","😍","🤔","😎","🤩","😅","😊","🙏",
  "👍","👎","❤️","🔥","✅","❌","⭐","🎉","💡","📌",
  "📎","✏️","📝","🔍","💬","📧","💰","📊","📈","🎯",
  "🚀","🌍","🎨","🧠","⚡","🛡️","🔔","🎵","📸","🏆",
];
const SYMBOLS = [
  "©","®","™","°","±","×","÷","≤","≥","≠",
  "≈","∞","→","←","↑","↓","↔","§","¶","†",
  "‡","•","…","—","–","½","¼","¾","€","£",
  "¥","₦","√","∑","π","Ω","μ","∂","∫","∏",
];

// ── Sub-components ─────────────────────────────────────────────────────────
function Btn({
  onClick, isActive, title, children, disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "rounded p-1.5 transition-colors",
        isActive
          ? "bg-brand-primary text-white"
          : "text-text-secondary hover:bg-bg-section hover:text-text-primary",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px bg-border shrink-0" />;
}

// ── Main toolbar ───────────────────────────────────────────────────────────
export default function Toolbar({
  editor,
  onImageClick,
}: {
  editor: Editor;
  onImageClick: () => void;
}) {
  const [showLinkInput, setShowLinkInput]   = useState(false);
  const [linkUrl, setLinkUrl]               = useState("https://");
  const [showPicker, setShowPicker]         = useState(false);
  const [pickerTab, setPickerTab]           = useState<"emoji" | "symbols">("emoji");
  const [highlightColor, setHighlightColor] = useState("#FFE066");

  const linkRef   = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close popups on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) {
        setShowLinkInput(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applyLink = () => {
    const url = linkUrl.trim();
    if (url && url !== "https://") {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("https://");
  };

  const handleLinkBtn = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    } else {
      setLinkUrl(editor.getAttributes("link").href || "https://");
      setShowLinkInput(true);
    }
  };

  const insertChar = (char: string) => {
    editor.chain().focus().insertContent(char).run();
    setShowPicker(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmds = editor.commands as any;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-bg-main px-3 py-2">

      {/* ── Formatting ── */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()}      isActive={editor.isActive("bold")}      title="Bold"><Bold className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()}    isActive={editor.isActive("italic")}    title="Italic"><Italic className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline"><Underline className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()}    isActive={editor.isActive("strike")}    title="Strikethrough"><Strikethrough className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()}      isActive={editor.isActive("code")}      title="Inline code"><Code className="h-4 w-4" /></Btn>

      <Sep />

      {/* ── Highlight ── */}
      <div className="flex items-center" title="Text highlight">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
          }}
          className={cn(
            "rounded-l p-1.5 transition-colors",
            editor.isActive("highlight")
              ? "bg-brand-primary text-white"
              : "text-text-secondary hover:bg-bg-section hover:text-text-primary"
          )}
          title="Apply highlight"
        >
          <Highlighter className="h-4 w-4" />
        </button>
        <input
          type="color"
          value={highlightColor}
          onChange={(e) => setHighlightColor(e.target.value)}
          className="h-7 w-5 cursor-pointer rounded-r border-l border-border p-0"
          title="Pick highlight colour"
        />
      </div>

      <Sep />

      {/* ── Headings ── */}
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="h-4 w-4" /></Btn>

      <Sep />

      {/* ── Lists & quote ── */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}  isActive={editor.isActive("bulletList")}  title="Bullet list"><List className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered list"><ListOrdered className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}  isActive={editor.isActive("blockquote")}  title="Quote"><Quote className="h-4 w-4" /></Btn>

      <Sep />

      {/* ── Indentation ── */}
      <Btn onClick={() => cmds.decreaseIndent()} title="Decrease indent"><Outdent className="h-4 w-4" /></Btn>
      <Btn onClick={() => cmds.increaseIndent()} title="Increase indent"><Indent className="h-4 w-4" /></Btn>

      <Sep />

      {/* ── Link ── */}
      <div className="relative" ref={linkRef}>
        <Btn onClick={handleLinkBtn} isActive={editor.isActive("link")} title={editor.isActive("link") ? "Remove link" : "Add hyperlink"}>
          <Link className="h-4 w-4" />
        </Btn>
        {showLinkInput && (
          <div className="absolute left-0 top-full z-50 mt-1 flex w-72 items-center gap-1 rounded-lg border border-border bg-bg-main p-2 shadow-lg">
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyLink();
                if (e.key === "Escape") setShowLinkInput(false);
              }}
              placeholder="https://example.com"
              className="flex-1 rounded border border-border bg-bg-section px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); applyLink(); }}
              className="rounded bg-brand-primary px-2 py-1 text-xs font-semibold text-white"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* ── Image ── */}
      <Btn onClick={onImageClick} title="Insert image">
        <ImageIcon className="h-4 w-4" />
      </Btn>

      {/* ── Divider (HR) ── */}
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Insert divider">
        <Minus className="h-4 w-4" />
      </Btn>

      <Sep />

      {/* ── Emoji & Symbols ── */}
      <div className="relative" ref={pickerRef}>
        <Btn onClick={() => setShowPicker((v) => !v)} isActive={showPicker} title="Emoji & symbols">
          <Smile className="h-4 w-4" />
        </Btn>
        {showPicker && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-bg-main shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["emoji", "symbols"] as const).map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold capitalize transition-colors",
                    pickerTab === tab
                      ? "border-b-2 border-brand-primary text-brand-primary"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                  onClick={() => setPickerTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Grid */}
            <div className="grid grid-cols-10 gap-0.5 overflow-y-auto p-2" style={{ maxHeight: "9rem" }}>
              {(pickerTab === "emoji" ? EMOJIS : SYMBOLS).map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); insertChar(item); }}
                  className="flex items-center justify-center rounded p-0.5 text-sm hover:bg-bg-section"
                  title={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Sep />

      {/* ── History ── */}
      <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}><Undo className="h-4 w-4" /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}><Redo className="h-4 w-4" /></Btn>
    </div>
  );
}
