"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/dashboard/sidebar-context";

const TITLES: [string, string][] = [
  ["/dashboard/editor", "Document Editor"],
  ["/dashboard/pdf", "PDF Toolkit"],
  ["/dashboard/cv", "CV Creator"],
  ["/dashboard/settings", "Settings"],
  ["/dashboard/upgrade", "Upgrade to Pro"],
  ["/dashboard", "Dashboard"],
];

function getTitle(pathname: string) {
  for (const [prefix, title] of TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return title;
  }
  return "Dashboard";
}

export default function PageHeader() {
  const pathname = usePathname();
  const { toggle } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-bg-main px-4 lg:px-6">
      <button
        onClick={toggle}
        className="rounded-lg p-2 text-text-secondary hover:bg-bg-section hover:text-text-primary lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-semibold text-text-primary">
        {getTitle(pathname)}
      </h1>
    </header>
  );
}
