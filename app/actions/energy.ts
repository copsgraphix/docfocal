"use server";

import { createClient } from "@/lib/supabase/server";
import type { ConsumeResult, EnergyStatus } from "@/lib/energy";
import { getUserEnergyStatus } from "@/lib/energy";

// ─── Consume 1 energy unit ────────────────────────────────────────────────────
export async function consumeEnergy(): Promise<ConsumeResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;

  if (!userId) {
    return { ok: false, reason: "profile_not_found", remaining: 0 };
  }

  const { data, error } = await supabase.rpc("consume_energy", {
    p_user_id: userId,
  });

  if (error || !data) {
    return { ok: false, reason: "profile_not_found", remaining: 0 };
  }

  return data as ConsumeResult;
}

// ─── Get energy status (re-exported as server action) ─────────────────────────
export async function getEnergyStatus(): Promise<EnergyStatus | null> {
  return getUserEnergyStatus();
}
