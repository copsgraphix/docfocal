"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend, FROM, welcomeEmailHtml } from "@/lib/resend";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const refCode = (formData.get("ref") as string | null)?.toUpperCase() ?? "";
  const name = ((formData.get("name") as string) ?? "").trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect("/signup?error=passwords_mismatch");
  }

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: { full_name: name || undefined },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Send welcome email (non-fatal)
  if (data.user) {
    const displayName = name || data.user.email?.split("@")[0] || "there";
    getResend().emails.send({
      from: FROM,
      to: data.user.email!,
      subject: "Welcome to docfocal!",
      html: welcomeEmailHtml(displayName),
    }).catch(() => {}); // fire-and-forget
  }

  // Link referral: resolve referral code → referrer profile id
  if (refCode && data.user) {
    try {
      const admin = createAdminClient();
      const { data: referrer } = await admin
        .from("profiles")
        .select("id")
        .eq("referral_code", refCode)
        .single();

      if (referrer?.id && referrer.id !== data.user.id) {
        await admin
          .from("profiles")
          .update({ referred_by: referrer.id })
          .eq("id", data.user.id);
      }
    } catch {
      // Non-fatal — sign-up still proceeds
    }
  }

  // session is null when Supabase requires email confirmation
  if (!data.session) {
    redirect("/check-email");
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function getSiteUrl() {
  const headersList = await headers();
  const forwardedHost = headersList.get("x-forwarded-host");
  if (forwardedHost) return `https://${forwardedHost}`;
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?success=1");
}

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
