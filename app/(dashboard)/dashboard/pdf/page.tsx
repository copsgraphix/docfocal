import type { Metadata } from "next";
import { ToolCard } from "@/components/dashboard/tool-card";
import {
  GitMerge, Scissors, Package, RotateCw, Trash2, Crop, Hash,
  ImagePlus, PenLine, Droplets, FileOutput, FileInput,
  ImageIcon, FileImage, BookOpen, Minimize2,
} from "lucide-react";

export const metadata: Metadata = { title: "PDF Toolkit" };

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-secondary">
      {children}
    </h3>
  );
}

export default function PDFToolkitPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">PDF Toolkit</h2>
        <p className="mt-1 text-text-secondary">
          Select a tool to get started — each opens on its own focused page.
        </p>
      </div>

      <section className="mb-10">
        <SectionHeading>PDF Toolkit</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/merge"        icon={GitMerge}  title="Merge PDFs"       description="Combine multiple PDFs into one" />
          <ToolCard href="/dashboard/pdf/split"        icon={Scissors}  title="Split / Extract"  description="Pull specific pages from a PDF" />
          <ToolCard href="/dashboard/pdf/compress"     icon={Package}   title="Compress PDF"     description="Shrink PDF file size" />
          <ToolCard href="/dashboard/pdf/rotate"       icon={RotateCw}  title="Rotate PDF"       description="Rotate pages 90°, 180°, or 270°" />
          <ToolCard href="/dashboard/pdf/delete-pages" icon={Trash2}    title="Delete Pages"     description="Remove unwanted pages" />
          <ToolCard href="/dashboard/pdf/crop"         icon={Crop}      title="Crop PDF"         description="Trim margins from every page" />
          <ToolCard href="/dashboard/pdf/numbering"    icon={Hash}      title="Add Page Numbers" description="Number pages at the bottom" />
          <ToolCard href="/dashboard/pdf/add-image"    icon={ImagePlus} title="Add Image"        description="Embed an image on a specific page" />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading>Secure</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/sign"      icon={PenLine}  title="Sign PDF"      description="Draw or type your signature" />
          <ToolCard href="/dashboard/pdf/watermark" icon={Droplets} title="Add Watermark" description="Stamp diagonal text on every page" />
        </div>
      </section>

      <section className="mb-10">
        <SectionHeading>Convert</SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ToolCard href="/dashboard/pdf/to-word"        icon={FileOutput} title="PDF → Word"      description="Export text as a .docx file" />
          <ToolCard href="/dashboard/pdf/to-jpeg"        icon={ImageIcon}  title="PDF → JPEG"      description="Render each page as an image" />
          <ToolCard href="/dashboard/pdf/to-epub"        icon={BookOpen}   title="PDF → EPUB"      description="Export as an eBook" />
          <ToolCard href="/dashboard/pdf/from-word"      icon={FileInput}  title="Word → PDF"      description="Convert a .docx file to PDF" />
          <ToolCard href="/dashboard/pdf/from-image"     icon={FileImage}  title="Image → PDF"     description="Pack JPEG/PNG images into a PDF" />
          <ToolCard href="/dashboard/pdf/from-epub"      icon={BookOpen}   title="EPUB → PDF"      description="Convert an eBook to PDF" />
          <ToolCard href="/dashboard/pdf/compress-image" icon={Minimize2}  title="Compress Image"  description="Resize and re-compress images" />
        </div>
      </section>
    </div>
  );
}
