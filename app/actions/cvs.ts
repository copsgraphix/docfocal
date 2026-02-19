"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/subscription";
import { consumeEnergyServer } from "@/lib/energy";
import type { CVData } from "@/components/cv/cv-editor";

const FREE_CV_LIMIT = 5;

export async function createCV() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) redirect("/login");

  // Deduct energy before creating
  const energy = await consumeEnergyServer();
  if (!energy.ok && energy.reason === "no_energy") {
    redirect("/dashboard/cv?error=no_energy");
  }

  // Enforce free-tier CV limit
  const plan = await getUserPlan();
  if (plan === "free") {
    const { count } = await supabase
      .from("cvs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= FREE_CV_LIMIT) {
      redirect("/dashboard/cv?error=limit");
    }
  }

  const { data, error } = await supabase
    .from("cvs")
    .insert({ user_id: userId, title: "Untitled CV" })
    .select("id")
    .single();

  if (error || !data) redirect("/dashboard/cv");
  redirect(`/dashboard/cv/${data.id}`);
}

export async function updateCV(id: string, title: string, cvData: CVData) {
  const supabase = await createClient();
  await supabase
    .from("cvs")
    .update({ title, data: cvData as unknown as Record<string, unknown> })
    .eq("id", id);
}

export async function deleteCV(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("cvs").delete().eq("id", id);
  redirect("/dashboard/cv");
}
