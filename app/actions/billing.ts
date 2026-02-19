"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function cancelSubscription() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("paystack_subscription_code")
    .eq("user_id", userId)
    .single();

  if (!sub?.paystack_subscription_code) {
    redirect("/dashboard/upgrade?error=no_subscription");
  }

  let success = false;

  try {
    // Fetch full subscription from Paystack to get the email_token required for disabling
    const fetchRes = await fetch(
      `https://api.paystack.co/subscription/${sub.paystack_subscription_code}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const fetchJson = await fetchRes.json();
    const emailToken: string | undefined = fetchJson.data?.email_token;

    if (emailToken) {
      const disableRes = await fetch(
        "https://api.paystack.co/subscription/disable",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: sub.paystack_subscription_code,
            token: emailToken,
          }),
        }
      );
      const disableJson = await disableRes.json();

      if (disableJson.status) {
        // Update DB immediately — the webhook will also fire and confirm this
        const admin = createAdminClient();
        await admin
          .from("subscriptions")
          .update({ plan: "free", status: "cancelled" })
          .eq("user_id", userId);
        success = true;
      }
    }
  } catch {
    // fall through to error redirect
  }

  redirect(
    success
      ? "/dashboard/upgrade?cancelled=1"
      : "/dashboard/upgrade?error=cancel_failed"
  );
}
