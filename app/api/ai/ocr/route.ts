import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeEnergyBulkServer } from "@/lib/energy";
import { Document, Packer, Paragraph, TextRun } from "docx";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "1";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image uploaded." }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
    return NextResponse.json(
      { error: "Unsupported image type. Upload JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }

  // 5 MB limit
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });
  }

  const energy = await consumeEnergyBulkServer(3);
  if (!energy.ok && energy.reason === "no_energy") {
    return NextResponse.json(
      { error: "You've used all your daily energy. It resets at midnight UTC." },
      { status: 402 }
    );
  }
  if (!energy.ok) {
    return NextResponse.json({ error: "Could not consume energy." }, { status: 500 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: file.type as AllowedType,
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract ALL text from this image. Preserve the original layout as much as possible (paragraphs, line breaks, lists, tables). Return only the extracted text, no commentary.",
          },
        ],
      },
    ],
  });

  const extractedText =
    message.content[0].type === "text" ? message.content[0].text : "";

  if (download) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            ...extractedText.split("\n").map(
              (line) => new Paragraph({ children: [new TextRun({ text: line })] })
            ),
          ],
        },
      ],
    });
    const docxBytes = await Packer.toBuffer(doc);
    const baseName = file.name.replace(/\.(jpe?g|png|webp|gif)$/i, "");
    return new NextResponse(Buffer.from(docxBytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseName}-ocr.docx"`,
      },
    });
  }

  return NextResponse.json({ text: extractedText });
}
