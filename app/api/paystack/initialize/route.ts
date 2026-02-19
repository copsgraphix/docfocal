import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paystack, type InitializeData } from "@/lib/paystack";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  const email = authData?.claims?.email as string | undefined;

  if (!userId || !email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { origin } = new URL(request.url);
  const body = await request.json().catch(() => ({}));
  const interval: "monthly" | "yearly" = body.interval === "yearly" ? "yearly" : "monthly";

  // Use IP country to pick NGN vs USD Paystack plan codes
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    "NG";
  const isNGN = country === "NG";

  const planCode = isNGN
    ? interval === "yearly"
      ? process.env.PAYSTACK_YEARLY_PLAN_CODE
      : process.env.PAYSTACK_MONTHLY_PLAN_CODE ?? process.env.PAYSTACK_PRO_PLAN_CODE
    : interval === "yearly"
      ? process.env.PAYSTACK_YEARLY_USD_PLAN_CODE
      : process.env.PAYSTACK_MONTHLY_USD_PLAN_CODE;

  try {
    // Ensure a subscription row exists for this user
    await supabase.from("subscriptions").upsert(
      { user_id: userId, plan: "free", status: "active" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const data = await paystack.post<InitializeData>("/transaction/initialize", {
      email,
      plan: planCode,
      callback_url: `${origin}/api/paystack/verify`,
      metadata: { userId },
    });

    return NextResponse.json({ url: data.authorization_url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
