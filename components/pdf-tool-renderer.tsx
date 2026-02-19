"use client";

import {
  MergeTool,
  SplitTool,
  CompressPdfTool,
  RotateTool,
  DeletePagesTool,
  CropTool,
  PageNumbersTool,
  AddImageToPdfTool,
  SignTool,
  WatermarkTool,
  PdfToDocTool,
  PdfToJpegTool,
  PdfToEpubTool,
  DocToPdfTool,
  JpegToPdfTool,
  EpubToPdfTool,
  CompressImageTool,
} from "@/components/pdf-tools";

const TOOL_MAP: Record<string, React.ComponentType> = {
  "merge":          MergeTool,
  "split":          SplitTool,
  "compress":       CompressPdfTool,
  "rotate":         RotateTool,
  "delete-pages":   DeletePagesTool,
  "crop":           CropTool,
  "numbering":      PageNumbersTool,
  "add-image":      AddImageToPdfTool,
  "sign":           SignTool,
  "watermark":      WatermarkTool,
  "to-word":        PdfToDocTool,
  "to-jpeg":        PdfToJpegTool,
  "to-epub":        PdfToEpubTool,
  "from-word":      DocToPdfTool,
  "from-image":     JpegToPdfTool,
  "from-epub":      EpubToPdfTool,
  "compress-image": CompressImageTool,
};

export function PdfToolRenderer({ tool }: { tool: string }) {
  const Tool = TOOL_MAP[tool];
  if (!Tool) return null;
  return <Tool />;
}
