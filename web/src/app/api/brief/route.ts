import { buildUserPrompt, sampleBrief, SYSTEM_PROMPT, type BriefRequest } from "@/lib/ai/brief";
import { claudeTextResponse } from "@/lib/ai/stream";
import { defaultBrief } from "@/lib/match";
import { athleteBySlug, sponsorPackages } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<BriefRequest>;
  const athlete = athleteBySlug(body.athleteSlug ?? "");
  const pkg = sponsorPackages.find((p) => p.id === body.packageId) ?? sponsorPackages.find((p) => p.id === "routine")!;
  if (!athlete) return Response.json({ error: "Unknown athlete" }, { status: 400 });

  return claudeTextResponse({
    label: "Brief",
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(athlete, pkg, { ...defaultBrief, budget: pkg.price }),
    sample: sampleBrief(athlete, pkg),
  });
}
