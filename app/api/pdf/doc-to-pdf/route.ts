import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { textToPdf } from "@/lib/pdf-text-layout";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // .docx files are ZIP archives — validate PK magic bytes (0x50 0x4B 0x03 0x04)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return NextResponse.json(
        { error: "The uploaded file doesn't appear to be a valid .docx file. Only .docx files are supported." },
        { status: 422 }
      );
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    const pdfBytes = await textToPdf(text);
    const baseName = file.name.replace(/\.(docx?|odt)$/i, "");

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert DOC to PDF. Make sure the file is a valid .docx file." },
      { status: 422 }
    );
  }
}
