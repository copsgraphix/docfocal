"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
        ⚠️
      </div>
      <h2 className="text-xl font-bold text-text-primary">Something went wrong</h2>
      <p className="mt-2 text-sm text-text-secondary">
        {error.message || "An unexpected error occurred on this page."}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-section"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
