import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file        = formData.get("file")        as File | null;
  const startNumber = parseInt((formData.get("startNumber") as string) ?? "1");
  const position    = (formData.get("position") as string) ?? "center"; // "center"|"left"|"right"

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  try {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
    const marginBottom = 28;
    const marginSide   = 40;

    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page   = pages[i];
      const { width } = page.getSize();
      const label  = String(startNumber + i);
      const tw     = font.widthOfTextAtSize(label, fontSize);

      let x: number;
      if (position === "left")       x = marginSide;
      else if (position === "right") x = width - marginSide - tw;
      else                           x = (width - tw) / 2;  // center

      page.drawText(label, {
        x,
        y:    marginBottom,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-numbered.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to add page numbers." }, { status: 422 });
  }
}
