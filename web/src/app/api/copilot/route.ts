import { COPILOT_SYSTEM, copilotPrompt, sampleCopilot, type CopilotRequest } from "@/lib/ai/copilot";
import { claudeTextResponse } from "@/lib/ai/stream";
import { STAGES } from "@/lib/dealModel";
import { athleteBySlug } from "@/lib/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<CopilotRequest>;
  const athlete = athleteBySlug(body.athleteSlug ?? "");
  const deal = body.deal;
  if (!athlete || !deal || typeof deal.sponsor !== "string" || !STAGES.includes(deal.stage)) {
    return Response.json({ error: "Unknown athlete or deal" }, { status: 400 });
  }
  // The deal record comes from the browser's demo store; keep only bounded, expected fields.
  const clean = {
    ...deal,
    sponsor: deal.sponsor.slice(0, 120),
    nextAction: String(deal.nextAction ?? "").slice(0, 300),
    followUp: String(deal.followUp ?? "").slice(0, 40),
    amount: Number(deal.amount) || 0,
    collected: Number(deal.collected) || 0,
    tasks: (Array.isArray(deal.tasks) ? deal.tasks : []).slice(0, 20).map((t) => ({ ...t, title: String(t.title).slice(0, 160) })),
  };

  return claudeTextResponse({
    label: "Copilot",
    system: COPILOT_SYSTEM,
    user: copilotPrompt(athlete, clean),
    sample: sampleCopilot(athlete, clean),
  });
}
