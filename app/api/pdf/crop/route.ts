import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const left   = parseFloat((formData.get("left")   as string) ?? "0");
  const top    = parseFloat((formData.get("top")    as string) ?? "0");
  const right  = parseFloat((formData.get("right")  as string) ?? "0");
  const bottom = parseFloat((formData.get("bottom") as string) ?? "0");

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  const sum = left + right;
  const sumVert = top + bottom;
  if (sum >= 100 || sumVert >= 100)
    return NextResponse.json({ error: "Crop margins leave no visible area." }, { status: 400 });

  try {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());

    for (const page of pdfDoc.getPages()) {
      const mb = page.getMediaBox();
      const cropX      = mb.x + mb.width  * (left   / 100);
      const cropY      = mb.y + mb.height * (bottom / 100);
      const cropWidth  = mb.width  * (1 - (left + right)  / 100);
      const cropHeight = mb.height * (1 - (top  + bottom) / 100);
      page.setCropBox(cropX, cropY, cropWidth, cropHeight);
    }

    const pdfBytes = await pdfDoc.save();
    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-cropped.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to crop PDF." }, { status: 422 });
  }
}
