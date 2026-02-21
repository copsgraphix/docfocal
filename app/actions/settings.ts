"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    redirect("/dashboard/settings?error=update_failed");
  }
  redirect("/dashboard/settings?success=profile");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (password.length < 6) {
    redirect("/dashboard/settings?error=password_short");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/dashboard/settings?error=password_failed");
  }
  redirect("/dashboard/settings?success=password");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) redirect("/login");

  const admin = createAdminClient();

  // Delete user's data first (RLS won't block admin client)
  await Promise.allSettled([
    admin.from("documents").delete().eq("user_id", userId),
    admin.from("cvs").delete().eq("user_id", userId),
    admin.from("subscriptions").delete().eq("user_id", userId),
  ]);

  // Delete the auth user (this also removes the profile via DB cascade)
  await admin.auth.admin.deleteUser(userId);

  // Sign out and send to home
  await supabase.auth.signOut();
  redirect("/");
}
