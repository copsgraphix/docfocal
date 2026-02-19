import { NextRequest, NextResponse } from "next/server";
// pdf-parse has no default export in its ESM types; use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
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
