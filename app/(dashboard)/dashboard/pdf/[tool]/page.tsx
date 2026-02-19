import { notFound } from "next/navigation";
import {
  MergeTool, SplitTool, CompressPdfTool, RotateTool, DeletePagesTool,
  CropTool, PageNumbersTool, AddImageToPdfTool, SignTool, WatermarkTool,
  PdfToDocTool, PdfToJpegTool, PdfToEpubTool, DocToPdfTool, JpegToPdfTool,
  EpubToPdfTool, CompressImageTool,
} from "@/components/pdf-tools";

// Maps URL slug → { component, title, description }
const TOOLS: Record<string, {
  component: React.ComponentType;
  title: string;
  description: string;
}> = {
  // PDF Toolkit
  "merge":          { component: MergeTool,        title: "Merge PDFs",        description: "Combine multiple PDFs into one file" },
  "split":          { component: SplitTool,         title: "Split / Extract",   description: "Pull specific pages from a PDF" },
  "compress":       { component: CompressPdfTool,   title: "Compress PDF",      description: "Reduce file size by removing redundant data" },
  "rotate":         { component: RotateTool,         title: "Rotate PDF",        description: "Rotate pages by 90°, 180°, or 270°" },
  "delete-pages":   { component: DeletePagesTool,   title: "Delete Pages",      description: "Remove specific pages from a PDF" },
  "crop":           { component: CropTool,           title: "Crop PDF",          description: "Trim margins from each side of every page" },
  "numbering":      { component: PageNumbersTool,   title: "Add Page Numbers",  description: "Add page numbers to the bottom of each page" },
  "add-image":      { component: AddImageToPdfTool, title: "Add Image to PDF",  description: "Embed an image on a specific page" },
  // Secure
  "sign":           { component: SignTool,           title: "Sign PDF",          description: "Draw or type your signature and embed it" },
  "watermark":      { component: WatermarkTool,      title: "Add Watermark",     description: "Stamp diagonal text on every page" },
  // Convert
  "to-word":        { component: PdfToDocTool,       title: "PDF → Word",        description: "Export PDF text as a Word document" },
  "to-jpeg":        { component: PdfToJpegTool,      title: "PDF → JPEG",        description: "Export each page as a JPEG image" },
  "to-epub":        { component: PdfToEpubTool,      title: "PDF → EPUB",        description: "Export PDF text as an eBook" },
  "from-word":      { component: DocToPdfTool,        title: "Word → PDF",        description: "Convert a Word document to PDF" },
  "from-image":     { component: JpegToPdfTool,      title: "Image → PDF",       description: "Pack JPEG/PNG images into a PDF" },
  "from-epub":      { component: EpubToPdfTool,      title: "EPUB → PDF",        description: "Convert an eBook to PDF" },
  "compress-image": { component: CompressImageTool,  title: "Compress Image",    description: "Resize and re-compress JPEG/PNG images" },
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

  const { component: Tool, title, description } = entry;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <p className="mt-1 text-text-secondary">{description}</p>
      </div>
      <div className="max-w-xl">
        <Tool />
      </div>
    </div>
  );
}
