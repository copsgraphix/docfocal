import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeEnergyBulkServer } from "@/lib/energy";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const text = body?.text?.trim();
  if (!text) return NextResponse.json({ error: "No text provided." }, { status: 400 });
  if (text.length > 10000) {
    return NextResponse.json({ error: "Text too long (max 10,000 characters)." }, { status: 400 });
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

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a professional grammar and writing editor. Correct the grammar, spelling, punctuation, and improve the clarity of the text below.

Return a JSON object with exactly these two fields:
- "corrected": the fully corrected text (preserve line breaks and paragraph structure)
- "changes": an array of strings, each describing a specific correction made (max 10 items)

Respond with ONLY the JSON object, no markdown, no explanation.

Text to correct:
${text}`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

  let parsed: { corrected?: string; changes?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    // If Claude didn't return valid JSON, treat the whole response as corrected text
    parsed = { corrected: raw, changes: [] };
  }

  return NextResponse.json({
    corrected: parsed.corrected ?? text,
    changes: parsed.changes ?? [],
  });
}
