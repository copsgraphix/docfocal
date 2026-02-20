import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paystack, type VerifyData } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${origin}/dashboard/upgrade?error=no_reference`);
  }

  try {
    const data = await paystack.get<VerifyData>(`/transaction/verify/${reference}`);

    if (data.status !== "success") {
      return NextResponse.redirect(`${origin}/dashboard/upgrade?error=payment_failed`);
    }

    const userId = data.metadata?.userId;
    if (!userId) {
      return NextResponse.redirect(`${origin}/dashboard/upgrade?error=missing_user`);
    }

    const supabase = createAdminClient();

    // 1. Record subscription (source of billing truth)
    await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          paystack_customer_code: data.customer.customer_code,
          paystack_subscription_code: data.subscription?.subscription_code ?? null,
          plan: "pro",
          status: "active",
          next_payment_date: data.subscription?.next_payment_date
            ? new Date(data.subscription.next_payment_date).toISOString()
            : null,
        },
        { onConflict: "user_id" }
      );

    // 2. Immediately sync profile so energy system reflects Pro — the webhook
    //    will also fire and confirm, but this closes the race window.
    await supabase
      .from("profiles")
      .update({ plan_type: "pro", updated_at: new Date().toISOString() })
      .eq("id", userId);

    return NextResponse.redirect(`${origin}/dashboard/upgrade?success=1`);
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.redirect(`${origin}/dashboard/upgrade?error=verification_failed`);
  }
}
