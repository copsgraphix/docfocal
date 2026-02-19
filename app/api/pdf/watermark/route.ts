import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { checkAndConsumeEnergy } from "@/lib/energy";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file    = formData.get("file")    as File | null;
  const text    = (formData.get("text")   as string | null)?.trim() || "CONFIDENTIAL";
  const opacity = parseFloat((formData.get("opacity") as string) ?? "0.25");

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!text)  return NextResponse.json({ error: "Watermark text is required." }, { status: 400 });

  const energyErr = await checkAndConsumeEnergy();
  if (energyErr) return energyErr;

  try {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const font   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 52;

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      // Place the origin so the text runs diagonally through the page centre.
      // When rotated 45°, the centroid of the text box shifts, so we offset by
      // half the text width along the rotated axis.
      const diagX = width  / 2 - (textWidth / 2) * Math.cos(Math.PI / 4);
      const diagY = height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4);

      page.drawText(text, {
        x:       diagX,
        y:       diagY,
        size:    fontSize,
        font,
        rotate:  degrees(45),
        opacity: Math.min(1, Math.max(0, opacity)),
        color:   rgb(0.45, 0.45, 0.45),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-watermarked.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to add watermark." }, { status: 422 });
  }
}
