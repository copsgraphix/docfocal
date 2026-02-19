import type { Metadata } from "next";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Set new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
        Set new password
      </h1>
      <p className="mb-6 text-center text-sm text-text-secondary">
        Choose a new password for your account.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
          <p className="mt-1">
            Your reset link may have expired.{" "}
            <Link href="/forgot-password" className="font-medium underline">
              Request a new one.
            </Link>
          </p>
        </div>
      )}

      <form action={resetPassword} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-text-secondary"
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
            className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            placeholder="Minimum 6 characters"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Update password
        </button>
      </form>
    </>
  );
}
