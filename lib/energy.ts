import { NextResponse } from "next/server";
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

// ─── Consume energy (callable from API routes and server actions) ─────────────
export async function consumeEnergyServer(): Promise<ConsumeResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return { ok: false, reason: "profile_not_found", remaining: 0 };
  const { data, error } = await supabase.rpc("consume_energy", { p_user_id: userId });
  if (error || !data) return { ok: false, reason: "profile_not_found", remaining: 0 };
  return data as ConsumeResult;
}

// ─── Convenience wrapper for API route handlers ────────────────────────────────
// Returns a 402 NextResponse if the user is out of energy, or null if good to go.
export async function checkAndConsumeEnergy(): Promise<NextResponse | null> {
  const result = await consumeEnergyServer();
  if (!result.ok && result.reason === "no_energy") {
    return NextResponse.json(
      { error: "You've used all your daily energy. It resets at midnight UTC." },
      { status: 402 }
    );
  }
  return null;
}

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
