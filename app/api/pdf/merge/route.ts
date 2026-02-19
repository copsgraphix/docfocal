import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { checkAndConsumeEnergy } from "@/lib/energy";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (files.length < 2) {
    return NextResponse.json(
      { error: "Upload at least 2 PDF files to merge." },
      { status: 400 }
    );
  }

  const energyErr = await checkAndConsumeEnergy();
  if (energyErr) return energyErr;

  try {
    const merged = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }

    const pdfBytes = await merged.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to merge PDFs. Make sure all files are valid PDFs." },
      { status: 422 }
    );
  }
}
