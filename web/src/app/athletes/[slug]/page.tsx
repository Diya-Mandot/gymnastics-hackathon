import { notFound } from "next/navigation";
import { AthleteProfile } from "@/components/AthleteProfile";
import { athleteBySlug, athletes } from "@/lib/seed";

export function generateStaticParams() {
  return athletes.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: athleteBySlug(slug)?.name ?? "Athlete" };
}

export default async function AthletePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const athlete = athleteBySlug(slug);
  if (!athlete) notFound();
  return <AthleteProfile athlete={athlete} />;
}
