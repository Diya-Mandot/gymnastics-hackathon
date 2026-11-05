// Who is using the site. Demo sign-in only: no passwords, stored on this device.
// Shared pages (home, athletes, profiles, cards, the QR support flow) look the same for everyone;
// each group gets its own navigation and its own areas.

export type Group = "supporter" | "business" | "athlete" | "team";

export type SupporterType = "fan" | "alumni" | "parent" | "season-ticket" | "company";

export type Audience = {
  group: Group;
  name?: string;
  supporterType?: SupporterType; // supporters only
  athleteSlug?: string; // athletes only
};

export type NavLink = { href: string; label: string };

export const groups: Record<Group, { label: string; short: string; blurb: string }> = {
  supporter: {
    label: "Supporter",
    short: "Supporters",
    blurb: "Fans, alumni, parents, season-ticket holders and local companies. Donate, subscribe, buy fan experiences, or fund a small community activity.",
  },
  business: {
    label: "Business sponsor",
    short: "Businesses",
    blurb: "Local and national brands. Fund an Impact Routine and get campaign content, fan engagement, community goodwill and measured results.",
  },
  athlete: {
    label: "Athlete",
    short: "Athletes",
    blurb: "Red Rocks gymnasts. Build your brand, review sponsor fits and deals, and approve everything before it goes public.",
  },
  team: {
    label: "WRTH team",
    short: "WRTH team",
    blurb: "Who Rocks the House staff. Run sponsors, campaigns, approvals and revenue.",
  },
};

export const supporterTypes: Record<SupporterType, { label: string; pitch: string }> = {
  fan: { label: "Fan", pitch: "Back the athletes you cheer for, from $10." },
  alumni: { label: "Alumni", pitch: "Stay part of the program that shaped you." },
  parent: { label: "Parent or family", pitch: "Fund the role models your kids look up to." },
  "season-ticket": { label: "Season-ticket holder", pitch: "You’re already in the Huntsman Center. Make your seat count for more." },
  company: { label: "Local company (small gift)", pitch: "Fund a community activity in your company’s name, no full sponsorship needed." },
};

// Pages everyone sees, signed in or not.
export const sharedLinks: NavLink[] = [{ href: "/athletes", label: "Athletes" }];

export function navFor(a: Audience | null): NavLink[] {
  if (!a) return [...sharedLinks, { href: "/live", label: "Play" }, { href: "/support", label: "Support & cards" }, { href: "/match", label: "For businesses" }];
  switch (a.group) {
    case "supporter":
      return [...sharedLinks, { href: "/live", label: "Play" }, { href: "/live/rewards", label: "Rewards" }, { href: "/support", label: "Support" }, { href: "/support#cards", label: "Cards" }, { href: "/support#activities", label: "Community fund" }];
    case "business":
      return [{ href: "/athletes", label: "Athletes" }, { href: "/match", label: "Get Matched" }, { href: "/routines", label: "Impact Routines" }];
    case "athlete":
      return [{ href: `/portal/${a.athleteSlug ?? "avery"}`, label: "My portal" }, { href: `/athletes/${a.athleteSlug ?? "avery"}`, label: "My public profile" }, ...sharedLinks];
    case "team":
      return teamLinks;
  }
}

export const teamLinks: NavLink[] = [
  { href: "/team/live", label: "Live Control" },
  { href: "/portal", label: "Athlete Portal" },
  { href: "/sponsors", label: "Sponsor Engine" },
  { href: "/admin", label: "Live campaign" },
  { href: "/admin/revenue", label: "Revenue" },
];

// Footer directory: every area, labelled by who it's for.
export const directory: { title: string; links: NavLink[] }[] = [
  { title: "Everyone", links: [{ href: "/athletes", label: "Athletes" }, { href: "/signin", label: "Sign in" }] },
  { title: "Supporters", links: [{ href: "/live", label: "Play at the meet" }, { href: "/live/rewards", label: "Rewards" }, { href: "/support", label: "Support" }, { href: "/support#cards", label: "Trading cards" }, { href: "/support#experiences", label: "Fan experiences" }, { href: "/support#activities", label: "Community fund" }] },
  { title: "Businesses", links: [{ href: "/match", label: "Get Matched" }, { href: "/routines", label: "Impact Routines" }] },
  { title: "WRTH team", links: teamLinks },
];

export function homeFor(a: Audience): string {
  switch (a.group) {
    case "supporter": return "/support";
    case "business": return "/match";
    case "athlete": return `/portal/${a.athleteSlug ?? "avery"}`;
    case "team": return "/sponsors";
  }
}

// Which groups may use an area. Paths not listed are open to everyone.
const areas: { prefix: string; allow: Group[] }[] = [
  { prefix: "/routines", allow: ["business", "team"] },
  { prefix: "/match", allow: ["business", "team"] },
  { prefix: "/sponsors", allow: ["team"] },
  { prefix: "/admin", allow: ["team"] },
  { prefix: "/team", allow: ["team"] },
  { prefix: "/business", allow: ["business", "team"] },
  { prefix: "/portal", allow: ["team", "athlete"] },
];

const under = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/** The groups allowed on a path, or null when it's open to everyone. */
export function allowedGroups(path: string): Group[] | null {
  return areas.find((x) => under(path, x.prefix))?.allow ?? null;
}

export function canView(a: Audience | null, path: string): boolean {
  const allow = allowedGroups(path);
  if (!allow) return true;
  if (!a || !allow.includes(a.group)) return false;
  // Athletes only see their own portal.
  if (a.group === "athlete" && under(path, "/portal")) {
    const slug = path.split("/")[2];
    return !slug || slug === a.athleteSlug;
  }
  return true;
}

export function describe(a: Audience): string {
  if (a.group === "supporter" && a.supporterType) return supporterTypes[a.supporterType].label;
  return groups[a.group].label;
}
