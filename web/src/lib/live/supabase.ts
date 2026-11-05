import type { SupabaseClient } from "@supabase/supabase-js";
import { athleteBySlug, athletes, seedCampaign } from "../seed";
import type { Campaign, Donation, LiveState } from "../types";
import type { GiveInput, LiveSource } from "./types";

/** Adapter for the SQL migrations in /supabase. All donations are mock demo transactions. */
type CampaignRow = {
  id: string;
  slug: string;
  name: string;
  goal: number | string;
  current_raised: number | string;
  supporter_count: number;
  business_funding: number | string;
  fan_contributions: number | string;
  athletes: { slug: string; name: string } | null;
};

type DonationRow = {
  id: string;
  created_at: string;
  supporter_name: string;
  amount: number | string;
  support_type: "one_time" | "monthly" | "celebration_video";
  thank_you_pack_sent: boolean;
  athletes: { slug: string; name: string } | null;
  campaigns: { name: string } | null;
};

// Database slugs predate the real-athlete switch; map them to the app's slugs.
const legacySlugs: Record<string, string> = { "avery-davis": "avery", "mia-torres": "camie", "sofia-patel": "clara", "jordan-lee": "ella" };

const uiSlug = (source: { slug: string; name: string } | null) =>
  athletes.find((athlete) => athlete.name === source?.name)?.slug ??
  (source ? legacySlugs[source.slug] ?? source.slug : seedCampaign.athleteSlug);

const toCampaign = (row: CampaignRow): Campaign => ({
  ...seedCampaign,
  id: row.id,
  slug: row.slug,
  name: row.name,
  athleteSlug: uiSlug(row.athletes),
  goal: Number(row.goal),
  raised: Number(row.current_raised),
  supporters: row.supporter_count,
  businessFunding: Number(row.business_funding),
  fanContributions: Number(row.fan_contributions),
});

const supportType = (type: DonationRow["support_type"]): Donation["supportType"] => {
  if (type === "monthly") return "Monthly supporter";
  if (type === "celebration_video") return "Impact Champion";
  return "One-time supporter";
};

const toDonation = (row: DonationRow): Donation => {
  const athleteSlug = uiSlug(row.athletes);
  return {
    id: row.id,
    createdAt: row.created_at,
    supporterName: row.supporter_name,
    athleteSlug,
    athleteName: athleteBySlug(athleteSlug)?.name ?? row.athletes?.name ?? "Red Rocks athlete",
    campaignName: row.campaigns?.name ?? seedCampaign.name,
    amount: Number(row.amount),
    supportType: supportType(row.support_type),
    thankYouPack: row.thank_you_pack_sent ? "Sent" : "Queued",
    status: "Received",
  };
};

let channelCount = 0;

export function createSupabaseSource(db: SupabaseClient): LiveSource {
  let current: LiveState | null = null;

  async function load(): Promise<LiveState> {
    const [{ data: campaign, error: campaignError }, { data: donations, error: donationsError }] = await Promise.all([
      db
        .from("campaigns")
        .select("id, slug, name, goal, current_raised, supporter_count, business_funding, fan_contributions, athletes(slug, name)")
        .eq("slug", seedCampaign.slug)
        .single<CampaignRow>(),
      db
        .from("donations")
        .select("id, created_at, supporter_name, amount, support_type, thank_you_pack_sent, athletes(slug, name), campaigns(name)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (campaignError) throw campaignError;
    if (donationsError) throw donationsError;
    // Without generated DB types, supabase-js types embedded relations as arrays; these many-to-one joins return objects.
    current = { campaign: toCampaign(campaign), activity: (donations as unknown as DonationRow[]).map(toDonation) };
    return current;
  }

  return {
    load,
    async giveDemo({ amount, supporterName }: GiveInput) {
      const { error } = await db.rpc("create_demo_donation", {
        p_campaign_slug: seedCampaign.slug,
        p_supporter_name: supporterName.trim() || "Demo Judge",
        p_amount: amount,
      });
      if (error) throw error;
      const state = await load();
      return { state, donation: state.activity[0] };
    },
    subscribe(callback) {
      // One channel per subscriber: Supabase reuses a channel with the same name, so a second
      // listener on the page (e.g. the admin dashboard plus its gift alerts) would cancel the first.
      const channel = db
        .channel(`rock-the-routine-live-${++channelCount}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "donations" }, async () => {
          const state = await load();
          callback({ state, donation: state.activity[0] });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "campaigns" }, async () => {
          const state = await load();
          callback({ state });
        })
        .subscribe();
      return () => {
        db.removeChannel(channel);
      };
    },
    async reset(passcode) {
      const response = await fetch("/api/demo/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Unable to reset the demo.");
      }
      return load();
    },
  };
}
