import { NextRequest, NextResponse } from "next/server";
import { checkAndConsumeEnergy } from "@/lib/energy";
import { consumeEnergyBulkServer } from "@/lib/energy";

// Called by client-side tools that run entirely in the browser.
// Accepts optional { amount } body — defaults to 1 for standard tools, 3 for AI tools.
export async function POST(request: NextRequest) {
  let amount = 1;
  try {
    const body = await request.json();
    if (typeof body?.amount === "number" && body.amount > 0) {
      amount = body.amount;
    }
  } catch {
    // no body or non-JSON — use default amount 1
  }

  if (amount === 1) {
    const energyErr = await checkAndConsumeEnergy();
    if (energyErr) return energyErr;
    return NextResponse.json({ ok: true });
  }

  const result = await consumeEnergyBulkServer(amount);
  if (!result.ok && result.reason === "no_energy") {
    return NextResponse.json(
      { error: "You've used all your daily energy. It resets at midnight UTC." },
      { status: 402 }
    );
  }
  if (!result.ok) {
    return NextResponse.json({ error: "Could not consume energy." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, remaining: result.remaining });
}
