import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

export async function getUserPlan(): Promise<Plan> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .single();

  if (data?.plan === "pro" && data.status === "active") return "pro";
  return "free";
}
