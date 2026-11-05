import type {
  Athlete,
  Campaign,
  Donation,
  FanAction,
  SponsorPackage,
  SupporterTier,
  Task,
} from "./types";

// Athletes are real 2027 Red Rocks gymnasts (with their permission). Names, photos, class, hometown,
// bio facts and highlights come from utahutes.com. Causes, quotes, stories, reach and campaign numbers are
// sample content. Sponsors and supporters are fictional.

export const athletes: Athlete[] = [
  {
    id: "ath-avery",
    slug: "avery",
    photo: "/images/athletes/avery-neff.jpg",
    photoFocus: "50% 22%",
    name: "Avery Neff",
    firstName: "Avery",
    specialty: "All-Around",
    classYear: "Junior",
    hometown: "South Jordan, Utah",
    featureType: "fan-favorite",
    tagline: "2026 Big 12 Gymnast of the Year and team captain.",
    quote: "Every routine is for the kids in the stands who want to be out here one day.",
    bio: "Avery went to Bingham High School in South Jordan, about 20 minutes from the Huntsman Center. She’s an 11-time All-American with perfect 10s on vault and bars, the 2026 Big 12 Gymnast of the Year and a 2026 team captain.",
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
    storyTranscript: "Every time I salute the judges, I think about the young gymnasts in the stands. Confidence isn’t something you’re born with. You build it one routine at a time, and I want to help kids build theirs.",
    pastWork: ["11x All-American (six NCAA, five regular season)", "2026 Big 12 Gymnast of the Year", "2026 Corvallis Regional all-around champion", "2026 team captain"],
    contentExamples: ["45s story video", "Behind-the-routine Reel", "Clinic day photo set"],
    thankYou: "Thank you for supporting me. Helping young gymnasts believe in themselves is the part of this I care about most.",
  },
  {
    id: "ath-camie",
    slug: "camie",
    photo: "/images/athletes/camie-winger.jpg",
    photoFocus: "50% 22%",
    name: "Camie Winger",
    firstName: "Camie",
    specialty: "Beam & Vault",
    classYear: "Senior",
    hometown: "Orem, Utah",
    featureType: "rising-routine",
    tagline: "2026 Big 12 beam champion from Orem.",
    quote: "Beam is four inches wide, and it still taught me there’s room for everyone.",
    bio: "Camie went to Timpanogos High School in Orem. She’s a WCGA All-American on beam, the 2026 Big 12 beam champion, and has career highs of 9.90 or better on all four events, including a 9.975 on beam.",
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
    storyTranscript: "Beam is four inches wide, and it still taught me there’s room for everyone. I want every kid who walks into a gym to feel like they belong on the mat.",
    pastWork: ["WCGA All-American on beam", "2026 Big 12 beam champion", "Career-high 9.975 on beam at the 2026 Big 12 Championships", "Seven career event wins"],
    contentExamples: ["Bilingual Reel series", "Adaptive clinic recap", "Family Q&A live"],
    thankYou: "Thank you for backing me. Every dollar helps open the gym to kids who haven’t been told they belong there yet.",
  },
  {
    id: "ath-clara",
    slug: "clara",
    photo: "/images/athletes/clara-raposo.jpg",
    photoFocus: "50% 22%",
    name: "Clara Raposo",
    firstName: "Clara",
    specialty: "Bars & Vault",
    classYear: "Junior",
    hometown: "Toronto, Canada",
    featureType: "rising-routine",
    tagline: "Five-time Canadian National Team member.",
    quote: "A giant swing is just physics with a lot of chalk.",
    bio: "Clara came to Utah from Toronto after five years on the Canadian National Team, including the 2024 World Cup in Varna, Bulgaria. She was the 2024 Elite Canada bars champion and set a career-high 9.925 on bars in 2026.",
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
    storyTranscript: "Bars is momentum, rotation and timing. It’s physics you can feel. I want girls to see that the same brain that lands a release move belongs in a science class.",
    pastWork: ["Five-time Canadian National Team member", "Team Canada at the 2024 World Cup in Varna", "2024 Elite Canada bars champion", "Career-high 9.925 on bars (2026)"],
    contentExamples: ["Slow-mo physics breakdowns", "Classroom visit recap", "Study-day vlog"],
    thankYou: "Thank you! Your support helps bring gymnastics-and-science visits to more classrooms across Utah.",
  },
  {
    id: "ath-ella",
    slug: "ella",
    photo: "/images/athletes/ella-zirbes.jpg",
    photoFocus: "50% 22%",
    name: "Ella Zirbes",
    firstName: "Ella",
    specialty: "Vault, Bars & Floor",
    classYear: "Senior",
    hometown: "Stillwater, Minnesota",
    featureType: "fan-favorite",
    tagline: "Seven-time All-American who competed at the 2026 NCAA Championships.",
    quote: "Strong is a whole-family sport.",
    bio: "Ella went to Stillwater Area High School in Minnesota. She’s a seven-time All-American with 20 career wins, a career-high 9.975 on bars, and competed on floor at the 2026 NCAA Championships.",
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
    storyTranscript: "The more I learned about recovery, rest and eating well, the better I competed. Strong isn’t just what happens in the gym. It’s a whole-family thing.",
    pastWork: ["7x All-American (four NCAA, three regular season)", "20 career wins", "Competed on floor at the 2026 NCAA Championships", "2026 All-Big 12 Team (vault, bars, floor)"],
    contentExamples: ["Family recipe Reels", "Recovery-day routines", "Meet-day vlog"],
    thankYou: "Thank you for supporting me and the whole team. It means the world to me and my family.",
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
    ["Ute Alum ’09", "camie", 10, "One-time supporter", 19],
    ["Coach Tanner", "clara", 25, "Monthly supporter", 33],
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
  { id: "t1", title: "Record athlete story", owner: "Avery Neff", due: "Nov 4", status: "done", approval: "approved" },
  { id: "t2", title: "Approve social creative", owner: "WRTH team", due: "Nov 6", status: "in-progress", approval: "pending" },
  { id: "t3", title: "Publish QR page", owner: "Diya", due: "Nov 6", status: "done", approval: "approved" },
  { id: "t4", title: "Schedule meet-night activation", owner: "WRTH team", due: "Nov 9", status: "in-progress", approval: "not-needed" },
  { id: "t5", title: "Share Instagram Reel", owner: "Avery Neff", due: "Nov 12", status: "todo", approval: "pending" },
  { id: "t6", title: "Complete birthday video request", owner: "Avery Neff", due: "Nov 14", status: "todo", approval: "not-needed" },
  { id: "t7", title: "Create campaign recap", owner: "Raghav", due: "Nov 20", status: "todo", approval: "pending" },
];

export const supporterTiers: SupporterTier[] = [
  { id: "free", name: "Red Rocks Fan", price: "Free", perks: ["Athlete stories", "Campaign updates", "QR activations", "Sponsor offers"] },
  { id: "chalk", name: "Chalk Circle", price: "$10/mo", perks: ["Digital thank-you card", "Athlete update video", "Early campaign access", "Unlocks fan experiences month by month"] },
  { id: "partner", name: "Routine Partner", price: "$25/mo", perks: ["Personal athlete-life videos", "Family campaign offers", "Quarterly behind-the-scenes", "Unlocks fan experiences month by month"] },
  { id: "champion", name: "Impact Champion", price: "$100+", perks: ["Athlete thank-you video request", "Digital impact report", "Campaign recognition"] },
];

// Things supporters can buy or fund, smaller than a business Impact Routine. Demo content; no payment is processed.
// Ordered cheapest first. `unlockMonth` is when a monthly supporter gets access (1 = right away).
export const fanExperiences = [
  { id: "signed-card", name: "Signed trading card", price: "$20", priceValue: 20, unlockMonth: 1, body: "A printed card signed by the athlete, mailed to you." },
  { id: "practice", name: "Open-practice pass", price: "$30", priceValue: 30, unlockMonth: 2, body: "Watch a Red Rocks practice from the stands with a WRTH host." },
  { id: "meet-greet", name: "Post-meet meet & greet", price: "$40", priceValue: 40, unlockMonth: 3, body: "Join a small group on the floor after a home meet for photos and autographs." },
  { id: "celebration", name: "Celebration video", price: "$75", priceValue: 75, unlockMonth: 6, body: "A 15–30 second birthday, graduation or good-luck message from an athlete." },
].sort((a, b) => a.priceValue - b.priceValue);

export const unlockLabel = (month: number) => (month <= 1 ? "Right away" : `After ${month} months`);

export const communityActivities = [
  { id: "clinic", athleteSlug: "avery", name: "Confidence clinic for beginner gymnasts", partner: "Peak Confidence Youth Club", goal: 1500, raised: 1120 },
  { id: "stem", athleteSlug: "clara", name: "STEM night at a Title I elementary", partner: "Canyon Byte Learning Lab", goal: 1000, raised: 410 },
  { id: "inclusion", athleteSlug: "camie", name: "Adaptive tumbling day", partner: "Bright Steps Adaptive Gym", goal: 2500, raised: 960 },
  { id: "wellness", athleteSlug: "ella", name: "Family wellness walk", partner: "Wasatch Peak Credit Union", goal: 800, raised: 655 },
];

export const sponsorPackages: SponsorPackage[] = [
  { id: "spark", name: "Community Spark", price: 5000, priceLabel: "$5,000", description: "A focused local story and offer.", perks: ["Athlete story", "One social post", "Sponsor mention", "QR campaign page"] },
  { id: "routine", name: "Impact Routine", price: 15000, priceLabel: "$15,000", description: "A complete athlete-led campaign with measurable activation.", perks: ["Athlete story", "Social kit", "Meet-night QR activation", "Sponsor offer", "Final impact report"] },
  { id: "partner", name: "Red Rocks Partner", price: 30000, priceLabel: "$30,000", description: "A multi-athlete seasonal community platform.", perks: ["Multi-athlete campaign", "Community event", "Campaign recap", "Season report"] },
  { id: "strategic", name: "Strategic Partner", price: 200000, priceLabel: "$200,000", description: "A season-long platform partnership concept.", perks: ["Season-long team partnership", "Meet-night presenting rights", "Athlete content series", "Quarterly impact reports", "Renewal planning"] },
];
