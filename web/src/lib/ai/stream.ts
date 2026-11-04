import Anthropic from "@anthropic-ai/sdk";

// Server-side helpers shared by the AI routes: stream Claude's text, or a labelled offline sample.

const encoder = new TextEncoder();

function textStream(producer: (write: (s: string) => void) => Promise<void>) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await producer((s) => controller.enqueue(encoder.encode(s)));
      } finally {
        controller.close();
      }
    },
  });
}

const headers = (source: "live" | "sample") => ({
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-AI-Source": source,
});

export function sampleResponse(text: string) {
  return new Response(
    textStream(async (write) => {
      // Word-by-word so the offline sample feels like the live one.
      for (const piece of text.match(/\S+\s*/g) ?? []) {
        write(piece);
        await new Promise((r) => setTimeout(r, 18));
      }
    }),
    { headers: headers("sample") },
  );
}

/** Streams Claude's text, falling back to `sample` when no key is set or the request can't start. */
export async function claudeTextResponse({ label, system, user, sample }: { label: string; system: string; user: string; sample: string }) {
  if (!process.env.ANTHROPIC_API_KEY) return sampleResponse(sample);

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    output_config: { effort: "low" }, // fast enough to watch live on stage
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: user }],
  });

  try {
    await new Promise<void>((resolve, reject) => {
      stream.on("connect", () => resolve());
      stream.on("error", reject);
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`${label} API error ${error.status}:`, error.message);
    else console.error(`${label} stream failed to start:`, error);
    return sampleResponse(sample);
  }

  return new Response(
    textStream(async (write) => {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") write(event.delta.text);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") write("\n\n[The draft was declined. Try different inputs.]");
        if (final.stop_reason === "max_tokens") write("\n\n[Draft cut short. Generate again for the full version.]");
      } catch (error) {
        console.error(`${label} stream interrupted:`, error);
        write("\n\n[Connection interrupted. Generate again to finish the draft.]");
      }
    }),
    { headers: headers("live") },
  );
}
