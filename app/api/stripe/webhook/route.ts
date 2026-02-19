import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      // cancel_at is set when cancellation is scheduled; null otherwise
      const nextDate = sub.cancel_at
        ? new Date(sub.cancel_at * 1000).toISOString()
        : null;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          plan: isActive ? "pro" : "free",
          status: isActive ? "active" : "cancelled",
          next_payment_date: nextDate,
        },
        { onConflict: "user_id" }
      );

      await supabase
        .from("profiles")
        .update({
          plan_type: isActive ? "pro" : "free",
          pro_expires_at: isActive ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled" })
        .eq("user_id", userId);

      await supabase
        .from("profiles")
        .update({
          plan_type: "free",
          pro_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
