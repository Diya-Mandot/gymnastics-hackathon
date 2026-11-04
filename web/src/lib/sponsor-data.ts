import type { Athlete } from "./types";

export const packageConcepts = [
  { id: "spark", name: "Community Spark", price: 5000, description: "A focused local story and offer.", deliverables: ["Athlete story", "One social post", "Sponsor mention", "QR landing page"] },
  { id: "routine", name: "Impact Routine", price: 15000, description: "A complete athlete-led campaign with measurable activation.", deliverables: ["45-second Story Seed", "Social creative kit", "Meet-night QR activation", "Sponsor offer", "Impact report"] },
  { id: "major", name: "Major Partner", price: 50000, description: "A multi-athlete seasonal community platform.", deliverables: ["Multi-athlete campaign", "Community event", "Season content series", "Quarterly results review"] },
  { id: "strategic", name: "Strategic Partner", price: 200000, description: "A season-long platform partnership concept.", deliverables: ["Team-wide platform", "Multiple activations", "Custom creative program", "Season impact report"] },
] as const;

export type PipelineStage = "Prospect" | "Qualified" | "Contacted" | "Meeting" | "Proposal" | "Negotiation" | "Agreement" | "Campaign" | "Renewal";
export const pipelineStages: PipelineStage[] = ["Prospect", "Qualified", "Contacted", "Meeting", "Proposal", "Negotiation", "Agreement", "Campaign", "Renewal"];

export type Opportunity = {
  id: string;
  business: string;
  category: string;
  location: string;
  owner: string;
  athleteSlug: string;
  amount: number;
  stage: PipelineStage;
  nextAction: string;
  followUp: string;
  agreement: "Not started" | "Draft" | "Signed";
  collected: number;
};

export const initialOpportunities: Opportunity[] = [
  { id: "opp-brightpath", business: "BrightPath Family Wellness", category: "Family wellness", location: "Salt Lake City", owner: "WRTH partnerships", athleteSlug: "avery", amount: 15000, stage: "Proposal", nextAction: "Review $15K proposal", followUp: "Nov 5", agreement: "Draft", collected: 0 },
  { id: "opp-summit", business: "Summit Smiles Dental", category: "Family dental", location: "Salt Lake City", owner: "WRTH partnerships", athleteSlug: "mia", amount: 5000, stage: "Qualified", nextAction: "Confirm community-fit call", followUp: "Nov 7", agreement: "Not started", collected: 0 },
  { id: "opp-wasatch", business: "Wasatch Peak Credit Union", category: "Financial services", location: "Utah", owner: "WRTH partnerships", athleteSlug: "jordan", amount: 50000, stage: "Agreement", nextAction: "Confirm signature and kickoff", followUp: "Nov 10", agreement: "Signed", collected: 25000 },
];

export const scoutBusinesses = [
  { id: "brightpath", name: "BrightPath Family Wellness", category: "Family wellness", location: "Salt Lake City", objective: "Build local trust with Utah families", warm: "WRTH board introduction", notes: "Strong youth-confidence and family audience fit." },
  { id: "summit", name: "Summit Smiles Dental", category: "Family dental", location: "Salt Lake City", objective: "Generate family appointment leads", warm: "No current relationship", notes: "Meet-night offer and parent audience are relevant." },
  { id: "canyon", name: "Canyon Byte Learning Lab", category: "STEM education", location: "Utah", objective: "Reach middle-school students and parents", warm: "Alumni referral", notes: "Strong education/STEM alignment; classroom activation possible." },
] as const;

export function businessMatches(businessId: string, athletes: Athlete[]) {
  const terms = businessId === "canyon" ? ["education-stem", "students"] : businessId === "summit" ? ["utah-families", "parents"] : ["youth-confidence", "utah-families"];
  return [...athletes].sort((a, b) => {
    const score = (x: Athlete) => x.causes.includes(terms[0] as never) || x.audiences.includes(terms[1] as never) ? 1 : 0;
    return score(b) - score(a);
  }).slice(0, 3);
}

export function reverseTargets(athlete: Athlete) {
  const primary = athlete.causes[0];
  if (primary === "education-stem") return ["Canyon Byte Learning Lab", "Utah Tech Camp", "Mountain State Credit Union"];
  if (primary === "inclusion") return ["Summit Smiles Dental", "Wasatch Adaptive Sports", "Neighborhood Health"];
  if (primary === "wellness") return ["BrightPath Family Wellness", "Wasatch Peak Credit Union", "Utah Family Grocer"];
  return ["BrightPath Family Wellness", "Summit Smiles Dental", "Wasatch Peak Credit Union"];
}
