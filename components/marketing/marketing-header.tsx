"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing",  href: "#pricing"  },
  { label: "Sign in",  href: "/login"    },
];

const RED = "#E10600";

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold" style={{ color: "#111111" }}>
          doc<span style={{ color: RED }}>focal</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors hover:text-[#111111]"
              style={{ color: "#6B7280" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <a
            href="/dashboard"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-85 sm:block"
            style={{ backgroundColor: RED }}
          >
            Get Started
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="border-t px-6 py-4 md:hidden"
          style={{ borderColor: "rgba(0,0,0,0.07)", backgroundColor: "rgba(255,255,255,0.97)" }}
        >
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-50 hover:text-[#111111]"
              >
                {label}
              </a>
            ))}
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-white"
              style={{ backgroundColor: RED }}
            >
              Get Started
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
