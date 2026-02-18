import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };
import { getUserPlan } from "@/lib/subscription";
import { updateProfile, changePassword } from "@/app/actions/settings";
import Link from "next/link";
import { Zap } from "lucide-react";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const [supabase, plan, params] = await Promise.all([
    createClient(),
    getUserPlan(),
    searchParams,
  ]);

  const { data: authData } = await supabase.auth.getClaims();
  const claims = authData?.claims;
  const email = (claims?.email as string) ?? "";
  const displayName =
    (claims?.user_metadata?.full_name as string) ?? email.split("@")[0] ?? "";

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
        <p className="mt-1 text-text-secondary">Manage your account</p>
      </div>

      {/* Banners */}
      {params.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(params.error)}
        </div>
      )}
      {params.success === "profile" && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile updated. Changes appear in the sidebar after your next sign-in.
        </div>
      )}
      {params.success === "password" && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Password updated successfully.
        </div>
      )}

      {/* Plan */}
      <section className="rounded-xl border border-border bg-bg-main p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Plan</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Current plan:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                plan === "pro"
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "bg-bg-section text-text-secondary"
              }`}
            >
              {plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>
          {plan === "free" && (
            <Link
              href="/dashboard/upgrade"
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
            >
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          )}
        </div>
      </section>

      {/* Profile */}
      <section className="rounded-xl border border-border bg-bg-main p-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Profile</h3>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-secondary opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              Display name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={displayName}
              required
              className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save profile
          </button>
        </form>
      </section>

      {/* Security */}
      <section className="rounded-xl border border-border bg-bg-main p-6">
        <h3 className="mb-1 text-sm font-semibold text-text-primary">Password</h3>
        <p className="mb-4 text-xs text-text-secondary">
          For Google sign-in accounts, setting a password also enables email + password login.
        </p>
        <form action={changePassword} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-text-secondary"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="Minimum 6 characters"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}
