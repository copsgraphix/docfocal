import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  // On Railway (and Vercel), the app sits behind a load balancer.
  // request.url reflects the internal http:// URL, not the public https:// one.
  // x-forwarded-host contains the real public hostname.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const siteUrl = forwardedHost ? `https://${forwardedHost}` : origin;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(
      `${siteUrl}/login?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`
    );
  }

  return NextResponse.redirect(data.url);
}
