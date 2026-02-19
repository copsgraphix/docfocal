"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface ReferralCardProps {
  referralCode: string;
}

export function ReferralCard({ referralCode }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${referralCode}`
      : `/signup?ref=${referralCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs text-text-secondary">Your referral code</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg border border-border bg-bg-section px-3 py-2 font-mono text-sm font-semibold text-text-primary tracking-widest">
            {referralCode}
          </code>
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs text-text-secondary">Shareable link</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={referralUrl}
            className="min-w-0 flex-1 rounded-lg border border-border bg-bg-section px-3 py-2 text-xs text-text-secondary focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        <strong className="text-text-primary">Monthly referral:</strong> you earn +2 permanent daily energy when someone subscribes monthly.
        <br />
        <strong className="text-text-primary">Yearly referral:</strong> you earn 7 days of Pro when someone subscribes yearly.
      </p>
    </div>
  );
}
