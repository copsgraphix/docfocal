import { headers } from "next/headers";

export type CurrencyConfig = {
  symbol: string;
  monthly: string;        // e.g. "₦900" or "$2"
  yearly: string;         // e.g. "₦9,000" or "$20"
  yearlyPerMonth: string; // e.g. "₦750/mo" or "$1.67/mo"
  yearlySavings: string;  // e.g. "₦1,800" or "$4"
  isNGN: boolean;
};

export async function getCurrencyConfig(): Promise<CurrencyConfig> {
  const headersList = await headers();
  // Vercel sets this automatically; Cloudflare uses cf-ipcountry
  const country =
    headersList.get("x-vercel-ip-country") ??
    headersList.get("cf-ipcountry") ??
    "NG"; // default to NGN in local dev

  if (country === "NG") {
    return {
      symbol: "₦",
      monthly: "₦900",
      yearly: "₦9,000",
      yearlyPerMonth: "₦750/mo",
      yearlySavings: "₦1,800",
      isNGN: true,
    };
  }

  return {
    symbol: "$",
    monthly: "$2",
    yearly: "$20",
    yearlyPerMonth: "$1.67/mo",
    yearlySavings: "$4",
    isNGN: false,
  };
}
