import { createClient } from "@supabase/supabase-js";
import { seedCampaign } from "../seed";
import type { Campaign, Donation, LiveState } from "../types";
import type { GiveInput, LiveSource } from "./types";

/*
 * Expected backend contract (confirm with Prachi):
 *   table campaigns  (id, slug, name, athlete_slug, goal, raised, supporters,
 *                     business_funding, fan_contributions)
 *   table donations  (id, created_at, supporter_name, athlete_slug, athlete_name,
 *                     campaign_id, campaign_name, amount, support_type,
 *                     thank_you_pack, status)
 *   rpc give_demo(p_campaign_slug, p_athlete_slug, p_amount, p_supporter_name, p_support_type)
 *       -> inserts a mock donation + bumps campaign totals atomically. No payments.
 *   rpc reset_demo() -> restores seeded metrics.
 *   Realtime enabled on both tables.
 */

type CampaignRow = {
  id: string;
  slug: string;
  name: string;
  athlete_slug: string;
  goal: number;
  raised: number;
  supporters: number;
  business_funding: number;
  fan_contributions: number;
};

type DonationRow = {
  id: string;
  created_at: string;
  supporter_name: string;
  athlete_slug: string;
  athlete_name: string;
  campaign_name: string;
  amount: number;
  support_type: Donation["supportType"];
  thank_you_pack: Donation["thankYouPack"];
  status: Donation["status"];
};

const toCampaign = (r: CampaignRow): Campaign => ({
  ...seedCampaign, // sponsor/partner/supports copy is static for the demo
  id: r.id,
  slug: r.slug,
  name: r.name,
  athleteSlug: r.athlete_slug,
  goal: Number(r.goal),
  raised: Number(r.raised),
  supporters: r.supporters,
  businessFunding: Number(r.business_funding),
  fanContributions: Number(r.fan_contributions),
});

const toDonation = (r: DonationRow): Donation => ({
  id: r.id,
  createdAt: r.created_at,
  supporterName: r.supporter_name,
  athleteSlug: r.athlete_slug,
  athleteName: r.athlete_name,
  campaignName: r.campaign_name,
  amount: Number(r.amount),
  supportType: r.support_type,
  thankYouPack: r.thank_you_pack,
  status: r.status,
});

export function createSupabaseSource(url: string, anonKey: string): LiveSource {
  const db = createClient(url, anonKey);
  let current: LiveState | null = null;

  async function load(): Promise<LiveState> {
    const [{ data: c, error: ce }, { data: d, error: de }] = await Promise.all([
      db.from("campaigns").select("*").eq("slug", seedCampaign.slug).single<CampaignRow>(),
      db.from("donations").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (ce) throw ce;
    if (de) throw de;
    current = { campaign: toCampaign(c), activity: (d as DonationRow[]).map(toDonation) };
    return current;
  }

  return {
    load,
    async giveDemo({ athleteSlug, amount, supporterName, supportType }: GiveInput) {
      const { error } = await db.rpc("give_demo", {
        p_campaign_slug: seedCampaign.slug,
        p_athlete_slug: athleteSlug,
        p_amount: amount,
        p_supporter_name: supporterName.trim() || "Demo Judge",
        p_support_type: supportType ?? "One-time supporter",
      });
      if (error) throw error;
      const state = await load();
      return { state, donation: state.activity[0] };
    },
    subscribe(cb) {
      const ch = db
        .channel("rtr-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "donations" }, async (p) => {
          const state = await load();
          cb({ state, donation: toDonation(p.new as DonationRow) });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "campaigns" }, (p) => {
          if (!current) return;
          current = { ...current, campaign: toCampaign(p.new as CampaignRow) };
          cb({ state: current });
        })
        .subscribe();
      return () => {
        db.removeChannel(ch);
      };
    },
    async reset() {
      const { error } = await db.rpc("reset_demo");
      if (error) throw error;
      return load();
    },
  };
}
