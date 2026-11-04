import { MEDIA_KIT_SYSTEM, mediaKitPrompt, sampleMediaKit, type MediaKitRequest } from "@/lib/ai/mediaKit";
import { claudeTextResponse } from "@/lib/ai/stream";
import { athleteBySlug } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<MediaKitRequest>;
  const athlete = athleteBySlug(body.athleteSlug ?? "");
  if (!athlete) return Response.json({ error: "Unknown athlete" }, { status: 400 });

  const input: MediaKitRequest = {
    athleteSlug: athlete.slug,
    transcript: String(body.transcript ?? "").slice(0, 4000),
    interests: String(body.interests ?? "").slice(0, 500),
    preferences: Array.isArray(body.preferences) ? body.preferences.map(String).slice(0, 6) : [],
  };

  return claudeTextResponse({
    label: "Media kit",
    system: MEDIA_KIT_SYSTEM,
    user: mediaKitPrompt(athlete, input),
    sample: sampleMediaKit(athlete, input),
  });
}
