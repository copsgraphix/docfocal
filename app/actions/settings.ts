"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const name = (formData.get("name") as string).trim();

  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/dashboard/settings?success=profile");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (password.length < 6) {
    redirect("/dashboard/settings?error=Password+must+be+at+least+6+characters");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/dashboard/settings?success=password");
}
