import { notFound } from "next/navigation";
import { athleteBySlug, athletes } from "@/lib/seed";
import { AthletePortal, type PortalTab } from "./AthletePortal";

export const metadata = { title: "Athlete Intelligence" };

const TABS: PortalTab[] = ["dashboard", "studio", "fit", "deals"];

export function generateStaticParams() {
  return athletes.map((a) => ({ slug: a.slug }));
}

export default async function PortalPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const athlete = athleteBySlug(slug);
  if (!athlete) notFound();
  const tab = TABS.includes(sp.tab as PortalTab) ? (sp.tab as PortalTab) : "dashboard";
  return <AthletePortal athlete={athlete} tab={tab} />;
}
