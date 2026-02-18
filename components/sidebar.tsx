"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FileStack,
  Contact,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/editor", label: "Document Editor", icon: FileText },
  { href: "/dashboard/pdf", label: "PDF Toolkit", icon: FileStack },
  { href: "/dashboard/cv", label: "CV Creator", icon: Contact },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/upgrade", label: "Upgrade to Pro", icon: Zap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar-bg">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <span className="text-xl font-bold text-white">
          doc<span className="text-brand-primary">focal</span>
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-brand-primary text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        <div className="my-2 border-t border-white/10" />

        {bottomNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-brand-primary text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User placeholder */}
      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
          JD
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">John Doe</p>
          <p className="truncate text-xs text-white/50">john@example.com</p>
        </div>
      </div>
    </aside>
  );
}
