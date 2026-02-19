import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

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

  const priceId =
    interval === "yearly"
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

  if (!priceId) {
    return NextResponse.json({ error: "International billing not configured yet." }, { status: 503 });
  }

  try {
    // Ensure subscription row exists
    await supabase.from("subscriptions").upsert(
      { user_id: userId, plan: "free", status: "active" },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/upgrade?success=1`,
      cancel_url: `${origin}/dashboard/upgrade?error=payment_failed`,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
