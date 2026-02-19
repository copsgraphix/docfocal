import { notFound } from "next/navigation";
import { PdfToolRenderer } from "@/components/pdf-tool-renderer";

// Maps URL slug → { title, description }
const TOOLS: Record<string, { title: string; description: string }> = {
  // PDF Toolkit
  "merge":          { title: "Merge PDFs",        description: "Combine multiple PDFs into one file" },
  "split":          { title: "Split / Extract",   description: "Pull specific pages from a PDF" },
  "compress":       { title: "Compress PDF",      description: "Reduce file size by removing redundant data" },
  "rotate":         { title: "Rotate PDF",        description: "Rotate pages by 90°, 180°, or 270°" },
  "delete-pages":   { title: "Delete Pages",      description: "Remove specific pages from a PDF" },
  "crop":           { title: "Crop PDF",          description: "Trim margins from each side of every page" },
  "numbering":      { title: "Add Page Numbers",  description: "Add page numbers to the bottom of each page" },
  "add-image":      { title: "Add Image to PDF",  description: "Embed an image on a specific page" },
  // Secure
  "sign":           { title: "Sign PDF",          description: "Draw or type your signature and embed it" },
  "watermark":      { title: "Add Watermark",     description: "Stamp diagonal text on every page" },
  // Convert
  "to-word":        { title: "PDF → Word",        description: "Export PDF text as a Word document" },
  "to-jpeg":        { title: "PDF → JPEG",        description: "Export each page as a JPEG image" },
  "to-epub":        { title: "PDF → EPUB",        description: "Export PDF text as an eBook" },
  "from-word":      { title: "Word → PDF",        description: "Convert a Word document to PDF" },
  "from-image":     { title: "Image → PDF",       description: "Pack JPEG/PNG images into a PDF" },
  "from-epub":      { title: "EPUB → PDF",        description: "Convert an eBook to PDF" },
  "compress-image": { title: "Compress Image",    description: "Resize and re-compress JPEG/PNG images" },
};

export function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export default async function PdfToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const entry = TOOLS[tool];
  if (!entry) notFound();

  const { title, description } = entry;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <p className="mt-1 text-text-secondary">{description}</p>
      </div>
      <div className="max-w-xl">
        <PdfToolRenderer tool={tool} />
      </div>
    </div>
  );
}
