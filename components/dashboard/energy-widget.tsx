"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnergyStatus } from "@/lib/energy";
import { getTimeUntilMidnightUTC } from "@/lib/time-utils";

interface EnergyWidgetProps {
  initial: EnergyStatus;
}

export function EnergyWidget({ initial }: EnergyWidgetProps) {
  const [resetIn, setResetIn] = useState(initial.resetIn);

  // Tick countdown every minute
  useEffect(() => {
    if (initial.isPro) return;
    const id = setInterval(() => {
      setResetIn(getTimeUntilMidnightUTC());
    }, 60_000);
    return () => clearInterval(id);
  }, [initial.isPro]);

  if (initial.isPro) {
    return (
      <div className="mx-3 mb-3 rounded-lg bg-brand-primary/15 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-brand-primary" />
          <span className="text-xs font-semibold text-brand-primary">
            Unlimited energy
          </span>
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
      {/* Bar */}
      <div className="h-1 w-full rounded-full bg-white/10">
        <div
          className={cn("h-1 rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
