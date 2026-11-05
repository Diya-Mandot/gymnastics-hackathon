// The team's Year 1 NIL plan: how $646K of total NIL activity is built, where a sponsorship dollar goes,
// and what a sponsor needs to break even. Every figure is a proposed assumption, not verified revenue.

// 1. Year 1 total NIL activity (gross, includes the existing baseline)
export type ActivityLine = { stream: string; count: number; unit: number; months?: number; kind: "sponsor" | "fan" };

export const EXISTING_BASELINE = 200_000; // unverified; must not already include any line below

export const year1Plan: ActivityLine[] = [
  { stream: "Impact Routines", count: 15, unit: 15_000, kind: "sponsor" },
  { stream: "Community Spark", count: 8, unit: 5_000, kind: "sponsor" },
  { stream: "Red Rocks Partner", count: 3, unit: 30_000, kind: "sponsor" },
  { stream: "Monthly supporters", count: 500, unit: 10, months: 12, kind: "fan" },
  { stream: "Celebration videos", count: 200, unit: 80, kind: "fan" },
  { stream: "Sponsored fan-match activations", count: 3, unit: 5_000, kind: "sponsor" },
];

export const lineTotal = (l: ActivityLine) => l.count * l.unit * (l.months ?? 1);

export function planTotals(plan = year1Plan, baseline = EXISTING_BASELINE) {
  const newActivity = plan.reduce((s, l) => s + lineTotal(l), 0);
  const sponsorActivity = plan.filter((l) => l.kind === "sponsor").reduce((s, l) => s + lineTotal(l), 0);
  const total = newActivity + baseline;
  return {
    newActivity,
    sponsorActivity,
    fanActivity: newActivity - sponsorActivity,
    baseline,
    total,
    multiple: total / baseline,
    increasePct: (newActivity / baseline) * 100,
  };
}

// 2. Where a sponsorship dollar goes (proposed standard split, not an industry benchmark)
export const allocation = [
  { key: "athlete", label: "Athlete NIL compensation", pct: 0.65, note: "NIL rights, appearances, promotion and agreed deliverables" },
  { key: "creative", label: "Creative production", pct: 0.12, note: "Graphics, photo, video and Adobe creative assets" },
  { key: "activation", label: "Campaign activation", pct: 0.10, note: "Advertising, distribution, sponsor promotions" },
  { key: "community", label: "Community engagement", pct: 0.08, note: "Fan activities, events and community initiatives" },
  { key: "platform", label: "Platform fee", pct: 0.05, note: "Gross platform revenue, not profit" },
] as const;

export type AllocationKey = (typeof allocation)[number]["key"];

/** Splits a deal into its five parts. Rounds to whole dollars and puts any rounding difference on the athlete. */
export function splitDeal(amount: number): Record<AllocationKey, number> {
  const parts = Object.fromEntries(allocation.map((a) => [a.key, Math.round(amount * a.pct)])) as Record<AllocationKey, number>;
  const diff = amount - Object.values(parts).reduce((s, v) => s + v, 0);
  parts.athlete += diff;
  return parts;
}

// 3. Sponsor break-even: count only incremental, attributable customers
export const contributionScenarios = [
  { label: "Low-ticket retail / food", perCustomer: 25 },
  { label: "Mid-ticket services / fitness", perCustomer: 100 },
  { label: "Higher-value recurring services", perCustomer: 250 },
] as const;

export const breakEvenCustomers = (cost: number, perCustomer: number) => Math.ceil(cost / perCustomer);

export function sponsorReturn(cost: number, perCustomer: number, customers: number) {
  const contribution = customers * perCustomer;
  const net = contribution - cost;
  return { contribution, net, roiPct: (net / cost) * 100 };
}

// 4. Reporting categories the platform keeps separate
export function reporting(plan = year1Plan, baseline = EXISTING_BASELINE) {
  const t = planTotals(plan, baseline);
  const sponsorSplit = splitDeal(t.sponsorActivity);
  return {
    grossNilActivity: t.total,
    newNilActivity: t.newActivity,
    // Athletes receive 65% of new sponsorship; fan revenue is shown gross until fan-side costs are modelled.
    athleteFromSponsorships: sponsorSplit.athlete,
    platformRevenue: sponsorSplit.platform,
    campaignCosts: sponsorSplit.creative + sponsorSplit.activation + sponsorSplit.community,
  };
}
