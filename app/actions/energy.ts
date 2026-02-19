"use server";

import type { ConsumeResult, EnergyStatus } from "@/lib/energy";
import { consumeEnergyServer, getUserEnergyStatus } from "@/lib/energy";

// ─── Consume 1 energy unit ────────────────────────────────────────────────────
export async function consumeEnergy(): Promise<ConsumeResult> {
  return consumeEnergyServer();
}

// ─── Get energy status (re-exported as server action) ─────────────────────────
export async function getEnergyStatus(): Promise<EnergyStatus | null> {
  return getUserEnergyStatus();
}
