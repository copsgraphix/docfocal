import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using docfocal — please read before signing up.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[#111111]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#6B7280]">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  const updated = "20 February 2026";

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Back */}
      <Link href="/" className="mb-10 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111]">
        ← Back to home
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight text-[#111111]">Terms of Service</h1>
      <p className="mb-10 text-sm text-[#9CA3AF]">Last updated: {updated}</p>

      <Section title="1. Acceptance">
        <p>
          By creating an account or using docfocal (&quot;Service&quot;), you agree to be bound by
          these Terms of Service. If you do not agree, do not use the Service.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be at least 13 years old to use the Service. If you are under 18, you confirm
          that you have parental or guardian consent.
        </p>
      </Section>

      <Section title="3. Account">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account. Notify us immediately of any unauthorised
          use at{" "}
          <a href="mailto:support@docfocal.com" className="text-[#E10600] underline">support@docfocal.com</a>.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Upload or process content that is illegal, defamatory, obscene, or infringing</li>
          <li>Attempt to reverse-engineer, scrape, or abuse the Service infrastructure</li>
          <li>Circumvent rate limits, energy caps, or other usage controls</li>
          <li>Use the Service for automated bulk processing without prior written consent</li>
          <li>Resell or sublicense the Service without authorisation</li>
        </ul>
      </Section>

      <Section title="5. Your content">
        <p>
          You retain ownership of all files and documents you create or upload. You grant docfocal
          a limited, non-exclusive licence to store and process your content solely to provide the
          Service to you.
        </p>
        <p>
          You are solely responsible for ensuring you have the right to upload and process any
          files you submit (e.g., copyright, privacy of third parties in documents).
        </p>
      </Section>

      <Section title="6. Plans and billing">
        <p>
          Free plan usage is subject to daily energy limits. Pro plan subscriptions are billed
          monthly or yearly via Paystack. Prices are shown at checkout and may change with 30
          days' notice.
        </p>
        <p>
          Pro subscriptions renew automatically unless cancelled before the renewal date.
          Cancellations take effect at the end of the current billing period. No refunds are
          issued for partial periods unless required by law.
        </p>
      </Section>

      <Section title="7. Availability and changes">
        <p>
          We aim for high availability but do not guarantee uninterrupted access. We reserve the
          right to modify, suspend, or discontinue any part of the Service at any time with
          reasonable notice where possible.
        </p>
      </Section>

      <Section title="8. Intellectual property">
        <p>
          The docfocal name, logo, and all software are owned by or licensed to us. Nothing in
          these Terms grants you any rights to use our trademarks or intellectual property other
          than as necessary to use the Service.
        </p>
      </Section>

      <Section title="9. Disclaimers">
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. We do not warrant
          that the Service will be error-free, that outputs will be accurate, or that converted
          files will exactly match source formatting.
        </p>
      </Section>

      <Section title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, docfocal shall not be liable for indirect,
          incidental, special, or consequential damages arising from your use of the Service.
          Our total liability for any claim shall not exceed the amount you paid us in the 12
          months before the claim.
        </p>
      </Section>

      <Section title="11. Termination">
        <p>
          We may suspend or terminate your account for violation of these Terms. You may close
          your account at any time by contacting support. Termination does not entitle you to a
          refund unless required by law.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
          to conflict of law principles. Any disputes shall be resolved in the courts of Lagos
          State, Nigeria.
        </p>
      </Section>

      <Section title="13. Changes to these Terms">
        <p>
          We may update these Terms. We will notify you of material changes via email or an
          in-app notice. Continued use after changes constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <div className="mt-10 border-t border-gray-100 pt-8 text-sm text-[#9CA3AF]">
        Questions? Contact us at{" "}
        <a href="mailto:support@docfocal.com" className="text-[#E10600] underline">
          support@docfocal.com
        </a>
      </div>
    </main>
  );
}
