const BASE = "https://api.paystack.co";

async function paystackFetch<T>(
  method: "GET" | "POST",
  endpoint: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack request failed");
  return json.data as T;
}

export const paystack = {
  post: <T>(endpoint: string, body: Record<string, unknown>) =>
    paystackFetch<T>("POST", endpoint, body),
  get: <T>(endpoint: string) => paystackFetch<T>("GET", endpoint),
};

// ── Response shapes ───────────────────────────────────────────

export interface InitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyData {
  status: string; // "success" | "failed" | "abandoned"
  reference: string;
  customer: {
    email: string;
    customer_code: string;
  };
  metadata: Record<string, string>;
  subscription?: {
    status: string;
    subscription_code: string;
    next_payment_date: string;
  };
}
