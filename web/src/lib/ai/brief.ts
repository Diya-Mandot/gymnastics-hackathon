import { audienceLabels, availabilityLabel, campaignTypeLabels, causeLabels, compact, usd } from "../labels";
import { scoreAthlete, type SponsorBrief } from "../match";
import { seedCampaign } from "../seed";
import type { Athlete, SponsorPackage } from "../types";

export type BriefRequest = {
  athleteSlug: string;
  packageId: string;
};

/** Sections the model must produce, in order. The UI splits the stream on these headings. */
export const BRIEF_SECTIONS = [
  "Campaign title",
  "Why this fits",
  "Social captions",
  "Content plan",
  "Task list",
  "Draft sponsor email",
] as const;

export const SYSTEM_PROMPT = `You draft NIL campaign briefs for Rock the Routine, a platform run with Who Rocks the House (WRTH), the NIL collective for Utah Red Rocks gymnastics. 100% of contributions support Utah gymnasts through WRTH and their participation in charitable, civic, educational, and community-focused activities.

Your draft is shown live to a business sponsor and then reviewed by the athlete, who approves every public output before anything is published. Write it so the athlete would be proud to sign off.

Ground every claim in the profile and brief you are given. Use only the numbers provided (reach, engagement, Utah audience share, budget); do not invent statistics, results, partners, or guarantees. Present outcomes as goals to measure, not promises. Write in the athlete's real voice where you quote her, drawing on her story transcript, and keep it warm, specific, and free of hype.

Output plain text using exactly these section headings, each on its own line prefixed with "## ", in this order:
${BRIEF_SECTIONS.map((s) => `## ${s}`).join("\n")}

Section guidance:
- Campaign title: one line, under 8 words.
- Why this fits: 2-3 sentences tying the athlete's cause, audience, and story to the sponsor's goal.
- Social captions: exactly 3 captions, each on its own line starting with "- ", under 220 characters, each ending with one or two relevant hashtags.
- Content plan: 4-5 lines starting with "- ", each a concrete deliverable with timing (e.g. "Week 1:").
- Task list: 5-6 lines starting with "- ", each "Task — owner", owners being the athlete, the sponsor, or the WRTH team.
- Draft sponsor email: a short email (under 150 words) from the WRTH team to the sponsor, starting with "Subject:" on the first line. Sign it "The Who Rocks the House team".

No preamble, no closing remarks, no markdown other than the "## " headings and "- " list items.`;

export function buildUserPrompt(athlete: Athlete, pkg: SponsorPackage, brief: SponsorBrief) {
  const fit = scoreAthlete(athlete, brief);
  return `Sponsor brief
- Sponsor: ${seedCampaign.sponsorName} (fictional Utah family wellness business)
- Goal: ${brief.goal}
- Audience: ${audienceLabels[brief.audience]}
- Cause: ${causeLabels[brief.cause]}
- Preferred format: ${campaignTypeLabels[brief.format]}
- Budget: ${usd(brief.budget)}
- Package: ${pkg.name} (${pkg.priceLabel}) — includes ${pkg.perks.join(", ")}
- Community partner: ${seedCampaign.partner}

Athlete profile
- Name: ${athlete.name}, ${athlete.classYear}, ${athlete.specialty}, from ${athlete.hometown}
- Group: ${athlete.featureType === "fan-favorite" ? "Fan Favorite" : "Rising Routine"}
- Causes: ${athlete.causes.map((c) => causeLabels[c]).join(", ")}
- Audiences: ${athlete.audiences.map((a) => audienceLabels[a]).join(", ")}
- Social reach: ${compact(athlete.reach)} on ${athlete.platforms.join(", ")}; engagement rate ${athlete.engagementRate}%; ${athlete.localAudiencePct}% of audience in Utah
- Availability: ${availabilityLabel(athlete.daysUntilAvailable)}${athlete.inPerson ? ", open to in-person appearances" : ""}
- Formats: ${athlete.campaignTypes.map((t) => campaignTypeLabels[t]).join(", ")}
- Bio: ${athlete.bio}
- Past community work: ${athlete.pastWork.join("; ")}
- Quote: "${athlete.quote}"

Story Seed transcript (her own words, 45-second video)
"${athlete.storyTranscript}"

Match score for this brief: ${fit.score}% (${fit.explanation})

Draft the campaign brief.`;
}

/** Deterministic offline brief, streamed when no API key is configured so the demo never breaks. */
export function sampleBrief(athlete: Athlete, pkg: SponsorPackage) {
  const first = athlete.firstName;
  const cause = causeLabels[athlete.causes[0]].toLowerCase();
  const article = /^[AEIOU]/.test(pkg.name) ? "an" : "a";
  const perks = pkg.perks.map((p) => (/^[A-Z][a-z]/.test(p) ? p.charAt(0).toLowerCase() + p.slice(1) : p)).join(", ");
  return `## Campaign title
${first}'s ${athlete.causes[0] === "youth-confidence" ? "Confidence Starts Here" : `${causeLabels[athlete.causes[0]]} Routine`}

## Why this fits
${first} has built her life outside the gym around ${cause}, and ${athlete.localAudiencePct}% of her ${compact(athlete.reach)} followers are in Utah. Her ${athlete.engagementRate}% engagement rate means families actually respond when she speaks, which is exactly the local trust ${seedCampaign.sponsorName} wants to earn.

## Social captions
- "${athlete.quote}" This season ${first} is teaming up with ${seedCampaign.sponsorName} to pay it forward. #RockTheRoutine
- Every routine ends. Its impact shouldn't. Scan the QR at Friday's meet to join ${first}'s campaign with ${seedCampaign.partner}. #RedRocks #RockTheRoutine
- Who believed in you first? Tell us below, and ${first} will read every note at our community event. #ConfidenceStartsHere

## Content plan
- Week 1: ${first}'s 45-second Story Seed video goes live on Instagram and TikTok
- Week 2: Social kit of three posts and a Reel cover, made in Adobe Express
- Week 3: Meet-night QR activation at the Huntsman Center with the sponsor offer
- Week 4: Community event with ${seedCampaign.partner} and a photo recap
- Week 6: Impact report for the sponsor with scans, offer claims, and attendance

## Task list
- Approve story video and captions — ${first}
- Confirm sponsor offer and logo files — ${seedCampaign.sponsorName}
- Publish QR campaign page — WRTH team
- Schedule meet-night activation — WRTH team
- Share Instagram Reel — ${first}
- Compile final impact report — WRTH team

## Draft sponsor email
Subject: ${article === "an" ? "An" : "A"} ${pkg.name} with ${first} for ${seedCampaign.sponsorName}

Hi there,

We'd love to pair ${seedCampaign.sponsorName} with Red Rocks gymnast ${first} for ${article} ${pkg.name} (${pkg.priceLabel}). ${first} leads on ${cause}, and most of her audience is right here in Utah. The package includes ${perks}.

Could we find 20 minutes next week to walk you through it?

The Who Rocks the House team`;
}
