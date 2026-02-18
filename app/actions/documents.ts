"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/subscription";

const FREE_DOC_LIMIT = 10;

export async function createDocument() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) redirect("/login");

  // Enforce free-tier limit
  const plan = await getUserPlan();
  if (plan === "free") {
    const { count } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= FREE_DOC_LIMIT) {
      redirect("/dashboard/editor?error=limit");
    }
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id: userId, title: "Untitled Document" })
    .select("id")
    .single();

  if (error || !data) redirect("/dashboard/editor");
  redirect(`/dashboard/editor/${data.id}`);
}

export async function updateDocument(id: string, title: string, content: string) {
  const supabase = await createClient();
  await supabase
    .from("documents")
    .update({ title, content })
    .eq("id", id);
}

export async function deleteDocument(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("documents").delete().eq("id", id);
  redirect("/dashboard/editor");
}
