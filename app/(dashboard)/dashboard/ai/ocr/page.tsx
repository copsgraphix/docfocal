"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, ImageIcon, Loader2, Download, X, Copy } from "lucide-react";
import { AiEnergyModal } from "@/components/dashboard/ai-energy-modal";
import { NoEnergyModal } from "@/components/no-energy-modal";

export default function OcrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noEnergy, setNoEnergy] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setText("");
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleExtract() {
    if (!file) return;
    setExtracting(true);
    setError("");
    setText("");
    setConfirmOpen(false);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/ocr", { method: "POST", body: formData });
      if (res.status === 402) { setNoEnergy(true); return; }
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Extraction failed.");
        return;
      }
      const data = await res.json();
      setText(data.text ?? "");
    } finally {
      setExtracting(false);
    }
  }

  async function handleDownload() {
    if (!file || !text) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/ai/ocr?download=1", { method: "POST", body: formData });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.(jpe?g|png|webp|gif)$/i, "") + "-ocr.docx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-text-primary">Image Text Scanner (OCR)</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload an image and AI vision will extract all text from it.{" "}
          <span className="font-medium text-brand-primary">Costs 3 Energy.</span>
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`mb-4 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-brand-primary bg-brand-primary/5"
          : file ? "border-brand-primary/40 bg-brand-primary/5 cursor-default"
          : "border-border bg-bg-main hover:border-brand-primary/30"
        }`}
      >
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file && preview ? (
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="h-24 w-24 rounded-lg object-cover border border-border" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">{file.name}</p>
              <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(0)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(""); setText(""); setError(""); }}
                className="mt-2 flex items-center gap-1 text-xs text-text-secondary hover:text-red-600">
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon className="mb-3 h-8 w-8 text-text-secondary" />
            <p className="text-sm font-medium text-text-primary">Drop an image here</p>
            <p className="mt-1 text-xs text-text-secondary">JPEG, PNG, WebP, GIF · max 5 MB</p>
          </>
        )}
      </div>

      <button onClick={() => setConfirmOpen(true)} disabled={!file || extracting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
        {extracting ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning…</> : "✦ Extract Text — 3 Energy"}
      </button>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {text && (
        <div className="mt-6 rounded-xl border border-border bg-bg-main p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Extracted Text</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-section">
                <Copy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-section">
                <Download className="h-3.5 w-3.5" /> Download DOCX
              </button>
            </div>
          </div>
          <div className="whitespace-pre-wrap rounded-lg bg-bg-section p-4 text-sm text-text-primary leading-relaxed">
            {text}
          </div>
        </div>
      )}

      <AiEnergyModal open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={handleExtract} loading={extracting} />
      <NoEnergyModal open={noEnergy} onClose={() => setNoEnergy(false)} />
    </div>
  );
}
