import { NextResponse } from "next/server";
import { checkAndConsumeEnergy } from "@/lib/energy";

// Called by client-side tools (PDF→JPEG, Compress PDF, Compress Image)
// that run entirely in the browser and never hit a PDF API route.
export async function POST() {
  const energyErr = await checkAndConsumeEnergy();
  if (energyErr) return energyErr;
  return NextResponse.json({ ok: true });
}
