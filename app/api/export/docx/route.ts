import { NextRequest, NextResponse } from "next/server";
import { Document, Paragraph, Packer, HeadingLevel } from "docx";

export async function POST(request: NextRequest) {
  let body: { text: string; title: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { text, title } = body;
  if (!text && !title)
    return NextResponse.json({ error: "No content" }, { status: 400 });

  const contentLines = (text ?? "").split("\n");
  const paragraphs = contentLines.map((line) => new Paragraph({ text: line }));

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
          ...paragraphs,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const safeName = (title || "document").replace(/[^a-z0-9_\-. ]/gi, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${safeName}.docx"`,
    },
  });
}
