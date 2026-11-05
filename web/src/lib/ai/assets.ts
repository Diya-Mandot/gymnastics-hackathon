import type { Athlete } from "../types";

// Copy for four Adobe-ready design files. Claude writes the words; the app lays them out as SVG,
// so the text stays editable when the file is opened in Adobe Illustrator or Adobe Express.

export type AssetCopy = {
  post: { kicker: string; headline: string; body: string; cta: string };
  story: { kicker: string; headline: string; body: string; cta: string };
  poster: { headline: string; body: string; cta: string };
  card: { title: string; stat: string; statLabel: string; line: string };
  altText: string;
};

export type AssetRequest = { athleteSlug: string; campaign: string; sponsor: string; tone: string };

export const ASSET_SYSTEM = `You write short, punchy copy for Red Rocks gymnastics NIL campaign graphics made in Adobe.
Rules: plain words, no emoji, no hashtags, no made-up statistics, never claim a payment, signature or result happened.
Headlines are at most 6 words. Body lines are at most 22 words. Calls to action are at most 4 words.
The athlete must approve every asset before it is published.`;

export function assetPrompt(a: Athlete, r: AssetRequest) {
  return `Athlete: ${a.name} (${a.specialty}). Tagline: "${a.tagline}". Quote: "${a.quote}".
Campaign: ${r.campaign}. Sponsor: ${r.sponsor || "none yet"}. Tone: ${r.tone || "warm and confident"}.
Write copy for: a 1080x1080 Instagram post, a 1080x1920 Instagram story, a meet-night QR poster (letter size; the QR code is added by the app), and the back of a digital trading card (one real stat label from the athlete's specialty, no invented numbers: use "${a.classYear}" or her reach if you need a number). Also write one sentence of alt text describing the post for screen readers.`;
}

const line = { type: "string" } as const;
const block = (keys: string[]) => ({
  type: "object",
  properties: Object.fromEntries(keys.map((k) => [k, line])),
  required: keys,
  additionalProperties: false,
});

export const assetSchema = {
  type: "object",
  properties: {
    post: block(["kicker", "headline", "body", "cta"]),
    story: block(["kicker", "headline", "body", "cta"]),
    poster: block(["headline", "body", "cta"]),
    card: block(["title", "stat", "statLabel", "line"]),
    altText: line,
  },
  required: ["post", "story", "poster", "card", "altText"],
  additionalProperties: false,
};

/** Offline copy, used when no API key is set. Clearly labelled in the UI. */
export function sampleAssets(a: Athlete, r: AssetRequest): AssetCopy {
  const sponsor = r.sponsor ? ` with ${r.sponsor}` : "";
  return {
    post: { kicker: r.campaign, headline: "Confidence starts here.", body: `${a.firstName} is turning meet nights into moments young fans remember${sponsor}.`, cta: "Scan to join" },
    story: { kicker: `${a.firstName} · Red Rocks`, headline: "Every routine ends. Its impact shouldn’t.", body: `Back ${a.firstName}’s community campaign and see where it goes.`, cta: "Back the routine" },
    poster: { headline: `Back ${a.firstName} tonight.`, body: `Scan the code to support ${a.firstName}’s ${r.campaign} campaign${sponsor}. Every gift is tracked to the community it reaches.`, cta: "Scan to support" },
    card: { title: a.name, stat: a.classYear, statLabel: "Class", line: a.tagline },
    altText: `${a.name} of Red Rocks gymnastics mid-routine, with the words "Confidence starts here."`,
  };
}
