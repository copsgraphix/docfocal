import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets the forgot-password flow redirect to /reset-password after exchange
  const next = searchParams.get("next") ?? "/dashboard";

  // On Railway the real public hostname is in x-forwarded-host.
  // Using it ensures cookies with Secure flag work and Supabase accepts the redirect.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const siteUrl = forwardedHost ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`);
    }

    // Code exchange failed — send to login with a visible error
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent("Sign-in failed. Please try again.")}`
    );
  }

  // No code in the URL — something went wrong upstream
  return NextResponse.redirect(
    `${siteUrl}/login?error=${encodeURIComponent("OAuth callback missing code.")}`
  );
}
