import type { Metadata } from "next";
import { getUserPlan } from "@/lib/subscription";
import { cancelSubscription } from "@/app/actions/billing";
import { getCurrencyConfig } from "@/lib/geo";
import UpgradeToggle from "@/components/billing/upgrade-toggle";

export const metadata: Metadata = { title: "Upgrade to Pro" };

const FREE_FEATURES = [
  "Document editor",
  "CV builder (2 templates)",
  "All PDF tools",
  "10 energy credits / day",
  "5 MB max upload",
  "100 MB storage",
  "CV exports include watermark",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited energy",
  "10 CV templates, no watermark",
  "50 MB max upload",
  "1 GB storage",
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
  const [plan, currency, params] = await Promise.all([getUserPlan(), getCurrencyConfig(), searchParams]);
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
            : "Unlock unlimited usage and all premium features."}
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

      {/* Plan cards — interval toggle handled client-side */}
      <UpgradeToggle isPro={isPro} freeFeatures={FREE_FEATURES} proFeatures={PRO_FEATURES} currency={currency} />

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
