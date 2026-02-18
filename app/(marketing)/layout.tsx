import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-main font-sans">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-main">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-text-primary">
            doc<span className="text-brand-primary">focal</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Pricing
            </a>
          </nav>

          <a
            href="/dashboard"
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            Get Started
          </a>
        </div>
      </header>

      {children}
    </div>
  );
}
