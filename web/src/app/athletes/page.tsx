import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { compact } from "@/lib/labels";
import { athletes } from "@/lib/seed";
import { roster } from "@/lib/roster";
import { RosterGrid } from "@/components/RosterGrid";
import { Explore } from "./Explore";

export const metadata = { title: "Explore Athletes" };

export default function AthletesPage() {
  const reach = athletes.reduce((s, a) => s + a.reach, 0);
  return (
    <>
      <PageHero
        image="/images/arena-crowd.jpg"
        alt="The Huntsman Center crowd in red on meet night"
        eyebrow="Explore all athletes"
        title={<>Browse the <em>full roster.</em></>}
        focus="center 45%"
        actions={
          <>
            <a href="#roster" className="btn btn-red">See the athletes</a>
            <Link href="/match" className="btn btn-line">Get matched instead</Link>
          </>
        }
        aside={
          <dl className="card grid grid-cols-3 divide-x divide-line p-5 lg:w-[380px]">
            <HeroStat label="On the roster" value={String(roster.length)} />
            <HeroStat label="Live campaigns" value={String(athletes.length)} />
            <HeroStat label="Sample reach" value={compact(reach)} />
          </dl>
        }
      >
        Meet the 2027 Red Rocks. {athletes.length} athletes have a campaign you can back or sponsor today, and every gymnast on
        the team has a trading card.
      </PageHero>

      <div id="roster" className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-20 sm:px-8">
        <Explore athletes={athletes} />
      </div>

      <RosterGrid />

      {/* Closing band */}
      <section className="on-photo relative flex min-h-[46svh] items-center overflow-hidden">
        <Image src="/images/team-celebrate.jpg" alt="Red Rocks gymnasts laughing and celebrating together" fill sizes="100vw" className="object-cover object-[center_35%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.85)_0%,rgb(15_14_13/0.4)_60%,rgb(15_14_13/0.2)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-8">
          <p className="max-w-[14ch] font-display text-[clamp(40px,5vw,72px)] text-white">
            Not sure who fits? <em>We’ll match you.</em>
          </p>
          <Link href="/match" className="btn btn-red mt-8">Get matched in six questions</Link>
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <dd className="font-display text-3xl text-ink">{value}</dd>
      <dt className="mt-1 text-[11px] text-muted">{label}</dt>
    </div>
  );
}
