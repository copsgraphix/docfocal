import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;

  return (
    <>
      <h1 className="mb-2 text-center text-2xl font-bold text-text-primary">
        Reset your password
      </h1>
      <p className="mb-6 text-center text-sm text-text-secondary">
        Enter your email and we&apos;ll send a reset link.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {success ? (
        <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-700">
          <p className="font-semibold">Check your inbox</p>
          <p className="mt-1">
            We&apos;ve sent a password reset link to your email address. It
            expires in 1 hour.
          </p>
        </div>
      ) : (
        <form action={forgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-bg-section px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Send reset link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link
          href="/login"
          className="font-medium text-brand-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
