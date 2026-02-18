import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

function parsePageRange(input: string, totalPages: number): number[] {
  const indices: number[] = [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
      const start = Math.max(1, a);
      const end = Math.min(totalPages, b);
      for (let i = start; i <= end; i++) indices.push(i - 1);
    } else {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= totalPages) indices.push(n - 1);
    }
  }

  return [...new Set(indices)].sort((a, b) => a - b);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const pages = (formData.get("pages") as string | null)?.trim();

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!pages) {
    return NextResponse.json({ error: "No page range specified." }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const totalPages = src.getPageCount();

    const indices = parsePageRange(pages, totalPages);
    if (indices.length === 0) {
      return NextResponse.json(
        { error: `No valid pages found. This PDF has ${totalPages} page(s).` },
        { status: 422 }
      );
    }

    const extracted = await PDFDocument.create();
    const copied = await extracted.copyPages(src, indices);
    copied.forEach((page) => extracted.addPage(page));

    const pdfBytes = await extracted.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="extracted.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process PDF. Make sure the file is a valid PDF." },
      { status: 422 }
    );
  }
}
