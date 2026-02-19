"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EnergyStatus } from "@/lib/energy";
import { getTimeUntilMidnightUTC } from "@/lib/time-utils";

interface EnergyWidgetProps {
  initial: EnergyStatus;
  variant?: "sidebar" | "dashboard";
}

export function EnergyWidget({ initial, variant = "sidebar" }: EnergyWidgetProps) {
  const [resetIn, setResetIn] = useState(initial.resetIn);

  useEffect(() => {
    if (initial.isPro) return;
    const id = setInterval(() => setResetIn(getTimeUntilMidnightUTC()), 60_000);
    return () => clearInterval(id);
  }, [initial.isPro]);

  // ── Dashboard variant ──────────────────────────────────────────────────────
  if (variant === "dashboard") {
    if (initial.isPro) {
      return (
        <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-brand-primary" />
            <p className="text-xs text-text-secondary">Daily Energy</p>
          </div>
          <p className="text-3xl font-bold text-brand-primary">∞</p>
          <p className="mt-1 text-xs text-brand-primary/70 font-medium">Unlimited · Pro plan</p>
        </div>
      );
    }

    const pct =
      initial.totalCap > 0
        ? Math.max(0, Math.min(100, (initial.remainingEnergy / initial.totalCap) * 100))
        : 0;
    const barColor =
      pct > 50 ? "bg-brand-primary" : pct > 20 ? "bg-amber-400" : "bg-red-500";

    return (
      <div className="rounded-xl border border-border bg-bg-main p-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-text-secondary">Daily Energy</p>
        </div>
        <p className="mt-1 text-3xl font-bold text-text-primary">
          {initial.remainingEnergy}
          <span className="text-base font-normal text-text-secondary"> / {initial.totalCap}</span>
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-bg-section">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-500", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-text-secondary">
            Resets in {resetIn.hours}h {resetIn.minutes}m
          </span>
          <Link
            href="/dashboard/upgrade"
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Get unlimited →
          </Link>
        </div>
      </div>
    );
  }

  // ── Sidebar variant (original) ─────────────────────────────────────────────
  if (initial.isPro) {
    return (
      <div className="mx-3 mb-3 rounded-lg bg-brand-primary/15 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-xs font-semibold text-brand-primary">Unlimited energy</span>
        </div>
      </div>
    );
  }

  const pct =
    initial.totalCap > 0
      ? Math.max(0, Math.min(100, (initial.remainingEnergy / initial.totalCap) * 100))
      : 0;
  const barColor =
    pct > 50 ? "bg-brand-primary" : pct > 20 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-white/80">
            {initial.remainingEnergy}
            <span className="font-normal text-white/40"> / {initial.totalCap}</span>
          </span>
        </div>
        <span className="text-[10px] text-white/35">
          resets {resetIn.hours}h {resetIn.minutes}m
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/10">
        <div
          className={cn("h-1 rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
