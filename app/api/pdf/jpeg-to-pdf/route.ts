import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (files.length < 1) {
    return NextResponse.json({ error: "Upload at least one image." }, { status: 400 });
  }

  try {
    const pdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const isJpeg =
        file.type === "image/jpeg" ||
        file.name.toLowerCase().endsWith(".jpg") ||
        file.name.toLowerCase().endsWith(".jpeg");

      let img;
      if (isJpeg) {
        img = await pdf.embedJpg(bytes);
      } else {
        img = await pdf.embedPng(bytes);
      }

      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert images to PDF." },
      { status: 422 }
    );
  }
}
