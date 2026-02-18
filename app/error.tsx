"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-main p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl">
            ⚠️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Something went wrong</h1>
            <p className="mt-2 text-text-secondary">
              An unexpected error occurred. Please try again.
            </p>
          </div>
          <div className="flex gap-3">
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
              Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
