import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Paystack plan codes for monthly vs yearly (set in env)
const MONTHLY_PLAN_CODE = process.env.PAYSTACK_MONTHLY_PLAN_CODE ?? "";
const YEARLY_PLAN_CODE  = process.env.PAYSTACK_YEARLY_PLAN_CODE  ?? "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // Verify webhook authenticity
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as { event: string; data: Record<string, unknown> };
  const supabase = createAdminClient();

  switch (event.event) {
    case "subscription.create": {
      const sub = event.data as {
        subscription_code: string;
        next_payment_date: string;
        plan: { plan_code: string };
        customer: { customer_code: string };
        metadata?: { referred_by?: string };
      };

      // 1. Activate subscription
      const { data: updatedSub } = await supabase
        .from("subscriptions")
        .update({
          paystack_subscription_code: sub.subscription_code,
          plan: "pro",
          status: "active",
          next_payment_date: new Date(sub.next_payment_date).toISOString(),
        })
        .eq("paystack_customer_code", sub.customer.customer_code)
        .select("user_id")
        .single();

      // 2. Sync profile plan_type
      if (updatedSub?.user_id) {
        await supabase
          .from("profiles")
          .update({ plan_type: "pro", updated_at: new Date().toISOString() })
          .eq("id", updatedSub.user_id);

        // 3. Referral rewards
        const { data: buyerProfile } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", updatedSub.user_id)
          .single();

        const referrerId = buyerProfile?.referred_by;
        if (referrerId) {
          const isYearly = sub.plan?.plan_code === YEARLY_PLAN_CODE;
          if (isYearly) {
            // Yearly: referrer gets 1 week Pro
            const proUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await supabase
              .from("profiles")
              .update({
                plan_type: "pro",
                pro_expires_at: proUntil.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", referrerId);
          } else {
            // Monthly: referrer gets permanent +2 daily energy_cap
            await supabase.rpc("increment_referrer_energy_cap", {
              p_referrer_id: referrerId,
              p_amount: 2,
            });
          }
        }
      }
      break;
    }

    case "subscription.disable":
    case "subscription.not_renew": {
      const sub = event.data as { subscription_code: string };
      const { data: cancelledSub } = await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled" })
        .eq("paystack_subscription_code", sub.subscription_code)
        .select("user_id")
        .single();

      if (cancelledSub?.user_id) {
        await supabase
          .from("profiles")
          .update({
            plan_type: "free",
            pro_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cancelledSub.user_id);
      }
      break;
    }

    case "charge.success": {
      const charge = event.data as {
        plan?: unknown;
        customer: { customer_code: string };
      };
      // Subscription renewal — keep plan active
      if (charge.plan) {
        await supabase
          .from("subscriptions")
          .update({ plan: "pro", status: "active" })
          .eq("paystack_customer_code", charge.customer.customer_code);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
