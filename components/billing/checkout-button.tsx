"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  interval: "monthly" | "yearly";
  isNGN: boolean;
}

export default function CheckoutButton({ interval, isNGN }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    const endpoint = isNGN ? "/api/paystack/initialize" : "/api/stripe/checkout";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {loading ? "Redirecting to Paystack…" : "Upgrade to Pro"}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
