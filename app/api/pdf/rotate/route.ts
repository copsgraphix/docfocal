import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

function parsePageList(param: string | null, total: number): number[] {
  if (!param || param.trim() === "all") return Array.from({ length: total }, (_, i) => i);
  const indices: number[] = [];
  for (const part of param.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [a, b] = trimmed.split("-").map(Number);
      for (let i = a; i <= b; i++) if (i >= 1 && i <= total) indices.push(i - 1);
    } else {
      const n = Number(trimmed);
      if (n >= 1 && n <= total) indices.push(n - 1);
    }
  }
  return indices;
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const angle = parseInt((formData.get("angle") as string) ?? "90");
  const pagesParam = formData.get("pages") as string | null;

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (![90, 180, 270].includes(angle))
    return NextResponse.json({ error: "Angle must be 90, 180, or 270." }, { status: 400 });

  try {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();
    const indices = parsePageList(pagesParam, pages.length);

    for (const idx of indices) {
      const pg = pages[idx];
      const cur = pg.getRotation().angle;
      pg.setRotation(degrees((cur + angle) % 360));
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-rotated.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to rotate PDF." }, { status: 422 });
  }
}
