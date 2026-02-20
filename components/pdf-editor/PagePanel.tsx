"use client";

import { FileText, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageState {
  backgroundDataUrl: string;
  width: number;
  height: number;
  fabricJson: string;
  cropRect?: { x: number; y: number; width: number; height: number };
}

interface PagePanelProps {
  pages: PageState[];
  currentPage: number;
  onPageSelect: (index: number) => void;
  onInsertBlank: () => void;
  onInsertFromPdf: () => void;
}

export function PagePanel({
  pages,
  currentPage,
  onPageSelect,
  onInsertBlank,
  onInsertFromPdf,
}: PagePanelProps) {
  return (
    <div className="flex w-36 shrink-0 flex-col border-l border-border bg-bg-main">
      <div className="shrink-0 border-b border-border px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">
          Pages ({pages.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pages.map((page, i) => (
          <button
            key={i}
            onClick={() => onPageSelect(i)}
            className={cn(
              "group relative w-full overflow-hidden rounded-lg border-2 transition-colors",
              currentPage === i
                ? "border-brand-primary"
                : "border-border hover:border-brand-primary/50"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.backgroundDataUrl}
              alt={`Page ${i + 1}`}
              className="w-full object-contain"
              style={{ aspectRatio: `${page.width} / ${page.height}` }}
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="shrink-0 border-t border-border p-2 space-y-1.5">
        <button
          onClick={onInsertBlank}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          <PlusSquare className="h-3.5 w-3.5 shrink-0" />
          Blank Page
        </button>
        <button
          onClick={onInsertFromPdf}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-2 py-1.5 text-xs text-text-secondary transition-colors hover:border-brand-primary hover:text-brand-primary"
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          From PDF
        </button>
      </div>
    </div>
  );
}
