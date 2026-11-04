import Image from "next/image";
import { athleteBySlug, sponsorPackages } from "@/lib/seed";
import { RoutineBuilder } from "./RoutineBuilder";
import { Workspace } from "./Workspace";

export const metadata = { title: "Impact Routines" };

export default async function RoutinesPage({ searchParams }: { searchParams: Promise<{ athlete?: string; package?: string; ai?: string }> }) {
  const sp = await searchParams;
  const athlete = athleteBySlug(sp.athlete ?? "") ?? athleteBySlug("avery")!;
  const pkg = sponsorPackages.find((p) => p.id === sp.package) ?? sponsorPackages[1];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8">
      <p className="text-sm font-semibold text-red-lit">Impact Routines</p>
      <h1 className="mt-3 max-w-4xl font-display text-6xl text-ink sm:text-7xl">Fund a campaign that <em>means something.</em></h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Every paid partnership becomes an Impact Routine: an athlete story, a community cause, fan participation, Adobe-made
        creative, and a final impact report.
      </p>

      <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-[24px] sm:aspect-[16/5]">
        <Image src="/images/dumke-dedication.jpg" alt="Fans and families at the Dumke Gymnastics Center dedication" fill priority sizes="100vw" className="object-cover object-[center_55%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-paper/50 to-transparent" />
      </div>

      <RoutineBuilder key={`${athlete.slug}-${pkg.id}`} athlete={athlete} initialPackage={pkg.id} autoAi={sp.ai === "1"} />

      <section className="mt-24">
        <p className="text-sm font-semibold text-red-lit">Live campaign workspace</p>
        <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Confidence Starts Here</h2>
        <Workspace />
      </section>
    </div>
  );
}
