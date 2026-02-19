import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
        <Mail className="h-7 w-7 text-brand-primary" />
      </div>

      <h1 className="mb-2 text-2xl font-bold text-text-primary">
        Check your email
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        We sent a confirmation link to your email address. Click it to activate
        your account — it expires in 24 hours.
      </p>

      <p className="text-xs text-text-secondary">
        Already confirmed?{" "}
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
