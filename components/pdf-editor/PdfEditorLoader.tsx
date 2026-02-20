"use client";

import dynamic from "next/dynamic";

const PdfEditor = dynamic(() => import("./PdfEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-text-secondary text-sm">
      Loading editor…
    </div>
  ),
});

export function PdfEditorLoader() {
  return <PdfEditor />;
}
