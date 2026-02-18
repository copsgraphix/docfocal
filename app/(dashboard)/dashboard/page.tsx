import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/subscription";

export const metadata: Metadata = { title: "Dashboard" };

const cards = [
  {
    title: "Document Editor",
    description: "Create and edit documents with rich formatting.",
    href: "/dashboard/editor",
  },
  {
    title: "PDF Toolkit",
    description: "Merge, split, and convert PDF files.",
    href: "/dashboard/pdf",
  },
  {
    title: "CV Creator",
    description: "Build professional CVs and resumes.",
    href: "/dashboard/cv",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: docCount }, { count: cvCount }, plan] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("cvs").select("*", { count: "exact", head: true }),
    getUserPlan(),
  ]);

  const stats = [
    { label: "Documents", value: docCount ?? 0 },
    { label: "CVs Created", value: cvCount ?? 0 },
    { label: "Plan", value: plan === "pro" ? "Pro ✦" : "Free" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
        <p className="mt-1 text-text-secondary">Choose a tool to get started.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map(({ title, description, href }) => (
          <a
            key={href}
            href={href}
            className="group rounded-xl border border-border bg-bg-main p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="h-1 w-10 rounded-full bg-brand-primary" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary group-hover:text-brand-primary">
              {title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">{description}</p>
          </a>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-bg-main p-6"
          >
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
