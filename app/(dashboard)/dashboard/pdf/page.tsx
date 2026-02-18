"use client";
// Note: metadata must be in a server component; title is set via PageHeader for this client page

import { useRef, useState } from "react";
import { Upload, X, FileText, Merge, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

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

function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs]);
    setError(null);
    setStatus("idle");
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Add at least 2 PDF files.");
      return;
    }
    setStatus("processing");
    setError(null);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/pdf/merge", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Merge failed");
      }
      downloadBlob(await res.blob(), "merged.pdf");
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
      setStatus("idle");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
          <Merge className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Merge PDFs</h3>
          <p className="text-xs text-text-secondary">Combine multiple PDFs into one file</p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="mb-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="flex-1 truncate text-sm text-text-primary">{file.name}</span>
              <span className="shrink-0 text-xs text-text-secondary">{formatBytes(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="rounded p-0.5 text-text-secondary hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload area */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-6 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary"
      >
        <Upload className="h-4 w-4" />
        {files.length === 0 ? "Click to select PDF files" : "Add more PDFs"}
      </button>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {status === "done" && (
        <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Merged PDF downloaded successfully.
        </p>
      )}

      <button
        type="button"
        onClick={handleMerge}
        disabled={files.length < 2 || status === "processing"}
        className={cn(
          "w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity",
          files.length < 2 || status === "processing"
            ? "cursor-not-allowed bg-brand-primary/40"
            : "bg-brand-primary hover:opacity-90"
        )}
      >
        {status === "processing" ? "Merging…" : "Merge & Download"}
      </button>
    </div>
  );
}

function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSplit = async () => {
    if (!file) {
      setError("Select a PDF file first.");
      return;
    }
    if (!pages.trim()) {
      setError("Enter a page range (e.g. 1-3, 5, 7-9).");
      return;
    }
    setStatus("processing");
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", pages);
    try {
      const res = await fetch("/api/pdf/split", { method: "POST", body: formData });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Split failed");
      }
      downloadBlob(await res.blob(), "extracted.pdf");
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed.");
      setStatus("idle");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-bg-main p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
          <Scissors className="h-5 w-5 text-brand-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Extract Pages</h3>
          <p className="text-xs text-text-secondary">Pull specific pages from a PDF</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          setError(null);
          setStatus("idle");
        }}
      />

      {file ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-bg-section px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-brand-primary" />
          <span className="flex-1 truncate text-sm text-text-primary">{file.name}</span>
          <span className="shrink-0 text-xs text-text-secondary">{formatBytes(file.size)}</span>
          <button
            type="button"
            onClick={() => { setFile(null); setStatus("idle"); }}
            className="rounded p-0.5 text-text-secondary hover:text-red-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-bg-section px-4 py-6 text-sm text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          <Upload className="h-4 w-4" />
          Click to select a PDF
        </button>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-text-secondary">
          Page range
        </label>
        <input
          type="text"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="e.g. 1-3, 5, 7-9"
          className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <p className="mt-1 text-xs text-text-secondary">
          Use commas to separate ranges: <span className="font-mono">1-3, 5, 8-10</span>
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {status === "done" && (
        <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Extracted PDF downloaded successfully.
        </p>
      )}

      <button
        type="button"
        onClick={handleSplit}
        disabled={!file || status === "processing"}
        className={cn(
          "w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity",
          !file || status === "processing"
            ? "cursor-not-allowed bg-brand-primary/40"
            : "bg-brand-primary hover:opacity-90"
        )}
      >
        {status === "processing" ? "Extracting…" : "Extract & Download"}
      </button>
    </div>
  );
}

export default function PDFToolkitPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">PDF Toolkit</h2>
        <p className="mt-1 text-text-secondary">
          Merge multiple PDFs or extract specific pages — all processed in your browser session.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <MergeTool />
        <SplitTool />
      </div>
    </div>
  );
}
