import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeEnergyBulkServer } from "@/lib/energy";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pptxgen = require("pptxgenjs");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Slide {
  title: string;
  bullets: string[];
}

export async function POST(request: NextRequest) {
  let body: { topic?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const topic = body?.topic?.trim();
  if (!topic) return NextResponse.json({ error: "No topic provided." }, { status: 400 });
  if (topic.length > 500) {
    return NextResponse.json({ error: "Topic too long (max 500 characters)." }, { status: 400 });
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

  const contextPart = body.context?.trim()
    ? `\n\nAdditional context: ${body.context.trim()}`
    : "";

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Create a professional presentation about: "${topic}"${contextPart}

Generate exactly 8 slides. Return a JSON array (no markdown, no code blocks) with this exact structure:
[
  { "title": "slide title", "bullets": ["bullet 1", "bullet 2", "bullet 3"] },
  ...
]

Rules:
- Slide 1: Title slide (title = presentation title, bullets = [subtitle, your name placeholder, date placeholder])
- Slides 2–7: Content slides with 3–5 bullet points each
- Slide 8: Conclusion / Thank You slide
- Keep bullet points concise (max 12 words each)
- Make content educational and professional`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";

  let slides: Slide[];
  try {
    // Strip markdown code blocks if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    slides = JSON.parse(cleaned);
    if (!Array.isArray(slides)) throw new Error("Not an array");
  } catch {
    return NextResponse.json({ error: "Failed to parse AI slide structure." }, { status: 500 });
  }

  // Build PPTX
  const prs = new pptxgen();
  prs.layout = "LAYOUT_WIDE";
  prs.title = topic;

  const BRAND_RED = "E10600";
  const DARK = "111111";
  const GRAY = "6B7280";
  const WHITE = "FFFFFF";

  slides.forEach((slide: Slide, idx: number) => {
    const sld = prs.addSlide();
    const isTitle = idx === 0;

    // Background
    sld.background = { color: isTitle ? DARK : WHITE };

    // Title
    sld.addText(slide.title, {
      x: 0.5,
      y: isTitle ? 1.5 : 0.4,
      w: "90%",
      h: isTitle ? 1.2 : 0.8,
      fontSize: isTitle ? 36 : 24,
      bold: true,
      color: isTitle ? WHITE : DARK,
      fontFace: "Calibri",
    });

    // Red accent bar (non-title slides)
    if (!isTitle) {
      sld.addShape(prs.ShapeType.rect, {
        x: 0.5,
        y: 1.25,
        w: 1.2,
        h: 0.07,
        fill: { color: BRAND_RED },
        line: { color: BRAND_RED },
      });
    }

    // Bullets
    const bulletY = isTitle ? 3.0 : 1.6;
    slide.bullets.forEach((bullet: string, bIdx: number) => {
      sld.addText(isTitle ? bullet : `• ${bullet}`, {
        x: 0.5,
        y: bulletY + bIdx * 0.55,
        w: "90%",
        h: 0.5,
        fontSize: isTitle ? 18 : 16,
        color: isTitle ? "D1D5DB" : GRAY,
        fontFace: "Calibri",
        bold: isTitle && bIdx === 0,
      });
    });

    // Slide number (non-title)
    if (!isTitle) {
      sld.addText(`${idx + 1}`, {
        x: "93%",
        y: "90%",
        w: 0.4,
        h: 0.3,
        fontSize: 10,
        color: GRAY,
        align: "right",
      });
    }

    // Brand mark on title slide
    if (isTitle) {
      sld.addText("docfocal", {
        x: 0.5,
        y: "88%",
        w: 2,
        h: 0.3,
        fontSize: 12,
        color: BRAND_RED,
        bold: true,
      });
    }
  });

  const pptxBuffer = await prs.write({ outputType: "nodebuffer" }) as Buffer;
  const safeTopic = topic.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);

  return new NextResponse(pptxBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${safeTopic}-slides.pptx"`,
    },
  });
}
