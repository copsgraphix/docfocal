import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { consumeEnergyBulkServer } from "@/lib/energy";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an Academic Assistant specialized for Nigerian university students. You help with:

1. **SIWES Reports** — Structure, content, and writing guidance for Student Industrial Work Experience Scheme reports. You know the standard SIWES format: Cover Page, Letter of Transmittal, Certification, Acknowledgement, Table of Contents, Abstract, Chapter 1 (Introduction/Background), Chapter 2 (Organization Description), Chapter 3 (Work Done), Chapter 4 (Skills Acquired), Conclusion, Recommendations, References, Appendix.

2. **Project Introductions** — Writing compelling Chapter 1 sections for undergraduate projects (Background, Statement of Problem, Objectives, Significance, Scope & Limitations, Definition of Terms).

3. **Assignment Outlines** — Structuring and outlining academic assignments for Nigerian university courses.

4. **Research Paper Help** — APA/MLA citations, literature reviews, research methodology for Nigerian academic standards.

5. **General Academic Writing** — Grammar, clarity, academic tone, essay structure.

Always be encouraging, practical, and specific. Reference Nigerian academic conventions where relevant. When asked to write something, provide complete, ready-to-use content the student can customize.`;

export async function POST(request: NextRequest) {
  let body: { messages?: Array<{ role: "user" | "assistant"; content: string }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  // Only charge energy on the first message of a conversation
  const isFirstMessage = messages.length === 1;
  if (isFirstMessage) {
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
  }

  const stream = await anthropic.messages.stream({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: messages.slice(-20), // keep last 20 messages for context
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
