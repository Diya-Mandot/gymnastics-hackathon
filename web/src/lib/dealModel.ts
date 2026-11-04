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
