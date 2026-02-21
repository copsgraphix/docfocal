"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileText, Loader2, Download, X } from "lucide-react";
import { AiEnergyModal } from "@/components/dashboard/ai-energy-modal";
import { NoEnergyModal } from "@/components/no-energy-modal";

export default function ExamGenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noEnergy, setNoEnergy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function handleGenerate() {
    if (!file) return;
    setGenerating(true);
    setOutput("");
    setDone(false);
    setConfirmOpen(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/exam-gen", { method: "POST", body: formData });

      if (res.status === 402) { setNoEnergy(true); return; }
      if (!res.ok) {
        const err = await res.json();
        setOutput(`Error: ${err.error ?? "Generation failed."}`);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done: d, value } = await reader.read();
        if (d) break;
        text += decoder.decode(value);
        setOutput(text);
      }
      setDone(true);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDownload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/ai/exam-gen?download=1", { method: "POST", body: formData });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.(pdf|docx?)$/i, "") + "-exam-qa.docx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-text-primary">Exam Q&amp;A Generator</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Upload your study document and AI will generate 10 exam questions with answers.{" "}
          <span className="font-medium text-brand-primary">Costs 3 Energy.</span>
        </p>
      </div>

      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`mb-4 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-brand-primary bg-brand-primary/5"
          : file ? "border-brand-primary/40 bg-brand-primary/5 cursor-default"
          : "border-border bg-bg-main hover:border-brand-primary/30"
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-primary" />
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">{file.name}</p>
              <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setOutput(""); setDone(false); }}
              className="ml-4 rounded-lg p-1 text-text-secondary hover:bg-bg-section hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-text-secondary" />
            <p className="text-sm font-medium text-text-primary">Drop your PDF or DOCX here</p>
            <p className="mt-1 text-xs text-text-secondary">or click to browse</p>
          </>
        )}
      </div>

      <button onClick={() => setConfirmOpen(true)} disabled={!file || generating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
        {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : "✦ Generate Q&A — 3 Energy"}
      </button>

      {output && (
        <div className="mt-6 rounded-xl border border-border bg-bg-main p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Exam Questions &amp; Answers</h3>
            {done && (
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-section">
                <Download className="h-3.5 w-3.5" /> Download DOCX
              </button>
            )}
          </div>
          <div className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed">
            {output}
            {generating && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-brand-primary" />}
          </div>
        </div>
      )}

      <AiEnergyModal open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={handleGenerate} loading={generating} />
      <NoEnergyModal open={noEnergy} onClose={() => setNoEnergy(false)} />
    </div>
  );
}
