"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Download, Presentation } from "lucide-react";
import { AiEnergyModal } from "@/components/dashboard/ai-energy-modal";
import { NoEnergyModal } from "@/components/no-energy-modal";

export default function SlidedeckPage() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noEnergy, setNoEnergy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setError("");
    setDownloadUrl("");
    setConfirmOpen(false);

    try {
      const res = await fetch("/api/ai/slidedeck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, context }),
      });

      if (res.status === 402) { setNoEnergy(true); return; }
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Generation failed.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const safe = topic.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
      setDownloadUrl(url);
      setFileName(`${safe}-slides.pptx`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h2 className="text-2xl font-bold text-text-primary">SlideDeck Creator</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter a topic and AI will generate a complete 8-slide PPTX presentation.{" "}
          <span className="font-medium text-brand-primary">Costs 3 Energy.</span>
        </p>
      </div>

      <div className="rounded-xl border border-border bg-bg-main p-5">
        <div className="mb-4">
          <label htmlFor="topic" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Presentation Topic <span className="text-brand-primary">*</span>
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. The Impact of Renewable Energy in Nigeria"
            maxLength={500}
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="context" className="mb-1.5 block text-xs font-medium text-text-secondary">
            Additional Context <span className="text-text-secondary/60">(optional)</span>
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            placeholder="Audience, key points to include, tone, course name…"
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {downloadUrl ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-5 text-center">
            <Presentation className="h-10 w-10 text-brand-primary" />
            <p className="text-sm font-semibold text-text-primary">Your presentation is ready!</p>
            <a
              href={downloadUrl}
              download={fileName}
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Download PPTX
            </a>
            <button onClick={() => { setDownloadUrl(""); setTopic(""); setContext(""); }}
              className="text-xs text-text-secondary hover:text-text-primary">
              Generate another
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={!topic.trim() || generating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Building slides…</>
            ) : (
              "✦ Generate PPTX — 3 Energy"
            )}
          </button>
        )}
      </div>

      <AiEnergyModal open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={handleGenerate} loading={generating} />
      <NoEnergyModal open={noEnergy} onClose={() => setNoEnergy(false)} />
    </div>
  );
}
