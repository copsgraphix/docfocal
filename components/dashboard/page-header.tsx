"use client";

import { usePathname } from "next/navigation";

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
  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-bg-main px-6">
      <h1 className="text-lg font-semibold text-text-primary">{getTitle(pathname)}</h1>
    </header>
  );
}
