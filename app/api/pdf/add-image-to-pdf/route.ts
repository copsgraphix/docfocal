import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const pdfFile   = formData.get("file")   as File | null;
  const imageFile = formData.get("image")  as File | null;
  const pageNum   = parseInt((formData.get("page") as string) ?? "1");
  const xPct      = parseFloat((formData.get("x") as string) ?? "10");
  const yPct      = parseFloat((formData.get("y") as string) ?? "10");
  const wPct      = parseFloat((formData.get("w") as string) ?? "30");
  const hPct      = parseFloat((formData.get("h") as string) ?? "20");

  if (!pdfFile)   return NextResponse.json({ error: "No PDF uploaded." },   { status: 400 });
  if (!imageFile) return NextResponse.json({ error: "No image uploaded." }, { status: 400 });

  try {
    const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
    const pages  = pdfDoc.getPages();

    if (pageNum < 1 || pageNum > pages.length)
      return NextResponse.json({ error: `Page ${pageNum} does not exist.` }, { status: 400 });

    const page           = pages[pageNum - 1];
    const { width, height } = page.getSize();

    const imgBytes = await imageFile.arrayBuffer();
    const isJpeg   =
      imageFile.type === "image/jpeg" ||
      /\.(jpg|jpeg)$/i.test(imageFile.name);

    const img = isJpeg
      ? await pdfDoc.embedJpg(imgBytes)
      : await pdfDoc.embedPng(imgBytes);

    page.drawImage(img, {
      x:      width  * (xPct / 100),
      y:      height * (1 - (yPct + hPct) / 100),  // PDF y from bottom
      width:  width  * (wPct / 100),
      height: height * (hPct / 100),
    });

    const pdfBytes = await pdfDoc.save();
    const baseName = pdfFile.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-with-image.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to add image to PDF." }, { status: 422 });
  }
}
