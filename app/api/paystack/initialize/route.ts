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

  try {
    // Ensure a subscription row exists for this user
    await supabase.from("subscriptions").upsert(
      { user_id: userId, plan: "free", status: "active" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const data = await paystack.post<InitializeData>("/transaction/initialize", {
      email,
      plan: process.env.PAYSTACK_PRO_PLAN_CODE,
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
