import type { Metadata } from "next";
import { PdfEditorLoader } from "@/components/pdf-editor/PdfEditorLoader";

export const metadata: Metadata = { title: "PDF Editor" };

export default function PdfEditorPage() {
  return <PdfEditorLoader />;
}
