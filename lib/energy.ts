import { createClient } from "@/lib/supabase/server";
import { getTimeUntilMidnightUTC } from "@/lib/time-utils";

export { getTimeUntilMidnightUTC };

// ─── Types ────────────────────────────────────────────────────────────────────
export type EnergyStatus = {
  remainingEnergy: number; // -1 = unlimited (pro)
  totalCap: number;
  usedToday: number;
  plan: "free" | "pro";
  isPro: boolean;
  resetIn: { hours: number; minutes: number };
  referralCode: string;
};

export type ConsumeResult =
  | { ok: true; remaining: number; pro: boolean }
  | { ok: false; reason: "no_energy" | "profile_not_found"; remaining: number };

// ─── Read current energy status ───────────────────────────────────────────────
export async function getUserEnergyStatus(): Promise<EnergyStatus | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select(
      "energy_cap, energy_used_today, plan_type, pro_expires_at, last_energy_reset_date, referral_code"
    )
    .eq("id", userId)
    .single();

  if (!data) return null;

  const isPro =
    data.plan_type === "pro" &&
    (!data.pro_expires_at || new Date(data.pro_expires_at) > new Date());

  // Apply client-side auto-reset if date has rolled over
  const today = new Date().toISOString().split("T")[0];
  const usedToday =
    data.last_energy_reset_date < today ? 0 : data.energy_used_today;
  const remaining = isPro ? -1 : Math.max(0, data.energy_cap - usedToday);

  return {
    remainingEnergy: remaining,
    totalCap: data.energy_cap,
    usedToday,
    plan: isPro ? "pro" : "free",
    isPro,
    resetIn: getTimeUntilMidnightUTC(),
    referralCode: data.referral_code ?? "",
  };
}
