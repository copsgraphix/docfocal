import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#FFFFFF", color: "#111111" }}>
      {/* Sticky light header */}
      <header
        className="sticky top-0 z-50"
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold" style={{ color: "#111111" }}>
            doc<span style={{ color: "#E10600" }}>focal</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium transition-colors hover:text-[#111111]"
              style={{ color: "#6B7280" }}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium transition-colors hover:text-[#111111]"
              style={{ color: "#6B7280" }}
            >
              Pricing
            </a>
          </nav>

          <a
            href="/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85"
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
