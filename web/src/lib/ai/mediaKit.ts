import { audienceLabels, campaignTypeLabels, causeLabels, compact, usd } from "../labels";
import { rankCategories } from "../sponsors";
import type { Athlete } from "../types";

export type MediaKitRequest = {
  athleteSlug: string;
  transcript: string;
  interests: string;
  preferences: string[];
};

export const MEDIA_KIT_SECTIONS = [
  "Sponsor-ready bio",
  "Sponsor pitch",
  "Audience snapshot",
  "Best-fit brand categories",
  "Content ideas",
  "Recommended package",
] as const;

export const MEDIA_KIT_SYSTEM = `You build sponsor-ready media kits for Red Rocks gymnasts on Rock the Routine, a platform run with Who Rocks the House (WRTH), the NIL collective for Utah Red Rocks gymnastics.

The athlete reviews and approves every word before a sponsor sees it, so write in a way she would be proud to sign: warm, specific, confident, never hype. Her own words from the Story Seed transcript are the most important input; let her voice come through.

Ground every claim in the data provided. Use only the numbers given (reach, engagement rate, Utah audience share, minimum budget) and only the approved data the athlete supplied. Do not invent statistics, past sponsors, results, awards, or guarantees. If something useful is not provided, leave it out rather than guessing.

Output plain text using exactly these section headings, each on its own line prefixed with "## ", in this order:
${MEDIA_KIT_SECTIONS.map((s) => `## ${s}`).join("\n")}

Section guidance:
- Sponsor-ready bio: 3-4 sentences in third person.
- Sponsor pitch: 2 sentences a business owner would read first: who she reaches and why partnering with her builds trust.
- Audience snapshot: 3-4 lines starting with "- ", each one fact from the provided data.
- Best-fit brand categories: 3 lines starting with "- ", each "Category — one-sentence reason", using the ranked categories provided.
- Content ideas: 4 lines starting with "- ", concrete pieces of content she could make, in formats she prefers.
- Recommended package: one short paragraph naming one package and why.

No preamble, no closing remarks, no markdown other than the "## " headings and "- " list items.`;

export function mediaKitPrompt(a: Athlete, req: MediaKitRequest) {
  const top = rankCategories(a).slice(0, 3);
  const prefs = req.preferences.length ? req.preferences : a.campaignTypes;
  return `Athlete (approved profile data)
- Name: ${a.name}, ${a.classYear}, ${a.specialty}, from ${a.hometown}
- Causes: ${a.causes.map((c) => causeLabels[c]).join(", ")}
- Audiences: ${a.audiences.map((x) => audienceLabels[x]).join(", ")}
- Social reach: ${compact(a.reach)} on ${a.platforms.join(", ")}; engagement rate ${a.engagementRate}%; ${a.localAudiencePct}% of audience in Utah
- Minimum campaign budget: ${usd(a.budgetMin)}
- Highlights: ${a.pastWork.join("; ")}
- Interests she added: ${req.interests || "(none provided)"}
- Campaign formats she prefers: ${prefs.map((p) => campaignTypeLabels[p as keyof typeof campaignTypeLabels] ?? p).join(", ")}

Ranked sponsor categories (from the platform's fit model)
${top.map((t) => `- ${t.category.name} (${t.score}% fit): ${t.reasons.join("; ")}`).join("\n")}

Packages available: Community Spark $5,000; Impact Routine $15,000; Red Rocks Partner $30,000; Strategic Partner $200,000 (all proposed package concepts, not confirmed market rates).

Story Seed transcript (her own words)
"${req.transcript || a.storyTranscript}"

Build the media kit.`;
}

export function sampleMediaKit(a: Athlete, req: MediaKitRequest) {
  const top = rankCategories(a).slice(0, 3);
  const first = a.firstName;
  const pkg = a.budgetMin <= 5000 ? "Community Spark ($5,000)" : "Impact Routine ($15,000)";
  return `## Sponsor-ready bio
${a.name} is a ${a.classYear.toLowerCase()} ${a.specialty.toLowerCase()} gymnast for Utah Red Rocks from ${a.hometown}. ${a.bio}${req.interests.trim() ? ` Outside the gym, she’s into ${req.interests.trim().replace(/\.$/, "")}.` : ""}

## Sponsor pitch
${first} reaches ${compact(a.reach)} followers, ${a.localAudiencePct}% of them in Utah, with a ${a.engagementRate}% engagement rate. Partnering with her puts your brand next to a story Utah families already trust.

## Audience snapshot
- ${compact(a.reach)} followers across ${a.platforms.join(", ")}
- ${a.engagementRate}% engagement rate
- ${a.localAudiencePct}% of her audience lives in Utah
- Strongest with ${a.audiences.slice(0, 2).map((x) => audienceLabels[x].toLowerCase()).join(" and ")}

## Best-fit brand categories
${top.map((t) => `- ${t.category.name} — ${t.reasons[0].charAt(0).toUpperCase() + t.reasons[0].slice(1)}.`).join("\n")}

## Content ideas
- A 45-second Story Seed video on why ${causeLabels[a.causes[0]].toLowerCase()} matters to her
- A behind-the-routine Reel filmed at the Dumke Gymnastics Center
- A community-day photo recap with the sponsor's offer
- A meet-night QR moment fans can scan from the stands

## Recommended package
${pkg}. It fits her ${usd(a.budgetMin)} minimum and gives a sponsor a story video, social content and a measurable QR activation without overcommitting on a first partnership.`;
}
