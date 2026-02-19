"use client";

import { useRef, useState, useEffect } from "react";
import {
  Upload, X, FileText, Merge, Scissors, Image, FileOutput,
  FileInput, BookOpen, RotateCw, Trash2, Crop, PenLine, Hash,
  ImagePlus, Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ToolHeader({ icon, title, description }: {
  icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

function SingleFileInput({ file, accept, onFile, label }: {
  file: File | null; accept: string; onFile: (f: File | null) => void; label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      {file ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
          <span className="flex-1 truncate text-sm text-text-primary">{file.name}</span>
          <span className="shrink-0 text-xs text-text-secondary">{formatBytes(file.size)}</span>
          <button type="button" onClick={() => onFile(null)}
            className="rounded p-0.5 text-text-secondary hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-6 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary">
          <Upload className="h-4 w-4" />
          {label}
        </button>
      )}
    </>
  );
}

function StatusMessages({ error, done, doneMsg }: {
  error: string | null; done: boolean; doneMsg: string;
}) {
  return (
    <>
      {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {done  && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{doneMsg}</p>}
    </>
  );
}

function ActionButton({ onClick, disabled, processing, label, processingLabel }: {
  onClick: () => void; disabled: boolean; processing: boolean; label: string; processingLabel: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={cn(
        "w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity",
        disabled ? "cursor-not-allowed bg-brand-primary/40" : "bg-brand-primary hover:opacity-90"
      )}>
      {processing ? processingLabel : label}
    </button>
  );
}

// ─── PDF TOOLKIT tools ────────────────────────────────────────────────────────

export function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFiles((prev) => [...prev, ...Array.from(incoming).filter((f) => f.type === "application/pdf")]);
    setError(null); setStatus("idle");
  };

  const handleMerge = async () => {
    if (files.length < 2) { setError("Add at least 2 PDF files."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/pdf/merge", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Merge failed"); }
      downloadBlob(await res.blob(), "merged.pdf"); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Merge failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Merge className="h-5 w-5 text-brand-primary" />}
        title="Merge PDFs" description="Combine multiple PDFs into one file" />
      {files.length > 0 && (
        <ul className="mb-4 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="flex-1 truncate text-sm text-text-primary">{f.name}</span>
              <span className="shrink-0 text-xs text-text-secondary">{formatBytes(f.size)}</span>
              <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-text-secondary hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
        onChange={(e) => addFiles(e.target.files)} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-6 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary">
        <Upload className="h-4 w-4" />
        {files.length === 0 ? "Click to select PDF files" : "Add more PDFs"}
      </button>
      <StatusMessages error={error} done={status === "done"} doneMsg="Merged PDF downloaded." />
      <ActionButton onClick={handleMerge} disabled={files.length < 2 || status === "processing"}
        processing={status === "processing"} label="Merge & Download" processingLabel="Merging…" />
    </div>
  );
}

export function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSplit = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    if (!pages.trim()) { setError("Enter a page range (e.g. 1-3, 5, 7-9)."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("pages", pages);
    try {
      const res = await fetch("/api/pdf/split", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Split failed"); }
      downloadBlob(await res.blob(), "extracted.pdf"); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Split failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Scissors className="h-5 w-5 text-brand-primary" />}
        title="Extract Pages" description="Pull specific pages from a PDF" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-secondary">Page range</label>
        <input type="text" value={pages} onChange={(e) => setPages(e.target.value)}
          placeholder="e.g. 1-3, 5, 7-9"
          className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        <p className="mt-1 text-xs text-text-secondary">
          Separate ranges with commas: <span className="font-mono">1-3, 5, 8-10</span>
        </p>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Extracted PDF downloaded." />
      <ActionButton onClick={handleSplit} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Extract & Download" processingLabel="Extracting…" />
    </div>
  );
}

export function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<"90" | "180" | "270">("90");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleRotate = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("angle", angle);
    if (pages.trim()) fd.append("pages", pages);
    try {
      const res = await fetch("/api/pdf/rotate", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, "-rotated.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Rotation failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<RotateCw className="h-5 w-5 text-brand-primary" />}
        title="Rotate PDF" description="Rotate pages by 90°, 180°, or 270°" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4 flex gap-2">
        {(["90", "180", "270"] as const).map((a) => (
          <button key={a} type="button" onClick={() => setAngle(a)}
            className={cn("flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              angle === a ? "border-brand-primary bg-brand-primary text-white" : "border-border bg-bg-section text-text-secondary hover:border-brand-primary"
            )}>{a}°</button>
        ))}
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-secondary">Pages (optional — blank = all)</label>
        <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1-3, 5"
          className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Rotated PDF downloaded." />
      <ActionButton onClick={handleRotate} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Rotate & Download" processingLabel="Rotating…" />
    </div>
  );
}

export function DeletePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    if (!pages.trim()) { setError("Enter page numbers to delete."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("pages", pages);
    try {
      const res = await fetch("/api/pdf/delete-pages", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, "-edited.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Trash2 className="h-5 w-5 text-brand-primary" />}
        title="Delete Pages" description="Remove specific pages from a PDF" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-secondary">Pages to delete</label>
        <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 2, 4-6, 9"
          className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        <p className="mt-1 text-xs text-text-secondary">Ranges supported: <span className="font-mono">2, 4-6, 9</span></p>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="PDF downloaded with pages removed." />
      <ActionButton onClick={handleDelete} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Delete & Download" processingLabel="Processing…" />
    </div>
  );
}

export function CropTool() {
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ top: "0", bottom: "0", left: "0", right: "0" });
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleCrop = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file);
    Object.entries(crop).forEach(([k, v]) => fd.append(k, v));
    try {
      const res = await fetch("/api/pdf/crop", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, "-cropped.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Crop failed."); setStatus("idle"); }
  };

  const inputCls = "w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary";

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Crop className="h-5 w-5 text-brand-primary" />}
        title="Crop PDF" description="Trim margins from each side of every page" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4 grid grid-cols-2 gap-3">
        {(["top", "bottom", "left", "right"] as const).map((side) => (
          <div key={side}>
            <label className="mb-1 block text-xs font-medium capitalize text-text-secondary">{side} trim %</label>
            <input type="number" min="0" max="49" value={crop[side]}
              onChange={(e) => setCrop((p) => ({ ...p, [side]: e.target.value }))} className={inputCls} />
          </div>
        ))}
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Cropped PDF downloaded." />
      <ActionButton onClick={handleCrop} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Crop & Download" processingLabel="Cropping…" />
    </div>
  );
}

export function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [startNumber, setStartNumber] = useState("1");
  const [position, setPosition] = useState<"center" | "left" | "right">("center");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("startNumber", startNumber); fd.append("position", position);
    try {
      const res = await fetch("/api/pdf/page-numbers", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, "-numbered.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Hash className="h-5 w-5 text-brand-primary" />}
        title="Add Page Numbers" description="Add page numbers to the bottom of each page" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Start number</label>
          <input type="number" min="1" value={startNumber} onChange={(e) => setStartNumber(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Position</label>
          <div className="flex gap-2">
            {(["left", "center", "right"] as const).map((pos) => (
              <button key={pos} type="button" onClick={() => setPosition(pos)}
                className={cn("flex-1 rounded-lg border px-3 py-1.5 text-sm capitalize font-medium transition-colors",
                  position === pos ? "border-brand-primary bg-brand-primary text-white" : "border-border bg-bg-section text-text-secondary hover:border-brand-primary"
                )}>{pos}</button>
            ))}
          </div>
        </div>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Numbered PDF downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Add Numbers & Download" processingLabel="Numbering…" />
    </div>
  );
}

export function AddImageToPdfTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [page, setPage] = useState("1");
  const [pos, setPos] = useState({ x: "10", y: "10", w: "30", h: "20" });
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handle = async () => {
    if (!pdfFile) { setError("Select a PDF file first."); return; }
    if (!imgFile) { setError("Select an image file."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", pdfFile); fd.append("image", imgFile); fd.append("page", page);
    Object.entries(pos).forEach(([k, v]) => fd.append(k, v));
    try {
      const res = await fetch("/api/pdf/add-image-to-pdf", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), pdfFile.name.replace(/\.pdf$/i, "-with-image.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); setStatus("idle"); }
  };

  const numInput = "w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary";

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<ImagePlus className="h-5 w-5 text-brand-primary" />}
        title="Add Image to PDF" description="Embed an image on a specific page" />
      <SingleFileInput file={pdfFile} accept=".pdf,application/pdf"
        onFile={(f) => { setPdfFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" className="hidden"
        onChange={(e) => setImgFile(e.target.files?.[0] ?? null)} />
      {imgFile ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
          <span className="flex-1 truncate text-sm text-text-primary">{imgFile.name}</span>
          <button type="button" onClick={() => setImgFile(null)}
            className="rounded p-0.5 text-text-secondary hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <button type="button" onClick={() => imgInputRef.current?.click()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-3 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary">
          <Upload className="h-4 w-4" /> Select image (JPEG / PNG)
        </button>
      )}
      <div className="mb-4 space-y-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Target page</label>
          <input type="number" min="1" value={page} onChange={(e) => setPage(e.target.value)} className={numInput} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["x", "y", "w", "h"] as const).map((k) => (
            <div key={k}>
              <label className="mb-1 block text-xs font-medium text-text-secondary">
                {k === "x" ? "Left %" : k === "y" ? "Top %" : k === "w" ? "Width %" : "Height %"}
              </label>
              <input type="number" min="0" max="100" value={pos[k]}
                onChange={(e) => setPos((p) => ({ ...p, [k]: e.target.value }))} className={numInput} />
            </div>
          ))}
        </div>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="PDF with image downloaded." />
      <ActionButton onClick={handle} disabled={!pdfFile || !imgFile || status === "processing"}
        processing={status === "processing"} label="Add & Download" processingLabel="Embedding…" />
    </div>
  );
}

// ─── SECURE tools ─────────────────────────────────────────────────────────────

export function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(25);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    if (!text.trim()) { setError("Enter watermark text."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("text", text); fd.append("opacity", String(opacity / 100));
    try {
      const res = await fetch("/api/pdf/watermark", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, "-watermarked.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Watermark failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<PenLine className="h-5 w-5 text-brand-primary" />}
        title="Add Watermark" description="Stamp diagonal text on every page" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Watermark text</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. CONFIDENTIAL"
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Opacity: {opacity}%</label>
          <input type="range" min="10" max="60" value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-brand-primary" />
        </div>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Watermarked PDF downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Apply & Download" processingLabel="Applying…" />
    </div>
  );
}

const SIGN_POSITIONS = [
  { label: "Bottom Left",   x: "5",  y: "82" },
  { label: "Bottom Center", x: "28", y: "82" },
  { label: "Bottom Right",  x: "60", y: "82" },
] as const;

export function SignTool() {
  const [pdfFile, setPdfFile]   = useState<File | null>(null);
  const [mode, setMode]         = useState<"draw" | "type">("draw");
  const [typedSig, setTypedSig] = useState("");
  const [page, setPage]         = useState("1");
  const [preset, setPreset]     = useState<string>(SIGN_POSITIONS[0].label);
  const [xPct, setXPct]         = useState<string>(SIGN_POSITIONS[0].x);
  const [yPct, setYPct]         = useState<string>(SIGN_POSITIONS[0].y);
  const [wPct, setWPct]         = useState("25");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [status, setStatus]     = useState<"idle" | "processing" | "done">("idle");
  const [error, setError]       = useState<string | null>(null);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDown     = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (mode !== "draw") return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.strokeStyle = "#111111";
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    setHasDrawn(false);
  }, [mode]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect   = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width  / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDown.current = true; lastPos.current = getPos(e); setHasDrawn(true);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDown.current || !lastPos.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    lastPos.current = pos;
  };
  const onUp = () => { isDown.current = false; lastPos.current = null; };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setHasDrawn(false);
  };

  const selectPreset = (p: (typeof SIGN_POSITIONS)[number]) => {
    setPreset(p.label); setXPct(p.x); setYPct(p.y);
  };

  const getSignatureBlob = (): Promise<Blob> => {
    if (mode === "draw") {
      return new Promise((resolve, reject) =>
        canvasRef.current!.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), "image/png"
        )
      );
    }
    const offscreen = document.createElement("canvas");
    offscreen.width = 520; offscreen.height = 120;
    const ctx = offscreen.getContext("2d")!;
    ctx.font = "italic 52px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#111111"; ctx.textBaseline = "middle";
    ctx.fillText(typedSig, 16, 62);
    return new Promise((resolve, reject) =>
      offscreen.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))), "image/png"
      )
    );
  };

  const handleSign = async () => {
    if (!pdfFile)                             { setError("Select a PDF file first.");          return; }
    if (mode === "draw"  && !hasDrawn)        { setError("Draw your signature on the canvas."); return; }
    if (mode === "type"  && !typedSig.trim()) { setError("Type your signature text.");          return; }
    setStatus("processing"); setError(null);
    try {
      const sigBlob = await getSignatureBlob();
      const fd = new FormData();
      fd.append("file", pdfFile); fd.append("signature", sigBlob, "signature.png");
      fd.append("page", page); fd.append("x", xPct); fd.append("y", yPct); fd.append("w", wPct);
      const res = await fetch("/api/pdf/sign", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Sign failed"); }
      downloadBlob(await res.blob(), pdfFile.name.replace(/\.pdf$/i, "-signed.pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Sign failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<PenLine className="h-5 w-5 text-brand-primary" />}
        title="Sign PDF" description="Draw or type your signature and embed it into the document" />
      <SingleFileInput file={pdfFile} accept=".pdf,application/pdf"
        onFile={(f) => { setPdfFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-bg-section p-1">
        {(["draw", "type"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn("flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors",
              mode === m ? "bg-bg-main text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
            )}>
            {m === "draw" ? "✏️ Draw" : "⌨️ Type"}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">Sign in the box below</label>
            <button type="button" onClick={clearCanvas}
              className="text-xs text-text-secondary transition-colors hover:text-red-500">Clear</button>
          </div>
          <canvas ref={canvasRef} width={480} height={120}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            className="w-full cursor-crosshair rounded-lg border border-border bg-white"
            style={{ touchAction: "none" }} />
          <p className="mt-1 text-xs text-text-secondary">Use mouse or finger to draw</p>
        </div>
      ) : (
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-text-secondary">Type your name</label>
          <input type="text" value={typedSig} onChange={(e) => setTypedSig(e.target.value)}
            placeholder="Your name or initials"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: "1.35rem" }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
          <p className="mt-1 text-xs text-text-secondary">Rendered in italic serif style</p>
        </div>
      )}

      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Page number</label>
          <input type="number" min="1" value={page} onChange={(e) => setPage(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Position</label>
          <div className="flex gap-2">
            {SIGN_POSITIONS.map((p) => (
              <button key={p.label} type="button" onClick={() => selectPreset(p)}
                className={cn("flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors",
                  preset === p.label ? "border-brand-primary bg-brand-primary text-white" : "border-border bg-bg-section text-text-secondary hover:border-brand-primary"
                )}>{p.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Size: {wPct}% of page width</label>
          <input type="range" min="10" max="50" value={wPct}
            onChange={(e) => setWPct(e.target.value)} className="w-full accent-brand-primary" />
        </div>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Signed PDF downloaded." />
      <ActionButton onClick={handleSign} disabled={!pdfFile || status === "processing"}
        processing={status === "processing"} label="Sign & Download" processingLabel="Signing…" />
    </div>
  );
}

// ─── CONVERT tools ────────────────────────────────────────────────────────────

export function PdfToDocTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/pdf/pdf-to-doc", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Conversion failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, ".docx")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<FileOutput className="h-5 w-5 text-brand-primary" />}
        title="PDF → Word" description="Export PDF text as a Word document" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <p className="mb-4 text-xs text-text-secondary">Text content only — images and complex formatting are not retained.</p>
      <StatusMessages error={error} done={status === "done"} doneMsg=".docx downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Extracting text…" />
    </div>
  );
}

export function PdfToJpegTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const blobs: { blob: Blob; name: string }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp, canvas }).promise;
        const blob = await new Promise<Blob>((res, rej) =>
          canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.92)
        );
        blobs.push({ blob, name: `page-${i}.jpg` });
      }
      const base = file.name.replace(/\.pdf$/i, "");
      if (blobs.length === 1) {
        downloadBlob(blobs[0].blob, `${base}-page-1.jpg`);
      } else {
        const JSZip = (await import("jszip")).default;
        const zip = new JSZip();
        blobs.forEach(({ blob, name }) => zip.file(name, blob));
        downloadBlob(await zip.generateAsync({ type: "blob" }), `${base}-pages.zip`);
      }
      setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Image className="h-5 w-5 text-brand-primary" />}
        title="PDF → JPEG" description="Export each page as a JPEG image" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <StatusMessages error={error} done={status === "done"}
        doneMsg="Single page → .jpg · Multiple pages → .zip" />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Rendering pages…" />
    </div>
  );
}

export function PdfToEpubTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/pdf/pdf-to-epub", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Conversion failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.pdf$/i, ".epub")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<BookOpen className="h-5 w-5 text-brand-primary" />}
        title="PDF → EPUB" description="Export PDF text as an eBook" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <p className="mb-4 text-xs text-text-secondary">Text content only — images and complex formatting are not retained.</p>
      <StatusMessages error={error} done={status === "done"} doneMsg=".epub downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Building EPUB…" />
    </div>
  );
}

export function DocToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a .docx file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/pdf/doc-to-pdf", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Conversion failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.(docx?|odt)$/i, ".pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<FileInput className="h-5 w-5 text-brand-primary" />}
        title="Word → PDF" description="Convert a Word document to PDF" />
      <SingleFileInput file={file} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a .docx file" />
      <StatusMessages error={error} done={status === "done"} doneMsg="PDF downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Converting…" />
    </div>
  );
}

export function JpegToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const imgs = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/jpeg") || f.type === "image/png" || /\.(jpe?g|png)$/i.test(f.name)
    );
    setFiles((prev) => [...prev, ...imgs]); setError(null); setStatus("idle");
  };

  const handle = async () => {
    if (!files.length) { setError("Add at least one image."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData(); files.forEach((f) => fd.append("files", f));
    try {
      const res = await fetch("/api/pdf/jpeg-to-pdf", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Conversion failed"); }
      downloadBlob(await res.blob(), "images.pdf"); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Image className="h-5 w-5 text-brand-primary" />}
        title="Image → PDF" description="Convert JPEG or PNG images into a single PDF" />
      {files.length > 0 && (
        <ul className="mb-4 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="flex-1 truncate text-sm text-text-primary">{f.name}</span>
              <span className="shrink-0 text-xs text-text-secondary">{formatBytes(f.size)}</span>
              <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-text-secondary hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple className="hidden"
        onChange={(e) => addFiles(e.target.files)} />
      <button type="button" onClick={() => inputRef.current?.click()}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-6 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary">
        <Upload className="h-4 w-4" />
        {files.length === 0 ? "Click to select images" : "Add more images"}
      </button>
      <StatusMessages error={error} done={status === "done"} doneMsg="PDF downloaded." />
      <ActionButton onClick={handle} disabled={!files.length || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Converting…" />
    </div>
  );
}

export function EpubToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select an EPUB file first."); return; }
    setStatus("processing"); setError(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/pdf/epub-to-pdf", { method: "POST", body: fd });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? "Conversion failed"); }
      downloadBlob(await res.blob(), file.name.replace(/\.epub$/i, ".pdf")); setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Conversion failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<BookOpen className="h-5 w-5 text-brand-primary" />}
        title="EPUB → PDF" description="Convert an eBook to PDF" />
      <SingleFileInput file={file} accept=".epub"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select an EPUB file" />
      <StatusMessages error={error} done={status === "done"} doneMsg="PDF downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Convert & Download" processingLabel="Converting…" />
    </div>
  );
}

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select a PDF file first."); return; }
    setStatus("processing"); setError(null); setProgress(null);
    try {
      // Dynamic imports keep the initial bundle lean
      const [{ PDFDocument }, pdfjsLib] = await Promise.all([
        import("pdf-lib"),
        import("pdfjs-dist"),
      ]);
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const originalBytes = await file.arrayBuffer();
      const srcPdf = await pdfjsLib.getDocument({ data: originalBytes }).promise;
      const numPages = srcPdf.numPages;
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Compressing page ${i} of ${numPages}…`);
        const page = await srcPdf.getPage(i);
        // Scale 1.5 × JPEG 0.75 gives ~60-75% smaller than the original for image-heavy PDFs
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        // pdfjs-dist v5 requires the canvas element in RenderParameters
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp, canvas }).promise;
        const jpegArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) =>
          canvas.toBlob(
            (blob) => (blob ? blob.arrayBuffer().then(resolve) : reject(new Error("toBlob failed"))),
            "image/jpeg",
            0.75
          )
        );
        const jpegImage = await newPdf.embedJpg(new Uint8Array(jpegArrayBuffer));
        const pdfPage = newPdf.addPage([vp.width, vp.height]);
        pdfPage.drawImage(jpegImage, { x: 0, y: 0, width: vp.width, height: vp.height });
      }

      const compressedBytes = await newPdf.save({ useObjectStreams: true });
      // compressedBytes.buffer is ArrayBufferLike; cast to ArrayBuffer for Blob ctor
      downloadBlob(new Blob([compressedBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
        file.name.replace(/\.pdf$/i, "-compressed.pdf"));
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
      setStatus("idle");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Minimize2 className="h-5 w-5 text-brand-primary" />}
        title="Compress PDF" description="Re-render pages as compressed images to shrink file size" />
      <SingleFileInput file={file} accept=".pdf,application/pdf"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select a PDF" />
      <p className="mb-4 text-xs text-text-secondary">
        Pages are re-rendered at reduced quality. Typically 50–75% smaller. Output will not be text-searchable.
      </p>
      {progress && <p className="mb-3 text-sm text-text-secondary">{progress}</p>}
      <StatusMessages error={error} done={status === "done"} doneMsg="Compressed PDF downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Compress & Download" processingLabel="Compressing…" />
    </div>
  );
}

export function CompressImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [maxDim, setMaxDim] = useState("2000");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!file) { setError("Select an image file first."); return; }
    setStatus("processing"); setError(null);
    try {
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;
      const limit = parseInt(maxDim) || 2000;
      if (width > limit || height > limit) {
        const ratio = Math.min(limit / width, limit / height);
        width = Math.round(width * ratio); height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", quality / 100)
      );
      downloadBlob(blob, file.name.replace(/\.(png|jpe?g|webp)$/i, "-compressed.jpg"));
      setStatus("done");
    } catch (e) { setError(e instanceof Error ? e.message : "Compression failed."); setStatus("idle"); }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <ToolHeader icon={<Image className="h-5 w-5 text-brand-primary" />}
        title="Compress Image" description="Resize and re-compress JPEG/PNG images" />
      <SingleFileInput file={file} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        onFile={(f) => { setFile(f); setError(null); setStatus("idle"); }} label="Click to select an image" />
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Quality: {quality}%</label>
          <input type="range" min="20" max="95" value={quality}
            onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-brand-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text-secondary">Max dimension (px)</label>
          <input type="number" min="200" max="8000" value={maxDim}
            onChange={(e) => setMaxDim(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary" />
        </div>
      </div>
      <StatusMessages error={error} done={status === "done"} doneMsg="Compressed image downloaded." />
      <ActionButton onClick={handle} disabled={!file || status === "processing"}
        processing={status === "processing"} label="Compress & Download" processingLabel="Compressing…" />
    </div>
  );
}
