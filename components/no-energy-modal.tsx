"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, X, Clock } from "lucide-react";
import { getTimeUntilMidnightUTC } from "@/lib/time-utils";

interface NoEnergyModalProps {
  open: boolean;
  onClose: () => void;
}

export function NoEnergyModal({ open, onClose }: NoEnergyModalProps) {
  const [resetIn, setResetIn] = useState(getTimeUntilMidnightUTC());

  useEffect(() => {
    if (!open) return;
    setResetIn(getTimeUntilMidnightUTC());
    const id = setInterval(() => setResetIn(getTimeUntilMidnightUTC()), 60_000);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-main p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg-section"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <Zap className="h-6 w-6 text-brand-primary" />
        </div>

        <h3 className="text-lg font-bold text-text-primary">Daily energy exhausted</h3>
        <p className="mt-1.5 text-sm text-text-secondary">
          You&apos;ve used all your energy for today. Upgrade to Pro for
          unlimited actions, or wait for your free energy to reset.
        </p>

        {/* Countdown */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-bg-section px-4 py-3">
          <Clock className="h-4 w-4 shrink-0 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            Resets in{" "}
            <span className="font-semibold text-text-primary">
              {resetIn.hours}h {resetIn.minutes}m
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2.5">
          <Link
            href="/dashboard/upgrade"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Zap className="h-4 w-4" />
            Upgrade to Pro — Unlimited
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-section"
          >
            I&apos;ll wait for reset
          </button>
        </div>
      </div>
    </div>
  );
}

// Drop this into any server-component page that redirects with ?error=no_energy.
// It auto-opens the modal and cleans the query string from the URL on close.
export function NoEnergyTrigger() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    // Strip the ?error=no_energy param so it doesn't linger in the URL
    router.replace(window.location.pathname, { scroll: false });
  };

  return <NoEnergyModal open={open} onClose={handleClose} />;
}
