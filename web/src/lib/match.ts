import { audienceLabels, campaignTypeLabels, causeLabels, lower, sentenceTail, usd } from "./labels";
import { sponsorPackages } from "./seed";
import type { Athlete, Audience, CampaignType, Cause, SponsorPackage } from "./types";

export type SponsorBrief = {
  goal: string;
  audience: Audience;
  cause: Cause;
  format: CampaignType;
  budget: number;
  scope: "one" | "group" | "team";
};

export const defaultBrief: SponsorBrief = {
  goal: "Reach Utah families and build local trust",
  audience: "utah-families",
  cause: "youth-confidence",
  format: "community-event",
  budget: 15000,
  scope: "one",
};

// Weights from the Final Plan: cause 35, audience 25, format 20, budget 10, availability 10.
export const WEIGHTS = { cause: 35, audience: 25, format: 20, budget: 10, availability: 10 } as const;

const relatedCauses: Partial<Record<Cause, Cause[]>> = {
  "youth-confidence": ["mentorship", "mental-health", "wellness", "inclusion"],
  mentorship: ["youth-confidence", "education-stem"],
  inclusion: ["youth-confidence", "family"],
  "education-stem": ["mentorship"],
  wellness: ["mental-health", "family", "youth-confidence"],
  family: ["wellness"],
  "mental-health": ["wellness", "youth-confidence"],
};

const relatedAudiences: Partial<Record<Audience, Audience[]>> = {
  "utah-families": ["parents", "young-athletes"],
  parents: ["utah-families"],
  "young-athletes": ["utah-families", "students"],
  students: ["young-athletes"],
};

const IN_PERSON_FORMATS: CampaignType[] = ["community-event", "meet-night", "in-person"];

export type ScoreBreakdown = Record<keyof typeof WEIGHTS, number>;

export type MatchResult = {
  athlete: Athlete;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  explanation: string;
  recommended: SponsorPackage;
};

function causeFit(a: Athlete, cause: Cause) {
  const i = a.causes.indexOf(cause);
  if (i === 0) return 1;
  if (i === 1) return 0.85;
  if (i > 1) return 0.75;
  return a.causes.some((c) => relatedCauses[cause]?.includes(c)) ? 0.45 : 0.1;
}

function audienceFit(a: Athlete, audience: Audience) {
  const i = a.audiences.indexOf(audience);
  if (i >= 0) return Math.max(0.55, 1 - 0.15 * i);
  return a.audiences.some((x) => relatedAudiences[audience]?.includes(x)) ? 0.4 : 0.1;
}

function formatFit(a: Athlete, format: CampaignType) {
  const i = a.campaignTypes.indexOf(format);
  const base = i >= 0 ? Math.max(0.7, 1 - 0.1 * i) : 0.3;
  return IN_PERSON_FORMATS.includes(format) && !a.inPerson ? base * 0.5 : base;
}

function availabilityFit(a: Athlete) {
  if (a.daysUntilAvailable <= 14) return 1;
  if (a.daysUntilAvailable <= 30) return 0.8;
  if (a.daysUntilAvailable <= 60) return 0.6;
  return 0.4;
}

export function recommendPackage(brief: Pick<SponsorBrief, "budget" | "scope">): SponsorPackage {
  if (brief.scope === "team" || brief.budget >= 30000) return sponsorPackages[2];
  if (brief.budget >= 15000) return sponsorPackages[1];
  return sponsorPackages[0];
}

export function scoreAthlete(a: Athlete, brief: SponsorBrief): MatchResult {
  const fits = {
    cause: causeFit(a, brief.cause),
    audience: audienceFit(a, brief.audience),
    format: formatFit(a, brief.format),
    budget: Math.min(1, brief.budget / a.budgetMin),
    availability: availabilityFit(a),
  };
  const breakdown = Object.fromEntries(
    (Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((k) => [k, fits[k] * WEIGHTS[k]]),
  ) as ScoreBreakdown;
  const score = Math.round(Object.values(breakdown).reduce((s, v) => s + v, 0));

  const reasons: string[] = [];
  if (fits.cause >= 0.75) reasons.push(`cares about ${lower(causeLabels[brief.cause])}`);
  else if (fits.cause >= 0.45) reasons.push(`works on causes close to ${lower(causeLabels[brief.cause])}`);
  if (fits.audience >= 0.7) reasons.push(`has a strong ${lower(audienceLabels[brief.audience])} audience fit`);
  if (fits.format >= 0.8)
    reasons.push(
      IN_PERSON_FORMATS.includes(brief.format)
        ? `is available for an in-person ${lower(campaignTypeLabels[brief.format])}`
        : `creates great ${lower(campaignTypeLabels[brief.format])} content`,
    );
  if (fits.budget === 1) reasons.push(`fits your ${usd(brief.budget)} campaign budget`);

  const list =
    reasons.length > 1 ? `${reasons.slice(0, -1).join(", ")}, and ${reasons.at(-1)}` : (reasons[0] ?? "brings a unique story");
  const explanation = `${a.firstName} is a ${score >= 85 ? "strong" : "good"} match because she ${list}. She ${sentenceTail(a.tagline)}`;

  return { athlete: a, score, breakdown, reasons, explanation, recommended: recommendPackage(brief) };
}

export function topMatches(all: Athlete[], brief: SponsorBrief, n = 3) {
  return all.map((a) => scoreAthlete(a, brief)).sort((x, y) => y.score - x.score).slice(0, n);
}
