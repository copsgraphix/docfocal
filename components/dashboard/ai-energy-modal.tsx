"use client";

import { Zap, Loader2, X } from "lucide-react";

interface AiEnergyModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  cost?: number;
}

export function AiEnergyModal({
  open,
  onCancel,
  onConfirm,
  loading = false,
  cost = 3,
}: AiEnergyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-main p-6 shadow-2xl">
        {!loading && (
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 rounded-lg p-1 text-text-secondary hover:bg-bg-section hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10">
          <Zap className="h-6 w-6 text-brand-primary" />
        </div>

        <h2 className="mb-1 text-base font-semibold text-text-primary">
          Use AI Feature
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          This action will use{" "}
          <span className="font-semibold text-brand-primary">{cost} Energy</span>.
          AI generations are charged at a higher rate.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-section disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              "Confirm & Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
