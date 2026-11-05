import { createClient } from "@supabase/supabase-js";
import { seedDeals, toDealRow } from "@/lib/dealModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expectedSecret = process.env.DEMO_RESET_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { passcode } = (await request.json().catch(() => ({}))) as { passcode?: string };

  if (!expectedSecret || !url || !serviceRoleKey) {
    return Response.json({ error: "Live reset is not configured." }, { status: 503 });
  }
  if (!passcode || passcode !== expectedSecret) {
    return Response.json({ error: "Incorrect demo reset code." }, { status: 401 });
  }

  const db = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data, error } = await db.rpc("reset_confidence_starts_here_demo");
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Restore the shared sponsor deals too. Non-fatal so the donation reset still works before
  // the demo_deals migration (202611040007) has been applied.
  let deals: string = "reset";
  const cleared = await db.from("demo_deals").delete().eq("is_demo", true);
  if (cleared.error) {
    deals = `skipped: ${cleared.error.message}`;
  } else {
    const inserted = await db.from("demo_deals").insert(seedDeals.map((d, i) => ({ ...toDealRow(d, i), is_demo: true })));
    if (inserted.error) deals = `failed: ${inserted.error.message}`;
  }
  return Response.json({ data, deals });
}
