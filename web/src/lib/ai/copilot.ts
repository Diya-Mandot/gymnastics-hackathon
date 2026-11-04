import { isSigned, type Deal } from "../dealModel";
import { usd } from "../labels";
import type { Athlete } from "../types";

export type CopilotRequest = { athleteSlug: string; deal: Deal };

export const COPILOT_SECTIONS = ["Deal summary", "What’s blocking", "Next actions", "Draft follow-up", "Compliance reminders"] as const;

export const COPILOT_SYSTEM = `You are the operations copilot for Who Rocks the House (WRTH), the NIL collective for Utah Red Rocks gymnastics. You help a small staff run sponsor deals for athletes without dropping deadlines.

You prepare the next human action. You never send anything, never approve anything on the athlete's behalf, and never claim a deal is compliant: NIL disclosure and compliance review are always a human decision. Treat a signed agreement as a commitment and collected money as cash actually received; never blur the two.

Use only the deal record you are given. Do not invent dates, amounts, contacts, or history.

Output plain text using exactly these section headings, each on its own line prefixed with "## ", in this order:
${COPILOT_SECTIONS.map((s) => `## ${s}`).join("\n")}

Section guidance:
- Deal summary: 2 sentences: who, what, stage, signed versus collected.
- What’s blocking: 1-3 lines starting with "- ".
- Next actions: 3-5 lines starting with "- ", each "Action — owner — when", owners being the athlete, the WRTH manager, or the sponsor.
- Draft follow-up: a short message (under 90 words) from the WRTH manager to the sponsor, starting with "Subject:". It is a draft; it will not be sent automatically.
- Compliance reminders: 1-3 lines starting with "- ".

No preamble, no closing remarks, no markdown other than the "## " headings and "- " list items.`;

export function copilotPrompt(a: Athlete, d: Deal) {
  const open = d.tasks.filter((t) => !t.done);
  return `Deal record
- Sponsor: ${d.sponsor} (fictional)
- Athlete: ${a.name}
- Package: ${d.packageName}, ${usd(d.amount)}
- Stage: ${d.stage} (${isSigned(d.stage) ? "signed" : "not yet signed"})
- Collected so far: ${usd(d.collected)}
- Athlete approval: ${d.athleteApproval}
- Relationship owner: ${d.owner}
- Recorded next action: ${d.nextAction} (follow up ${d.followUp})
- Open tasks: ${open.length ? open.map((t) => `${t.title} (${t.owner}, due ${t.due})`).join("; ") : "none"}
- Completed tasks: ${d.tasks.filter((t) => t.done).map((t) => t.title).join("; ") || "none"}

Prepare the next human actions.`;
}

export function sampleCopilot(a: Athlete, d: Deal) {
  const signed = isSigned(d.stage);
  const open = d.tasks.filter((t) => !t.done);
  const first = a.firstName;
  return `## Deal summary
${d.sponsor} and ${first} are at ${d.stage} on a ${usd(d.amount)} ${d.packageName}. ${signed ? `The agreement is signed and ${usd(d.collected)} of ${usd(d.amount)} has been collected.` : "Nothing is signed or collected yet."}

## What’s blocking
${[
  d.athleteApproval !== "approved" ? `- ${first} hasn’t approved the partnership yet` : null,
  ...open.slice(0, 2).map((t) => `- ${t.title} is still open (${t.owner}, due ${t.due})`),
]
  .filter(Boolean)
  .join("\n") || "- Nothing blocking right now"}

## Next actions
${[
  d.athleteApproval !== "approved" ? `- Ask ${first} to review and approve the partnership — athlete — this week` : null,
  `- ${d.nextAction} — WRTH manager — ${d.followUp}`,
  ...open.slice(0, 2).map((t) => `- ${t.title} — ${t.owner === "Athlete" ? "athlete" : t.owner === "Sponsor" ? "sponsor" : "WRTH manager"} — ${t.due}`),
  signed && d.collected < d.amount ? `- Confirm the ${usd(d.amount - d.collected)} still outstanding — WRTH manager — next invoice date` : null,
]
  .filter(Boolean)
  .join("\n")}

## Draft follow-up
Subject: Next steps on ${first}’s ${d.packageName}

Hi there,

Thanks again for partnering with Red Rocks gymnast ${first}. We’re ready for the next step: ${d.nextAction.charAt(0).toLowerCase() + d.nextAction.slice(1)}. Could you confirm a time before ${d.followUp}?

The Who Rocks the House team

## Compliance reminders
- Log the deal for NIL disclosure review before any public post
- ${first} approves all public content; nothing goes live automatically`;
}
