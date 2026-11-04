export type Cause =
  | "youth-confidence"
  | "mentorship"
  | "inclusion"
  | "education-stem"
  | "wellness"
  | "family"
  | "mental-health";

export type Audience =
  | "utah-families"
  | "young-athletes"
  | "students"
  | "parents"
  | "alumni"
  | "young-professionals";

export type CampaignType = "community-event" | "video" | "social" | "meet-night" | "in-person";

export type Platform = "instagram" | "tiktok" | "youtube";

export type FeatureType = "fan-favorite" | "rising-routine";

export type Athlete = {
  id: string;
  slug: string;
  name: string;
  firstName: string;
  specialty: string;
  classYear: string;
  hometown: string;
  featureType: FeatureType;
  tagline: string;
  quote: string;
  bio: string;
  /** Ordered: first entry is the athlete's primary cause */
  causes: Cause[];
  /** Ordered: first entry is the strongest audience fit */
  audiences: Audience[];
  /** Ordered: first entry is the athlete's preferred format */
  campaignTypes: CampaignType[];
  platforms: Platform[];
  reach: number;
  engagementRate: number;
  localAudiencePct: number;
  communityScore: number;
  budgetMin: number;
  daysUntilAvailable: number;
  inPerson: boolean;
  /** [background, initials] for the monogram square until approved athlete art arrives */
  palette: [string, string];
  /** Real Red Rocks photo (organizer-approved). Name, story and stats remain demo content. */
  photo?: string;
  /** CSS object-position for the photo crop, e.g. "50% 30%" */
  photoFocus?: string;
  /** 45s Story Seed video, once creative delivers it */
  storyUrl?: string;
  storyTranscript: string;
  pastWork: string[];
  contentExamples: string[];
  thankYou: string;
};

export type Campaign = {
  id: string;
  slug: string;
  name: string;
  athleteSlug: string;
  sponsorName: string;
  partner: string;
  goal: number;
  raised: number;
  supporters: number;
  businessFunding: number;
  fanContributions: number;
  supports: string[];
};

export type SupportType = "One-time supporter" | "Monthly supporter" | "Impact Champion";

export type Donation = {
  id: string;
  createdAt: string;
  supporterName: string;
  athleteSlug: string;
  athleteName: string;
  campaignName: string;
  amount: number;
  supportType: SupportType;
  thankYouPack: "Sent" | "Queued";
  status: "Received";
};

export type FanAction = {
  id: string;
  createdAt: string;
  who: string;
  action: string;
};

export type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: "done" | "in-progress" | "todo";
  approval: "approved" | "pending" | "not-needed";
};

export type Prospect = {
  id: string;
  business: string;
  category: string;
  stage: "Researching" | "Drafted" | "Contacted" | "Proposal" | "Committed";
  budget: number;
  athleteSlug: string;
};

export type SupporterTier = {
  id: string;
  name: string;
  price: string;
  perks: string[];
};

export type SponsorPackage = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  perks: string[];
};

export type LiveState = {
  campaign: Campaign;
  activity: Donation[];
};
