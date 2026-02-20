import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How docfocal collects, uses, and protects your personal data.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-[#111111]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[#6B7280]">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const updated = "20 February 2026";

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      {/* Back */}
      <Link href="/" className="mb-10 inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#111111]">
        ← Back to home
      </Link>

      <h1 className="mb-2 text-3xl font-black tracking-tight text-[#111111]">Privacy Policy</h1>
      <p className="mb-10 text-sm text-[#9CA3AF]">Last updated: {updated}</p>

      <Section title="1. Who we are">
        <p>
          docfocal (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an online document workspace accessible at{" "}
          <strong>docfocal.com</strong>. We are operated as an independent service.
          Questions about this policy: <a href="mailto:support@docfocal.com" className="text-[#E10600] underline">support@docfocal.com</a>.
        </p>
      </Section>

      <Section title="2. What data we collect">
        <p>When you create an account we collect:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Email address and display name</li>
          <li>OAuth profile data if you sign in with Google (name, email, profile picture)</li>
          <li>Payment details — processed by Paystack; we never store card numbers</li>
        </ul>
        <p>When you use the service we collect:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Files you upload (PDFs, images, documents) — stored temporarily for processing</li>
          <li>Documents and CVs you save to your account</li>
          <li>Usage data (energy consumption, tool usage) for billing and abuse prevention</li>
          <li>Standard server logs (IP address, browser, timestamps)</li>
        </ul>
      </Section>

      <Section title="3. How we use your data">
        <ul className="ml-4 list-disc space-y-1">
          <li>To operate and improve the service</li>
          <li>To manage your subscription and process payments</li>
          <li>To send transactional emails (account confirmation, password reset)</li>
          <li>To detect and prevent fraud or abuse</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p>We do <strong>not</strong> sell your personal data to third parties.</p>
      </Section>

      <Section title="4. File storage and retention">
        <p>
          Files you upload for processing (PDF tools, conversion) are stored temporarily and
          automatically deleted after 24 hours. Documents and CVs saved to your account remain
          until you delete them or close your account.
        </p>
        <p>
          Free plan accounts that are inactive for 90 days may have their stored documents removed
          after prior notice.
        </p>
      </Section>

      <Section title="5. Cookies and analytics">
        <p>
          We use functional cookies (Supabase session) to keep you signed in. We may use
          analytics services to understand aggregate usage patterns. No behavioural advertising
          cookies are set without your consent.
        </p>
        <p>
          Google AdSense may place cookies on our marketing pages to serve relevant ads. You can
          opt out via <a href="https://adssettings.google.com" className="text-[#E10600] underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
        </p>
      </Section>

      <Section title="6. Third-party services">
        <ul className="ml-4 list-disc space-y-1">
          <li><strong>Supabase</strong> — authentication and database (EU/US infrastructure)</li>
          <li><strong>Paystack</strong> — payment processing</li>
          <li><strong>Google OAuth</strong> — optional sign-in</li>
          <li><strong>Google AdSense</strong> — ads on the marketing site</li>
        </ul>
      </Section>

      <Section title="7. Your rights">
        <p>You have the right to:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Access a copy of the personal data we hold about you</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your account and data</li>
          <li>Object to certain processing</li>
        </ul>
        <p>
          To exercise any of these rights, email us at{" "}
          <a href="mailto:support@docfocal.com" className="text-[#E10600] underline">support@docfocal.com</a>.
        </p>
      </Section>

      <Section title="8. Data security">
        <p>
          All data is transmitted over HTTPS. Passwords are hashed and never stored in plain
          text. We use industry-standard security practices and rely on Supabase's infrastructure
          for storage security.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          docfocal is not directed at children under 13. We do not knowingly collect data from
          anyone under 13. If you believe a child has provided us with personal data, please
          contact us immediately.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this policy from time to time. We will notify you of material changes via
          email or a notice on the dashboard. Continued use after changes constitutes acceptance.
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
