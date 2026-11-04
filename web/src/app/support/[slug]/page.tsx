import { notFound } from "next/navigation";
import { athleteBySlug, athletes } from "@/lib/seed";
import { SupportFlow } from "./SupportFlow";

export function generateStaticParams() {
  return athletes.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = athleteBySlug(slug);
  return { title: a ? `Back ${a.firstName}` : "Support" };
}

export default async function SupportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const athlete = athleteBySlug(slug);
  if (!athlete) notFound();
  return <SupportFlow athlete={athlete} />;
}
