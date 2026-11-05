// Deal model shared by server routes and client components (no browser APIs here).

export const STAGES = ["Prospect", "Qualified", "Contacted", "Meeting", "Proposal", "Negotiation", "Agreement", "Campaign", "Renewal"] as const;
export type Stage = (typeof STAGES)[number];

/** A deal counts as signed from Agreement onward. Signed value and collected cash are tracked separately. */
export const isSigned = (s: Stage) => STAGES.indexOf(s) >= STAGES.indexOf("Agreement");

export type DealTask = { id: string; title: string; owner: "Athlete" | "WRTH team" | "Sponsor"; due: string; done: boolean };

export type Deal = {
  id: string;
  sponsor: string;
  athleteSlug: string;
  packageName: string;
  amount: number;
  stage: Stage;
  collected: number;
  athleteApproval: "pending" | "approved" | "changes-requested";
  owner: string;
  nextAction: string;
  followUp: string;
  tasks: DealTask[];
};

export function dealTotals(deals: Deal[]) {
  const open = deals.filter((d) => !isSigned(d.stage));
  const signed = deals.filter((d) => isSigned(d.stage));
  return {
    pipeline: open.reduce((s, d) => s + d.amount, 0),
    signed: signed.reduce((s, d) => s + d.amount, 0),
    collected: deals.reduce((s, d) => s + d.collected, 0),
    openCount: open.length,
    signedCount: signed.length,
  };
}

// Sample sponsor opportunities (fictional). Used to seed both the browser store and the Supabase demo_deals table.
export const seedDeals: Deal[] = [
  {
    id: "d-brightpath", sponsor: "BrightPath Family Wellness", athleteSlug: "avery", packageName: "Impact Routine", amount: 15000,
    stage: "Campaign", collected: 7500, athleteApproval: "approved", owner: "WRTH partnerships", nextAction: "Collect second installment after meet night", followUp: "Nov 22",
    tasks: [
      { id: "t1", title: "Record 45s story video", owner: "Athlete", due: "Nov 4", done: true },
      { id: "t2", title: "Approve social creative", owner: "Athlete", due: "Nov 6", done: false },
      { id: "t3", title: "Publish QR campaign page", owner: "WRTH team", due: "Nov 6", done: true },
      { id: "t4", title: "Send sponsor offer artwork", owner: "Sponsor", due: "Nov 8", done: false },
      { id: "t5", title: "Meet-night activation", owner: "WRTH team", due: "Nov 21", done: false },
      { id: "t6", title: "Submit NIL deal disclosure for review", owner: "WRTH team", due: "Nov 7", done: false },
    ],
  },
  {
    id: "d-arches", sponsor: "Little Arches Pediatrics", athleteSlug: "camie", packageName: "Impact Routine", amount: 15000,
    stage: "Meeting", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Send proposal draft after Thursday's meeting", followUp: "Nov 7",
    tasks: [
      { id: "t1", title: "Confirm adaptive clinic date", owner: "Athlete", due: "Nov 10", done: false },
      { id: "t2", title: "Draft proposal", owner: "WRTH team", due: "Nov 8", done: false },
    ],
  },
  {
    id: "d-canyon", sponsor: "Canyon Byte Learning Lab", athleteSlug: "clara", packageName: "Community Spark", amount: 5000,
    stage: "Proposal", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Follow up on proposal", followUp: "Nov 9",
    tasks: [
      { id: "t1", title: "Review Flip Science proposal", owner: "Athlete", due: "Nov 8", done: false },
      { id: "t2", title: "Share classroom visit dates", owner: "Sponsor", due: "Nov 12", done: false },
    ],
  },
  {
    id: "d-wasatch", sponsor: "Wasatch Peak Credit Union", athleteSlug: "ella", packageName: "Red Rocks Partner", amount: 30000,
    stage: "Contacted", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Book intro meeting with marketing lead", followUp: "Nov 11",
    tasks: [{ id: "t1", title: "Prepare multi-athlete concept", owner: "WRTH team", due: "Nov 11", done: false }],
  },
];

/** Row shape of public.demo_deals (see supabase/migrations/202611040007_add_demo_deals.sql). */
export type DealRow = {
  id: string;
  sponsor: string;
  athlete_slug: string;
  package_name: string;
  amount: number | string;
  stage: Stage;
  collected: number | string;
  athlete_approval: Deal["athleteApproval"];
  owner: string;
  next_action: string;
  follow_up: string;
  tasks: DealTask[];
  sort_order: number;
};

export const fromDealRow = (r: DealRow): Deal => ({
  id: r.id,
  sponsor: r.sponsor,
  athleteSlug: r.athlete_slug,
  packageName: r.package_name,
  amount: Number(r.amount),
  stage: r.stage,
  collected: Number(r.collected),
  athleteApproval: r.athlete_approval,
  owner: r.owner,
  nextAction: r.next_action,
  followUp: r.follow_up,
  tasks: Array.isArray(r.tasks) ? r.tasks : [],
});

export const toDealRow = (d: Deal, sortOrder: number): DealRow => ({
  id: d.id,
  sponsor: d.sponsor,
  athlete_slug: d.athleteSlug,
  package_name: d.packageName,
  amount: d.amount,
  stage: d.stage,
  collected: d.collected,
  athlete_approval: d.athleteApproval,
  owner: d.owner,
  next_action: d.nextAction,
  follow_up: d.followUp,
  tasks: d.tasks,
  sort_order: sortOrder,
});
