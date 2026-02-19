"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";
import CheckoutButton from "@/components/billing/checkout-button";

interface UpgradeToggleProps {
  isPro: boolean;
  freeFeatures: string[];
  proFeatures: string[];
}

export default function UpgradeToggle({
  isPro,
  freeFeatures,
  proFeatures,
}: UpgradeToggleProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      {/* Billing interval toggle */}
      {!isPro && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-bg-main p-1">
            <button
              onClick={() => setInterval("monthly")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                interval === "monthly"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                interval === "yearly"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  interval === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-green-100 text-green-700"
                }`}
              >
                Save 17%
              </span>
            </button>
          </div>
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
            {freeFeatures.map((f) => (
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

          {interval === "monthly" ? (
            <div className="mt-2">
              <p className="text-3xl font-bold text-text-primary">
                ₦900
                <span className="text-base font-normal text-text-secondary">/mo</span>
              </p>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-3xl font-bold text-text-primary">
                ₦9,000
                <span className="text-base font-normal text-text-secondary">/yr</span>
              </p>
              <p className="mt-0.5 text-xs text-green-600 font-medium">
                ₦750/mo · save ₦1,800 vs monthly
              </p>
            </div>
          )}

          <ul className="mt-6 space-y-3">
            {proFeatures.map((f) => (
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
              <CheckoutButton interval={interval} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
