import { NextRequest, NextResponse } from "next/server";
// Use lib path directly to avoid pdf-parse's debug test code running in Next.js
// (module.parent is undefined in bundled builds, which triggers the test path)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
import { Document, Packer, Paragraph } from "docx";

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

    // Validate PDF magic bytes: all PDFs begin with %PDF (0x25 0x50 0x44 0x46)
    if (buffer.length < 4 || buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return NextResponse.json(
        { error: "The uploaded file doesn't appear to be a valid PDF." },
        { status: 422 }
      );
    }

    const data = await pdfParse(buffer);
    const text = data.text;

    const paragraphs = text.split("\n").map((line: string) => new Paragraph({ text: line }));

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const docxBytes = await Packer.toBuffer(doc);

    const baseName = file.name.replace(/\.pdf$/i, "");

    return new NextResponse(Buffer.from(docxBytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseName}.docx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to convert PDF to DOC. Make sure the file is a valid PDF." },
      { status: 422 }
    );
  }
}
