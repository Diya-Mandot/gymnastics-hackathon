import { createClient } from "@supabase/supabase-js";

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
  return Response.json({ data });
}
