import Anthropic from "@anthropic-ai/sdk";
import { SCORING_SYSTEM_PROMPT } from "@/lib/scoring-prompt";
import fs from "fs";
import path from "path";

function resolveApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  for (const file of [".env.local", ".env"]) {
    try {
      const content = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      const m = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
      if (m) return m[1].trim();
    } catch {}
  }
  return "";
}

export async function POST(request: Request) {
  let transcription: string;
  let prompt: string;

  try {
    const body = await request.json() as { transcription?: string; prompt?: string };
    transcription = body.transcription ?? "";
    prompt = body.prompt ?? "";
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!transcription.trim()) {
    return new Response(JSON.stringify({ error: "Transcription is empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set in .env.local" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  // Create stream — if this throws (auth error, model name, quota) return 500 before any bytes sent
  let stream: AsyncIterable<Anthropic.MessageStreamEvent>;
  try {
    stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      stream: true,
      system: SCORING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Task: "${prompt}"\n\n<student_response>\n${transcription.trim()}\n</student_response>`,
        },
      ],
    });
  } catch (err) {
    console.error("[score] Anthropic API error:", err);
    const msg = err instanceof Error ? err.message : "Claude API unreachable";
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream text chunks to client as plain text
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        // Error mid-stream: append error message and close cleanly
        const msg = err instanceof Error ? err.message : "Stream interrupted";
        controller.enqueue(new TextEncoder().encode(`\n\n[Error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
