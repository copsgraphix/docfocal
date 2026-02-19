import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

function parsePageSet(param: string, total: number): Set<number> {
  const set = new Set<number>();
  for (const part of param.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map(Number);
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) set.add(i - 1);
    } else {
      const n = Number(trimmed);
      if (n >= 1 && n <= total) set.add(n - 1);
    }
  }
  return set;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const pagesParam = formData.get("pages") as string | null;

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!pagesParam?.trim())
    return NextResponse.json({ error: "Specify pages to delete." }, { status: 400 });

  try {
    const srcDoc = await PDFDocument.load(await file.arrayBuffer());
    const total = srcDoc.getPageCount();
    const toDelete = parsePageSet(pagesParam, total);

    if (toDelete.size >= total)
      return NextResponse.json({ error: "Cannot delete all pages." }, { status: 400 });

    const keepIndices = Array.from({ length: total }, (_, i) => i).filter(
      (i) => !toDelete.has(i)
    );

    const newDoc = await PDFDocument.create();
    const copied = await newDoc.copyPages(srcDoc, keepIndices);
    copied.forEach((p) => newDoc.addPage(p));

    const pdfBytes = await newDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-edited.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to delete pages." }, { status: 422 });
  }
}
