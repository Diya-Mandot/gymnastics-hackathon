import { audienceLabels, campaignTypeLabels, causeLabels } from "./labels";
import type { Athlete, Audience, CampaignType, Cause } from "./types";

// Sponsor categories and sample businesses for reverse matching. All businesses are fictional.

export type SponsorCategory = {
  id: string;
  name: string;
  causes: Cause[];
  audiences: Audience[];
  formats: CampaignType[];
  typicalBudget: number;
  pitch: string;
};

export type SampleBusiness = {
  id: string;
  name: string;
  categoryId: string;
  location: string;
  objective: string;
  budget: number;
  warmContact: string | null;
  notes: string;
};

export const sponsorCategories: SponsorCategory[] = [
  { id: "family-health", name: "Family health & dental", causes: ["youth-confidence", "wellness", "family"], audiences: ["utah-families", "parents"], formats: ["community-event", "video"], typicalBudget: 15000, pitch: "wants trust with Utah parents choosing a provider" },
  { id: "pediatrics", name: "Pediatric care", causes: ["inclusion", "wellness", "youth-confidence"], audiences: ["utah-families", "parents", "young-athletes"], formats: ["community-event", "social"], typicalBudget: 15000, pitch: "serves kids and families across the Wasatch Front" },
  { id: "stem-learning", name: "STEM learning & tutoring", causes: ["education-stem", "mentorship"], audiences: ["students", "parents"], formats: ["community-event", "video"], typicalBudget: 5000, pitch: "needs credible role models for students" },
  { id: "youth-sports", name: "Youth sports & gyms", causes: ["youth-confidence", "mentorship"], audiences: ["young-athletes", "utah-families"], formats: ["community-event", "meet-night"], typicalBudget: 5000, pitch: "recruits young athletes and their parents" },
  { id: "banking", name: "Credit unions & banking", causes: ["family", "education-stem"], audiences: ["young-professionals", "students", "utah-families"], formats: ["social", "video"], typicalBudget: 50000, pitch: "competes for first accounts with students and young families" },
  { id: "grocery-wellness", name: "Grocery & healthy food", causes: ["wellness", "family", "mental-health"], audiences: ["utah-families", "parents"], formats: ["social", "video"], typicalBudget: 15000, pitch: "wants everyday family shoppers" },
];

export const sampleBusinesses: SampleBusiness[] = [
  { id: "b-brightpath", name: "BrightPath Family Wellness", categoryId: "family-health", location: "Salt Lake City, UT", objective: "Reach Utah families and build local trust", budget: 15000, warmContact: "WRTH board introduction", notes: "Strong youth-confidence and family audience fit." },
  { id: "b-smiles", name: "Summit Smiles Dental", categoryId: "family-health", location: "Salt Lake City, UT", objective: "Generate family appointment leads", budget: 5000, warmContact: null, notes: "Meet-night offer and parent audience are relevant." },
  { id: "b-arches", name: "Little Arches Pediatrics", categoryId: "pediatrics", location: "West Valley City, UT", objective: "Launch an inclusive kids' clinic day", budget: 15000, warmContact: null, notes: "Inclusion focus matches adaptive gymnastics work." },
  { id: "b-canyon", name: "Canyon Byte Learning Lab", categoryId: "stem-learning", location: "Logan, UT", objective: "Fill fall STEM camp enrollment", budget: 5000, warmContact: "Alumni referral", notes: "Strong education and STEM alignment; classroom activation possible." },
  { id: "b-wasatch", name: "Wasatch Peak Credit Union", categoryId: "banking", location: "Salt Lake City, UT", objective: "Open first accounts with U students", budget: 50000, warmContact: null, notes: "Large budget; multi-athlete family and student campaign." },
  { id: "b-tumble", name: "Red Ledge Tumbling Academy", categoryId: "youth-sports", location: "Draper, UT", objective: "Grow beginner class sign-ups", budget: 5000, warmContact: "Coach knows two Red Rocks alumnae", notes: "Young-athlete audience; clinic-day activation." },
  { id: "b-harvest", name: "Harvest Table Market", categoryId: "grocery-wellness", location: "St. George, UT", objective: "Promote family meal kits", budget: 15000, warmContact: null, notes: "Family wellness content and recipe Reels." },
];

export const categoryById = (id: string) => sponsorCategories.find((c) => c.id === id)!;

export type CategoryFit = {
  category: SponsorCategory;
  score: number;
  reasons: string[];
  businesses: SampleBusiness[];
};

// Fit between one athlete and one sponsor category. Cause 40, audience 35, format 15, budget 10.
export function categoryFit(a: Athlete, c: SponsorCategory): Omit<CategoryFit, "businesses"> {
  const causes = c.causes.filter((x) => a.causes.includes(x));
  const audiences = c.audiences.filter((x) => a.audiences.includes(x));
  const formats = c.formats.filter((x) => a.campaignTypes.includes(x));
  const budgetFits = a.budgetMin <= c.typicalBudget;
  const score = Math.round(
    40 * Math.min(1, causes.length / 1.5) +
      35 * Math.min(1, audiences.length / 1.5) +
      15 * Math.min(1, formats.length) +
      (budgetFits ? 10 : 0),
  );
  const reasons: string[] = [];
  if (causes.length) reasons.push(`shares her cause: ${causes.map((x) => causeLabels[x].toLowerCase()).join(", ")}`);
  if (audiences.length) reasons.push(`wants her audience: ${audiences.map((x) => audienceLabels[x]).join(", ")}`);
  if (formats.length) reasons.push(`buys formats she offers: ${formats.map((x) => campaignTypeLabels[x].toLowerCase()).join(", ")}`);
  reasons.push(budgetFits ? `typical budget covers her $${a.budgetMin.toLocaleString()} minimum` : `typical budget is below her minimum`);
  return { category: c, score, reasons };
}

// Reverse matching: athlete -> sponsor categories, best first.
export function rankCategories(a: Athlete): CategoryFit[] {
  return sponsorCategories
    .map((c) => ({ ...categoryFit(a, c), businesses: sampleBusinesses.filter((b) => b.categoryId === c.id) }))
    .sort((x, y) => y.score - x.score);
}

// Sponsor Scout: business -> athletes, best first, using the same fit model.
export function rankAthletesForBusiness(b: SampleBusiness, roster: Athlete[]) {
  const category = categoryById(b.categoryId);
  return roster.map((athlete) => ({ athlete, ...categoryFit(athlete, category) })).sort((x, y) => y.score - x.score);
}
