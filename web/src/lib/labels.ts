import type { Audience, CampaignType, Cause, FeatureType, Platform } from "./types";

export const causeLabels: Record<Cause, string> = {
  "youth-confidence": "Youth confidence",
  mentorship: "Mentorship",
  inclusion: "Inclusion",
  "education-stem": "Education & STEM",
  wellness: "Wellness",
  family: "Family",
  "mental-health": "Mental health",
};

export const audienceLabels: Record<Audience, string> = {
  "utah-families": "Utah families",
  "young-athletes": "Young athletes",
  students: "Students",
  parents: "Parents",
  alumni: "Ute alumni",
  "young-professionals": "Young professionals",
};

export const campaignTypeLabels: Record<CampaignType, string> = {
  "community-event": "Community event",
  video: "Story video",
  social: "Social campaign",
  "meet-night": "Meet-night activation",
  "in-person": "In-person appearance",
};

export const platformLabels: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export const featureTypeLabels: Record<FeatureType, string> = {
  "fan-favorite": "Fan Favorite",
  "rising-routine": "Rising Routine",
};

/** Lowercase for mid-sentence use while keeping proper nouns intact. */
export const lower = (s: string) =>
  s.toLowerCase().replace(/\butah\b/g, "Utah").replace(/\bute\b/g, "Ute").replace(/\bstem\b/g, "STEM");

/** "Coaches a clinic." -> "coaches a clinic." for "She coaches a clinic." */
export const sentenceTail = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const compact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function availabilityLabel(days: number) {
  if (days <= 7) return "Available this week";
  if (days <= 14) return "Available in 2 weeks";
  if (days <= 30) return "Available this month";
  return `Available in ${Math.round(days / 7)} weeks`;
}

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} hr ago`;
}
