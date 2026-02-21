import type { Metadata } from "next";
import { getUserEnergyStatus } from "@/lib/energy";
import { EnergyWidget } from "@/components/dashboard/energy-widget";
import { ToolCard } from "@/components/dashboard/tool-card";
import { AIToolCard } from "@/components/dashboard/ai-tool-card";
import { RecentTools } from "@/components/dashboard/recent-tools";
import {
  FilePlus,
  FileText,
  Edit3,
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
  // AI Lab icons
  FileSearch,
  ClipboardList,
  SpellCheck,
  Presentation,
  ScanText,
  GraduationCap,
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

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: authData }, { count: docCount }, { count: cvCount }, plan, energy] =
    await Promise.all([
      supabase.auth.getClaims(),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("cvs").select("*", { count: "exact", head: true }),
      getUserPlan(),
      getUserEnergyStatus(),
    ]);

  const claims = authData?.claims ?? null;
  const email = (claims?.email as string) ?? "";
  const displayName =
    (claims?.user_metadata?.full_name as string) ??
    email.split("@")[0] ??
    "there";

  const isNew = (docCount ?? 0) === 0 && (cvCount ?? 0) === 0;
  const greeting = isNew ? `Welcome, ${displayName}!` : `Welcome back, ${displayName}!`;

  const stats = [
    { label: "Documents", value: docCount ?? 0 },
    { label: "CVs Created", value: cvCount ?? 0 },
    { label: "Plan", value: plan === "pro" ? "Pro ✦" : "Free" },
  ];

  return (
    <div>
      {/* Header + stats */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">{greeting}</h2>
        <p className="mt-1 text-text-secondary">
          Everything you need to create, edit, secure, and convert documents.
        </p>
      </div>

      {/* Energy — full-width row */}
      {energy && (
        <div className="mb-4">
          <EnergyWidget initial={energy} variant="dashboard" />
        </div>
      )}

      {/* Stats row */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-bg-main p-5">
            <p className="text-xs text-text-secondary">{label}</p>
            <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent tools — client component, reads from localStorage */}
      <RecentTools />

      {/* AI STUDENT LAB */}
      <section className="mb-10">
        <SectionHeading>AI Student Lab</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AIToolCard href="/dashboard/ai/summarizer"  icon={FileSearch}    title="PDF/DOCX Summarizer"   description="Summarize any document instantly with AI" />
          <AIToolCard href="/dashboard/ai/exam-gen"    icon={ClipboardList} title="Exam Q&amp;A Generator"    description="Generate practice questions from documents" />
          <AIToolCard href="/dashboard/editor"         icon={SpellCheck}    title="AI Grammar Pro"         description="Fix grammar inside any document you write" />
          <AIToolCard href="/dashboard/ai/slidedeck"   icon={Presentation}  title="SlideDeck Creator"      description="Generate a PPTX presentation with AI" />
          <AIToolCard href="/dashboard/ai/ocr"         icon={ScanText}      title="Image Text Scanner"     description="Extract text from images with AI vision" />
          <AIToolCard href="/dashboard/ai/chatbot"     icon={GraduationCap} title="Academic Chatbot"       description="SIWES reports, intros &amp; assignments — ask anything" />
        </div>
      </section>

      {/* CREATE & WRITE */}
      <section className="mb-10">
        <SectionHeading>Create &amp; Write</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/editor"     icon={FilePlus} title="New Document" description="Write and format rich-text documents" />
          <ToolCard href="/dashboard/cv"         icon={FileText} title="CV Builder"   description="Build a professional CV or resume" />
          <ToolCard href="/dashboard/pdf-editor" icon={Edit3}    title="PDF Editor"   description="Annotate, redact, draw and export PDFs" />
        </div>
      </section>

      {/* PDF TOOLKIT */}
      <section className="mb-10">
        <SectionHeading>PDF Toolkit</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/merge"        icon={GitMerge}  title="Merge PDFs"      description="Combine multiple PDFs into one" />
          <ToolCard href="/dashboard/pdf/split"        icon={Scissors}  title="Split PDF"       description="Extract a range of pages" />
          <ToolCard href="/dashboard/pdf/compress"     icon={Package}   title="Compress PDF"    description="Shrink PDF file size" />
          <ToolCard href="/dashboard/pdf/rotate"       icon={RotateCw}  title="Rotate PDF"      description="Rotate pages 90°, 180°, or 270°" />
          <ToolCard href="/dashboard/pdf/delete-pages" icon={Trash2}    title="Delete Pages"    description="Remove unwanted pages" />
          <ToolCard href="/dashboard/pdf/crop"         icon={Crop}      title="Crop PDF"        description="Trim margins from every page" />
          <ToolCard href="/dashboard/pdf/numbering"    icon={Hash}      title="Add Numbering"   description="Add page numbers at the bottom" />
          <ToolCard href="/dashboard/pdf/add-image"    icon={ImagePlus} title="Add Image"       description="Embed an image on a specific page" />
        </div>
      </section>

      {/* SECURE */}
      <section className="mb-10">
        <SectionHeading>Secure</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/watermark" icon={Droplets} title="Add Watermark" description="Stamp diagonal text on every page" />
          <ToolCard href="/dashboard/pdf/sign"      icon={PenLine}  title="Sign PDF"      description="Draw or type your signature and embed it" />
        </div>
      </section>

      {/* CONVERT */}
      <section className="mb-10">
        <SectionHeading>Convert</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/to-word"        icon={FileOutput} title="PDF → Word"      description="Export PDF text as a .docx file" />
          <ToolCard href="/dashboard/pdf/to-jpeg"        icon={ImageIcon}  title="PDF → JPEG"      description="Render each page as an image" />
          <ToolCard href="/dashboard/pdf/to-epub"        icon={BookOpen}   title="PDF → EPUB"      description="Export PDF as an eBook" />
          <ToolCard href="/dashboard/pdf/from-word"      icon={FileInput}  title="Word → PDF"      description="Convert a .docx file to PDF" />
          <ToolCard href="/dashboard/pdf/from-image"     icon={FileImage}  title="Image → PDF"     description="Pack JPEG/PNG images into a PDF" />
          <ToolCard href="/dashboard/pdf/from-epub"      icon={BookOpen}   title="EPUB → PDF"      description="Convert an eBook to PDF" />
          <ToolCard href="/dashboard/pdf/compress-image" icon={Minimize2}  title="Compress Image"  description="Resize and re-compress images" />
        </div>
      </section>
    </div>
  );
}
