import Anthropic from "@anthropic-ai/sdk";
import { WRITING_SCORING_PROMPT } from "@/lib/writing-scoring-prompt";
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
  let essay: string;
  let prompt: string;
  let context: string | undefined;

  try {
    const body = await request.json() as {
      essay?: string;
      prompt?: string;
      context?: string;
    };
    essay = body.essay ?? "";
    prompt = body.prompt ?? "";
    context = body.context;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!essay.trim() || essay.trim().split(/\s+/).length < 10) {
    return new Response(JSON.stringify({ error: "Essay terlalu pendek" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new Anthropic({ apiKey });

  const userMessage = context
    ? `Task: "${prompt}"\n\nContext:\n${context}\n\n<student_essay>\n${essay.trim()}\n</student_essay>`
    : `Task: "${prompt}"\n\n<student_essay>\n${essay.trim()}\n</student_essay>`;

  let stream: AsyncIterable<Anthropic.MessageStreamEvent>;
  try {
    stream = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      stream: true,
      system: WRITING_SCORING_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Claude API unreachable";
    return new Response(JSON.stringify({ error: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

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
