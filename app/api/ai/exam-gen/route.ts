import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeEnergyBulkServer } from "@/lib/energy";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { PDFParse } from "pdf-parse";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.name.toLowerCase().endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    return data.text;
  }
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download") === "1";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

  let text: string;
  try {
    text = await extractText(file);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not read file.";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "The file appears to be empty." }, { status: 422 });
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

  const prompt = `You are an exam question generator. Based on the document below, generate 10 exam questions with detailed answers.

Format each question as:
Q1. [Question text]
A1. [Detailed answer]

Generate a mix of: multiple-choice (indicate options A–D), short answer, and essay questions.

Document:
---
${text.slice(0, 15000)}
---`;

  if (download) {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const qa = message.content[0].type === "text" ? message.content[0].text : "";

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "Exam Questions & Answers", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({
              children: [new TextRun({ text: `Source: ${file.name}`, italics: true, color: "6B7280" })],
            }),
            new Paragraph({ text: "" }),
            ...qa.split("\n").map(
              (line) => new Paragraph({ children: [new TextRun({ text: line })] })
            ),
          ],
        },
      ],
    });

    const docxBytes = await Packer.toBuffer(doc);
    const baseName = file.name.replace(/\.(pdf|docx?)$/i, "");
    return new NextResponse(Buffer.from(docxBytes), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${baseName}-exam-qa.docx"`,
      },
    });
  }

  const stream = await anthropic.messages.stream({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
