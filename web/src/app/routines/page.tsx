import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { athleteBySlug, sponsorPackages } from "@/lib/seed";
import { RoutineBuilder } from "./RoutineBuilder";
import { Workspace } from "./Workspace";
import { SponsorValue } from "./SponsorValue";

export const metadata = { title: "Impact Routines" };

export default async function RoutinesPage({ searchParams }: { searchParams: Promise<{ athlete?: string; package?: string; ai?: string }> }) {
  const sp = await searchParams;
  const athlete = athleteBySlug(sp.athlete ?? "") ?? athleteBySlug("avery")!;
  const pkg = sponsorPackages.find((p) => p.id === sp.package) ?? sponsorPackages.find((p) => p.id === "routine")!;

  return (
    <>
      <PageHero
        image="/images/team-huddle.jpg"
        alt="Red Rocks gymnasts huddled with their coaches during a meet"
        eyebrow="Impact Routines"
        title={<>Fund a campaign that <em>means something.</em></>}
        focus="center 35%"
        actions={
          <>
            <a href="#build" className="btn btn-red">Build a campaign</a>
            <a href="#ai-brief" className="btn btn-line">Draft one with AI</a>
          </>
        }
      >
        Every paid partnership becomes an Impact Routine: an athlete story, a community cause, fan participation, Adobe-made
        creative, and a final impact report.
      </PageHero>

      <div id="build" className="mx-auto max-w-7xl scroll-mt-16 px-4 sm:px-8">
        <RoutineBuilder key={`${athlete.slug}-${pkg.id}`} athlete={athlete} initialPackage={pkg.id} autoAi={sp.ai === "1"} />
      </div>

      <SponsorValue />

      <section className="on-photo relative mt-24 flex min-h-[46svh] items-center overflow-hidden">
        <Image src="/images/fan-signs.jpg" alt="Young fans holding Red Rocks signs at a meet" fill sizes="100vw" className="object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.85)_0%,rgb(15_14_13/0.35)_60%,rgb(15_14_13/0.15)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
          <p className="max-w-[15ch] font-display text-[clamp(40px,5vw,72px)] text-white">
            Not a logo on a banner. <em>A routine fans join.</em>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-8">
        <p className="text-sm font-semibold text-red-lit">Live campaign workspace</p>
        <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
          Confidence <em>Starts Here</em>
        </h2>
        <Workspace />
      </section>
    </>
  );
}
