import Anthropic from "@anthropic-ai/sdk";
import { ASSET_SYSTEM, assetPrompt, assetSchema, sampleAssets, type AssetCopy, type AssetRequest } from "@/lib/ai/assets";
import { athleteBySlug } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns copy for four Adobe-ready graphics as JSON: live from Claude, or a labelled sample without a key.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<AssetRequest>;
  const athlete = athleteBySlug(body.athleteSlug ?? "");
  if (!athlete) return Response.json({ error: "Unknown athlete" }, { status: 400 });

  const input: AssetRequest = {
    athleteSlug: athlete.slug,
    campaign: String(body.campaign ?? "Confidence Starts Here").slice(0, 80),
    sponsor: String(body.sponsor ?? "").slice(0, 80),
    tone: String(body.tone ?? "").slice(0, 80),
  };
  const sample = () => Response.json({ source: "sample", copy: sampleAssets(athlete, input) });
  if (!process.env.ANTHROPIC_API_KEY) return sample();

  try {
    const client = new Anthropic();
    const res = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: assetSchema } },
      system: ASSET_SYSTEM,
      messages: [{ role: "user", content: assetPrompt(athlete, input) }],
    });
    if (res.stop_reason !== "end_turn") return sample();
    const text = res.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return sample();
    return Response.json({ source: "live", copy: JSON.parse(text.text) as AssetCopy });
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`Assets API error ${error.status}:`, error.message);
    else console.error("Assets request failed:", error);
    return sample();
  }
}
