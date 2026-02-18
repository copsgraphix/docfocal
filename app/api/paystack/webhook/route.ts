import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

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
        customer: { customer_code: string };
      };
      await supabase
        .from("subscriptions")
        .update({
          paystack_subscription_code: sub.subscription_code,
          plan: "pro",
          status: "active",
          next_payment_date: new Date(sub.next_payment_date).toISOString(),
        })
        .eq("paystack_customer_code", sub.customer.customer_code);
      break;
    }

    case "subscription.disable":
    case "subscription.not_renew": {
      const sub = event.data as { subscription_code: string };
      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "cancelled" })
        .eq("paystack_subscription_code", sub.subscription_code);
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
