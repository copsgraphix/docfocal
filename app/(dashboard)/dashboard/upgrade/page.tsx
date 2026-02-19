import type { Metadata } from "next";
import { Check, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Upgrade to Pro" };
import { getUserPlan } from "@/lib/subscription";
import CheckoutButton from "@/components/billing/checkout-button";
import { cancelSubscription } from "@/app/actions/billing";

const FREE_FEATURES = [
  "Document editor",
  "CV creator",
  "PDF merge & extract",
  "Up to 10 documents",
  "Up to 5 CVs",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited documents",
  "Unlimited CVs",
  "Priority support",
  "Early access to new features",
];

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    error?: string;
    cancelled?: string;
  }>;
}) {
  const [plan, params] = await Promise.all([getUserPlan(), searchParams]);
  const isPro = plan === "pro";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-text-primary">
          {isPro ? "You're on Pro" : "Upgrade to Pro"}
        </h2>
        <p className="mt-2 text-text-secondary">
          {isPro
            ? "Thanks for supporting docfocal."
            : "Unlock unlimited usage and priority support."}
        </p>
      </div>

      {/* Banners */}
      {params.success && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Payment successful — you&apos;re now on Pro!
        </div>
      )}
      {params.cancelled && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Your subscription has been cancelled. You&apos;ll keep Pro access until the end of your billing period.
        </div>
      )}
      {params.error === "payment_failed" && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Payment was not completed. Please try again.
        </div>
      )}
      {params.error === "cancel_failed" && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not cancel your subscription. Please try again or contact{" "}
          <a href="mailto:support@docfocal.com" className="underline">
            support@docfocal.com
          </a>
          .
        </div>
      )}
      {params.error && !["payment_failed", "cancel_failed"].includes(params.error) && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong. Please try again or contact support.
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-xl border border-border bg-bg-main p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Free
          </p>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            ₦0
            <span className="text-base font-normal text-text-secondary">/mo</span>
          </p>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check className="h-4 w-4 shrink-0 text-brand-primary" />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <div className="mt-6 rounded-lg border border-border py-2 text-center text-sm font-medium text-text-secondary">
              Current plan
            </div>
          )}
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-brand-primary bg-bg-main p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
              Pro
            </p>
            <span className="flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
              <Zap className="h-3 w-3" />
              Popular
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            ₦2,000
            <span className="text-base font-normal text-text-secondary">/mo</span>
          </p>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check className="h-4 w-4 shrink-0 text-brand-primary" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {isPro ? (
              <div className="rounded-lg bg-brand-primary/10 py-2 text-center text-sm font-semibold text-brand-primary">
                ✓ Active plan
              </div>
            ) : (
              <CheckoutButton />
            )}
          </div>
        </div>
      </div>

      {/* Cancel subscription (Pro users only) */}
      {isPro && (
        <div className="mt-8 rounded-xl border border-border bg-bg-main p-6">
          <h3 className="mb-1 text-sm font-semibold text-text-primary">
            Cancel subscription
          </h3>
          <p className="mb-4 text-xs text-text-secondary">
            You&apos;ll keep Pro access until the end of your current billing period. After that your account reverts to the Free plan.
          </p>
          <form action={cancelSubscription}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Cancel subscription
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
