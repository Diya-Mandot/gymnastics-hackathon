import type {
  Athlete,
  Campaign,
  Donation,
  FanAction,
  SponsorPackage,
  SupporterTier,
  Task,
} from "./types";

// All athletes, sponsors and supporters below are fictional demo data.

export const athletes: Athlete[] = [
  {
    id: "ath-avery",
    slug: "avery",
    photo: "/images/gymnast-floor-1.jpg",
    photoFocus: "48% 30%",
    name: "Avery Davis",
    firstName: "Avery",
    specialty: "Floor & Beam",
    classYear: "Junior",
    hometown: "Sandy, Utah",
    featureType: "fan-favorite",
    tagline: "Coaches a Saturday tumbling clinic for 8–12 year olds.",
    quote: "Gymnastics taught me confidence. Mentoring younger girls taught me why it matters.",
    bio: "Avery grew up two exits from the Huntsman Center and still remembers the first Red Rocks athlete who learned her name. Today she spends Saturdays mentoring young gymnasts and speaks at Utah schools about confidence, nerves, and getting back on the beam after a fall.",
    causes: ["youth-confidence", "mentorship"],
    audiences: ["young-athletes", "utah-families"],
    campaignTypes: ["video", "community-event", "social", "meet-night"],
    platforms: ["instagram", "tiktok"],
    reach: 48200,
    engagementRate: 7.2,
    localAudiencePct: 71,
    communityScore: 96,
    budgetMin: 8000,
    daysUntilAvailable: 7,
    inPerson: true,
    palette: ["#251a18", "#ff4a3d"],
    storyTranscript:
      "The first time I fell off the beam in front of a crowd, I wanted to disappear. What got me back up was a coach who said, ‘You don't have to feel confident to act brave.’ Now I get to say that to girls who are where I was. Confidence isn't something you have. It's something you build, one routine at a time.",
    pastWork: [
      "Saturday tumbling clinic, 40+ young athletes this season",
      "Spoke at 6 Salt Lake County elementary schools",
      "Girls on the Run 5K pacer, spring 2026",
    ],
    contentExamples: ["45s story video", "Behind-the-routine Reel", "Clinic day photo set"],
    thankYou:
      "Thank you for supporting me. Outside of the gym, I care a lot about mentoring younger girls because I remember how much it mattered when someone believed in me.",
  },
  {
    id: "ath-mia",
    slug: "mia",
    photo: "/images/gymnast-beam.jpg",
    photoFocus: "50% 32%",
    name: "Mia Torres",
    firstName: "Mia",
    specialty: "Beam & Bars",
    classYear: "Sophomore",
    hometown: "West Valley City, Utah",
    featureType: "rising-routine",
    tagline: "Leads an adaptive gymnastics day with Unified Sports.",
    quote: "Every kid deserves to feel like they belong on the mat.",
    bio: "Mia is a first-generation college athlete who started a campus partnership bringing adaptive gymnastics to kids with disabilities. Her audience is smaller than some teammates', but they show up: her posts have the highest engagement on the roster.",
    causes: ["inclusion", "youth-confidence"],
    audiences: ["utah-families", "students"],
    campaignTypes: ["social", "video", "community-event"],
    platforms: ["instagram", "tiktok", "youtube"],
    reach: 14300,
    engagementRate: 9.4,
    localAudiencePct: 78,
    communityScore: 93,
    budgetMin: 6000,
    daysUntilAvailable: 21,
    inPerson: true,
    palette: ["#2e1715", "#ff8f85"],
    storyTranscript:
      "My little cousin uses a wheelchair, and she's the biggest gymnastics fan I know. I want her to see a space where she belongs.",
    pastWork: ["Adaptive gymnastics day pilot, 22 kids", "Bilingual meet-day guide for families"],
    contentExamples: ["Bilingual Reel series", "Adaptive clinic recap", "Family Q&A live"],
    thankYou:
      "Thank you for backing me. Every dollar helps me open the gym to kids who've never been told they belong there.",
  },
  {
    id: "ath-sofia",
    slug: "sofia",
    photo: "/images/gymnast-floor-2.jpg",
    photoFocus: "45% 28%",
    name: "Sofia Patel",
    firstName: "Sofia",
    specialty: "Floor & Bars",
    classYear: "Senior",
    hometown: "Logan, Utah",
    featureType: "rising-routine",
    tagline: "Teaches middle schoolers the physics of a flip.",
    quote: "A giant swing is just physics with a lot of chalk.",
    bio: "Sofia studies biomedical engineering and runs ‘Flip Science’, a classroom program that uses gymnastics to teach middle schoolers momentum, rotation, and why girls belong in STEM.",
    causes: ["education-stem", "youth-confidence"],
    audiences: ["students", "young-athletes", "utah-families"],
    campaignTypes: ["community-event", "video"],
    platforms: ["instagram", "youtube"],
    reach: 11100,
    engagementRate: 8.1,
    localAudiencePct: 74,
    communityScore: 90,
    budgetMin: 5000,
    daysUntilAvailable: 25,
    inPerson: true,
    palette: ["#1f1f21", "#f3efe8"],
    storyTranscript:
      "I almost didn't take my first engineering class because I didn't think I was a ‘math person’. Turns out I'd been doing the math on the bars my whole life.",
    pastWork: ["Flip Science, 9 classroom visits", "Women in STEM panel speaker"],
    contentExamples: ["Slow-mo physics breakdowns", "Classroom visit recap", "Study-day vlog"],
    thankYou:
      "Thank you! Your support helps me bring Flip Science to more classrooms across Utah.",
  },
  {
    id: "ath-jordan",
    slug: "jordan",
    photo: "/images/gymnast-floor-3.jpg",
    photoFocus: "50% 24%",
    name: "Jordan Lee",
    firstName: "Jordan",
    specialty: "All-Around",
    classYear: "Senior",
    hometown: "St. George, Utah",
    featureType: "fan-favorite",
    tagline: "Talks openly about recovery, rest, and family meals.",
    quote: "Strong is a whole-family sport.",
    bio: "Jordan is one of the most recognized names on the roster and a voice for athlete wellness, rest, and mental health. She partners with her family on simple home-cooking content that Utah parents love.",
    causes: ["wellness", "family", "mental-health"],
    audiences: ["utah-families", "parents", "young-professionals"],
    campaignTypes: ["social", "video"],
    platforms: ["instagram", "tiktok", "youtube"],
    reach: 62400,
    engagementRate: 4.8,
    localAudiencePct: 64,
    communityScore: 84,
    budgetMin: 12000,
    daysUntilAvailable: 5,
    inPerson: true,
    palette: ["#2a2420", "#ff4a3d"],
    storyTranscript:
      "I used to think rest was weakness. Learning to recover made me a better athlete and a better sister.",
    pastWork: ["Family wellness week with a Utah grocer", "Mental-health awareness meet night"],
    contentExamples: ["Family recipe Reels", "Recovery-day routines", "Meet-day vlog"],
    thankYou: "Thank you for supporting me and the full roster. It means the world to my family and me.",
  },
];

export const athleteBySlug = (slug: string) => athletes.find((a) => a.slug === slug);

export const seedCampaign: Campaign = {
  id: "cmp-confidence",
  slug: "confidence-starts-here",
  name: "Confidence Starts Here",
  athleteSlug: "avery",
  sponsorName: "BrightPath Family Wellness",
  partner: "Girls on the Run Utah",
  goal: 15000,
  raised: 8240,
  supporters: 186,
  businessFunding: 6500,
  fanContributions: 1740,
  supports: [
    "Athlete-led youth confidence event",
    "Athlete story and fan campaign",
    "Girls on the Run community activation",
    "NIL opportunity for participating athletes",
  ],
};

const minutesAgo = (now: number, m: number) => new Date(now - m * 60_000).toISOString();

export function seedActivity(now = Date.now()): Donation[] {
  const rows: Array<[string, string, number, Donation["supportType"], number]> = [
    ["Kelsey M.", "avery", 25, "Monthly supporter", 4],
    ["The Nguyen Family", "avery", 100, "Impact Champion", 11],
    ["Ute Alum ’09", "mia", 10, "One-time supporter", 19],
    ["Coach Tanner", "sofia", 25, "Monthly supporter", 33],
    ["Brooke R.", "avery", 10, "One-time supporter", 47],
  ];
  return rows.map(([supporterName, slug, amount, supportType, m], i) => ({
    id: `seed-${i}`,
    createdAt: minutesAgo(now, m),
    supporterName,
    athleteSlug: slug,
    athleteName: athleteBySlug(slug)!.name,
    campaignName: seedCampaign.name,
    amount,
    supportType,
    thankYouPack: "Sent",
    status: "Received",
  }));
}

export function seedFanActions(now = Date.now()): FanAction[] {
  return [
    { id: "fa-1", createdAt: minutesAgo(now, 2), who: "Lily, age 9", action: "shared a confidence note for Avery" },
    { id: "fa-2", createdAt: minutesAgo(now, 8), who: "Marcus T.", action: "nominated his daughter’s coach" },
    { id: "fa-3", createdAt: minutesAgo(now, 15), who: "Section 14 fan", action: "scanned the meet-night QR" },
    { id: "fa-4", createdAt: minutesAgo(now, 26), who: "Jenna P.", action: "claimed the BrightPath family offer" },
  ];
}

export const tasks: Task[] = [
  { id: "t1", title: "Record athlete story", owner: "Avery Davis", due: "Nov 4", status: "done", approval: "approved" },
  { id: "t2", title: "Approve social creative", owner: "WRTH team", due: "Nov 6", status: "in-progress", approval: "pending" },
  { id: "t3", title: "Publish QR page", owner: "Diya", due: "Nov 6", status: "done", approval: "approved" },
  { id: "t4", title: "Schedule meet-night activation", owner: "WRTH team", due: "Nov 9", status: "in-progress", approval: "not-needed" },
  { id: "t5", title: "Share Instagram Reel", owner: "Avery Davis", due: "Nov 12", status: "todo", approval: "pending" },
  { id: "t6", title: "Complete birthday video request", owner: "Avery Davis", due: "Nov 14", status: "todo", approval: "not-needed" },
  { id: "t7", title: "Create campaign recap", owner: "Raghav", due: "Nov 20", status: "todo", approval: "pending" },
];

export const supporterTiers: SupporterTier[] = [
  { id: "free", name: "Red Rocks Fan", price: "Free", perks: ["Athlete stories", "Campaign updates", "QR activations", "Sponsor offers"] },
  { id: "chalk", name: "Chalk Circle", price: "$10/mo", perks: ["Digital thank-you card", "Athlete update video", "Early campaign access"] },
  { id: "partner", name: "Routine Partner", price: "$25/mo", perks: ["Personal athlete-life videos", "Family campaign offers", "Quarterly behind-the-scenes"] },
  { id: "champion", name: "Impact Champion", price: "$100+", perks: ["Athlete thank-you video request", "Digital impact report", "Campaign recognition"] },
];

export const sponsorPackages: SponsorPackage[] = [
  { id: "spark", name: "Community Spark", price: 5000, priceLabel: "$5,000", perks: ["Athlete story", "One social post", "Sponsor mention", "QR campaign page"] },
  { id: "routine", name: "Impact Routine", price: 15000, priceLabel: "$15,000", perks: ["Athlete story", "Social kit", "Meet-night QR activation", "Sponsor offer", "Final impact report"] },
  { id: "partner", name: "Red Rocks Partner", price: 50000, priceLabel: "$50,000", perks: ["Multi-athlete campaign", "Community event", "Campaign recap", "Season report"] },
  { id: "strategic", name: "Strategic Partner", price: 200000, priceLabel: "$200,000", perks: ["Season-long team partnership", "Meet-night presenting rights", "Athlete content series", "Quarterly impact reports", "Renewal planning"] },
];
