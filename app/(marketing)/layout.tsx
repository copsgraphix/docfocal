import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF" }}
    >
      {/* Sticky dark header */}
      <header
        className="sticky top-0 z-50"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backgroundColor: "rgba(10,10,10,0.80)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-white">
            doc<span style={{ color: "#E10600" }}>focal</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              Pricing
            </a>
          </nav>

          <a
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#E10600" }}
          >
            Get Started
          </a>
        </div>
      </header>

      {children}
    </div>
  );
}
