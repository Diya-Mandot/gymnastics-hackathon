import Anthropic from "@anthropic-ai/sdk";
import { buildUserPrompt, sampleBrief, SYSTEM_PROMPT, type BriefRequest } from "@/lib/ai/brief";
import { defaultBrief } from "@/lib/match";
import { athleteBySlug, sponsorPackages } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function sampleStream(text: string) {
  return textStream(async (write) => {
    // Word-by-word so the offline sample feels like the live one.
    for (const piece of text.match(/\S+\s*/g) ?? []) {
      write(piece);
      await new Promise((r) => setTimeout(r, 18));
    }
  });
}

const headers = (source: "live" | "sample") => ({
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Brief-Source": source,
});

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<BriefRequest>;
  const athlete = athleteBySlug(body.athleteSlug ?? "");
  const pkg = sponsorPackages.find((p) => p.id === body.packageId) ?? sponsorPackages[1];
  if (!athlete) return Response.json({ error: "Unknown athlete" }, { status: 400 });

  const brief = { ...defaultBrief, budget: pkg.price };

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(sampleStream(sampleBrief(athlete, pkg)), { headers: headers("sample") });
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    output_config: { effort: "low" }, // fast enough to watch live on stage
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(athlete, pkg, brief) }],
  });

  // Fail over to the sample if the request can't start (bad key, rate limit, outage).
  try {
    await new Promise<void>((resolve, reject) => {
      stream.on("connect", () => resolve());
      stream.on("error", reject);
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`Brief API error ${error.status}:`, error.message);
    else console.error("Brief stream failed to start:", error);
    return new Response(sampleStream(sampleBrief(athlete, pkg)), { headers: headers("sample") });
  }

  return new Response(
    textStream(async (write) => {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") write(event.delta.text);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") write("\n\n[The draft was declined. Try a different athlete or package.]");
        if (final.stop_reason === "max_tokens") write("\n\n[Draft cut short. Generate again for the full brief.]");
      } catch (error) {
        console.error("Brief stream interrupted:", error);
        write("\n\n[Connection interrupted. Generate again to finish the draft.]");
      }
    }),
    { headers: headers("live") },
  );
}
