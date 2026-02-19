"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  GitMerge,
  Scissors,
  Package,
  RotateCw,
  Trash2,
  Crop,
  Hash,
  ImagePlus,
  PenLine,
  Droplets,
  FileOutput,
  FileInput,
  ImageIcon,
  FileImage,
  BookOpen,
  Minimize2,
  Settings,
  Zap,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions/auth";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { EnergyWidget } from "@/components/dashboard/energy-widget";
import type { EnergyStatus } from "@/lib/energy";

const NAV_GROUPS = [
  {
    label: "CREATE & WRITE",
    items: [
      { href: "/dashboard/editor", label: "New Document", icon: FilePlus },
      { href: "/dashboard/cv",     label: "CV Builder",   icon: FileText },
    ],
  },
  {
    label: "PDF TOOLKIT",
    items: [
      { href: "/dashboard/pdf/merge",        label: "Merge PDFs",      icon: GitMerge  },
      { href: "/dashboard/pdf/split",        label: "Split PDF",       icon: Scissors  },
      { href: "/dashboard/pdf/compress",     label: "Compress PDF",    icon: Package   },
      { href: "/dashboard/pdf/rotate",       label: "Rotate PDF",      icon: RotateCw  },
      { href: "/dashboard/pdf/delete-pages", label: "Delete Pages",    icon: Trash2    },
      { href: "/dashboard/pdf/crop",         label: "Crop PDF",        icon: Crop      },
      { href: "/dashboard/pdf/numbering",    label: "Add Numbering",   icon: Hash      },
      { href: "/dashboard/pdf/add-image",    label: "Add Image",       icon: ImagePlus },
    ],
  },
  {
    label: "SECURE",
    items: [
      { href: "/dashboard/pdf/sign",      label: "Sign PDF",       icon: PenLine  },
      { href: "/dashboard/pdf/watermark", label: "Add Watermark",  icon: Droplets },
    ],
  },
  {
    label: "CONVERT",
    items: [
      { href: "/dashboard/pdf/to-word",        label: "PDF → Word",       icon: FileOutput },
      { href: "/dashboard/pdf/to-jpeg",        label: "PDF → JPEG",       icon: ImageIcon  },
      { href: "/dashboard/pdf/to-epub",        label: "PDF → EPUB",       icon: BookOpen   },
      { href: "/dashboard/pdf/from-word",      label: "Word → PDF",       icon: FileInput  },
      { href: "/dashboard/pdf/from-image",     label: "Image → PDF",      icon: FileImage  },
      { href: "/dashboard/pdf/from-epub",      label: "EPUB → PDF",       icon: BookOpen   },
      { href: "/dashboard/pdf/compress-image", label: "Compress Image",   icon: Minimize2  },
    ],
  },
];

const BOTTOM_NAV = [
  { href: "/dashboard/settings", label: "Settings",       icon: Settings },
  { href: "/dashboard/upgrade",  label: "Upgrade to Pro", icon: Zap      },
];

interface SidebarProps {
  user: { name: string; email: string };
  energy: EnergyStatus | null;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ user, energy }: SidebarProps) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  useEffect(() => {
    close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-bg",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:transition-none"
        )}
      >
        {/* Logo + close */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="text-xl font-bold text-white">
            doc<span className="text-brand-primary">focal</span>
          </span>
          <button onClick={close}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dashboard home */}
        <div className="shrink-0 px-3 pb-1">
          <Link href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive("/dashboard", pathname)
                ? "bg-brand-primary/15 font-semibold text-brand-primary"
                : "font-medium text-white/70 hover:bg-white/10 hover:text-white"
            )}>
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
        </div>

        {/* Grouped nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon }) => (
                  <Link key={href + label} href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive(href, pathname)
                        ? "bg-brand-primary/15 font-semibold text-brand-primary"
                        : "font-medium text-white/70 hover:bg-white/10 hover:text-white"
                    )}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="shrink-0 space-y-0.5 border-t border-white/10 px-3 py-3">
          {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(href, pathname)
                  ? "bg-brand-primary/15 font-semibold text-brand-primary"
                  : "font-medium text-white/70 hover:bg-white/10 hover:text-white"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* Energy widget */}
        {energy && <EnergyWidget initial={energy} />}

        {/* User */}
        <div className="shrink-0 border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>
          <form action={signOut} className="mt-3">
            <button type="submit"
              className="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
