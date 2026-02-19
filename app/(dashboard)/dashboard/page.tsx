import type { Metadata } from "next";
import Link from "next/link";
import {
  FilePlus,
  FileText,
  GitMerge,
  Scissors,
  Package,
  FileSearch,
  RotateCw,
  Trash2,
  Crop,
  Hash,
  Pencil,
  PenLine,
  Droplets,
  FileOutput,
  FileInput,
  ImageIcon,
  FileImage,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/subscription";

export const metadata: Metadata = { title: "Dashboard" };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
      {children}
    </h3>
  );
}

function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  soon,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  soon?: boolean;
}) {
  if (soon) {
    return (
      <div className="group relative rounded-xl border border-dashed border-border bg-bg-main p-5 opacity-60">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10">
          <Icon className="h-4 w-4 text-brand-primary" />
        </div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
        <span className="absolute right-3 top-3 rounded-full bg-bg-section px-2 py-0.5 text-[10px] font-medium text-text-secondary">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-bg-main p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 transition-colors group-hover:bg-brand-primary/20">
        <Icon className="h-4 w-4 text-brand-primary" />
      </div>
      <p className="text-sm font-semibold text-text-primary group-hover:text-brand-primary">
        {title}
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
    </Link>
  );
}

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
      {/* Header + stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
        <p className="mt-1 text-text-secondary">
          Everything you need to create, edit, secure, and convert documents.
        </p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-bg-main p-5">
            <p className="text-xs text-text-secondary">{label}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* CREATE & WRITE */}
      <section className="mb-10">
        <SectionHeading>Create &amp; Write</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard
            href="/dashboard/editor"
            icon={FilePlus}
            title="New Document"
            description="Write and format rich-text documents"
          />
          <ToolCard
            href="/dashboard/cv"
            icon={FileText}
            title="CV Builder"
            description="Build a professional CV or resume"
          />
        </div>
      </section>

      {/* PDF TOOLKIT */}
      <section className="mb-10">
        <SectionHeading>PDF Toolkit</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf" icon={Pencil}    title="Edit PDF"      description="Annotate and modify PDF pages" />
          <ToolCard href="/dashboard/pdf" icon={GitMerge}  title="Merge PDFs"   description="Combine multiple PDFs into one" />
          <ToolCard href="/dashboard/pdf" icon={Scissors}  title="Split PDF"    description="Extract a range of pages" />
          <ToolCard href="/dashboard/pdf" icon={Package}   title="Compress PDF" description="Shrink PDF file size" />
          <ToolCard href="/dashboard/pdf" icon={FileSearch} title="Extract Pages" description="Pull specific pages from a PDF" />
          <ToolCard href="/dashboard/pdf" icon={RotateCw}  title="Rotate PDF"   description="Rotate pages 90°, 180°, or 270°" />
          <ToolCard href="/dashboard/pdf" icon={Trash2}    title="Delete Pages" description="Remove unwanted pages" />
          <ToolCard href="/dashboard/pdf" icon={Crop}      title="Crop PDF"     description="Trim margins from every page" />
          <ToolCard href="/dashboard/pdf" icon={Hash}      title="Add Numbering" description="Add page numbers at the bottom" />
        </div>
      </section>

      {/* SECURE */}
      <section className="mb-10">
        <SectionHeading>Secure</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf" icon={Droplets}  title="Add Watermark" description="Stamp diagonal text on every page" />
          <ToolCard href="/dashboard/pdf" icon={PenLine}   title="Sign PDF"      description="Draw or type your signature" soon />
        </div>
      </section>

      {/* CONVERT */}
      <section className="mb-10">
        <SectionHeading>Convert</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf" icon={FileOutput} title="PDF → Word"  description="Export PDF text as a .docx file" />
          <ToolCard href="/dashboard/pdf" icon={ImageIcon}  title="PDF → JPEG"  description="Render each page as an image" />
          <ToolCard href="/dashboard/pdf" icon={BookOpen}   title="PDF → EPUB"  description="Export PDF as an eBook" />
          <ToolCard href="/dashboard/pdf" icon={FileInput}  title="Word → PDF"  description="Convert a .docx file to PDF" />
          <ToolCard href="/dashboard/pdf" icon={FileImage}  title="Image → PDF" description="Pack JPEG/PNG images into a PDF" />
          <ToolCard href="/dashboard/pdf" icon={BookOpen}   title="EPUB → PDF"  description="Convert an eBook to PDF" />
        </div>
      </section>
    </div>
  );
}
