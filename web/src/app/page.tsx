import Image from "next/image";
import Link from "next/link";
import { AthleteCard } from "@/components/AthleteCard";
import { FeaturedCampaign } from "@/components/FeaturedCampaign";
import { HeroLive } from "@/components/HeroLive";
import { PhotoStrip } from "@/components/PhotoStrip";
import { SectionHeading } from "@/components/Section";
import { athletes } from "@/lib/seed";
import { redirect } from "next/navigation";

const paths = [
  { href: "/athletes", title: "I’m a fan", body: "Watch athlete stories, scan at meets, share a confidence note.", img: "/images/fans-utes.jpg", alt: "Fans in red with arms raised under arena lights" },
  { href: "/support", title: "I want to support", body: "Back an athlete or a cause, once or every month.", img: "/images/fan-signs-2.jpg", alt: "A family with handmade Red Rocks signs in the stands" },
  { href: "/match", title: "I’m a business", body: "Get matched with the athlete whose story fits your brand.", img: "/images/arena-scoreboard.jpg", alt: "The Huntsman Center scoreboard with sponsor signage" },
  { href: "/routines", title: "I’m an athlete", body: "Turn your story and community work into NIL opportunities.", img: "/images/team-wrth.jpg", alt: "The Red Rocks team in Who Rocks the House shirts" },
];

const routineParts = [
  ["Athlete story", "A 45-second video in her own words."],
  ["Community cause", "A WRTH-aligned partner like Girls on the Run."],
  ["Sponsor or supporters", "A local business, a fan group, or both."],
  ["Creative assets", "Social kit, QR poster, and cards made in Adobe."],
  ["Fan participation", "Notes, nominations, offers, and meet-night QR."],
  ["Tasks and approvals", "The athlete approves everything that goes public."],
  ["Impact report", "What it reached, and what to renew."],
];

const path = [
  { label: "Today (unverified)", value: "$200K" },
  { label: "Year 1", value: "$646K" },
  { label: "Year 2", value: "$1.24M" },
  { label: "Year 3", value: "$2M" },
];

export function LegacyHome() {
  const favorites = athletes.filter((a) => a.featureType === "fan-favorite");
  const rising = athletes.filter((a) => a.featureType === "rising-routine");

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[88svh] items-end overflow-hidden">
        <Image
          src="/images/arena-fireworks.jpg"
          alt="A packed Huntsman Center crowd in red as fireworks open a Red Rocks meet"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_14_13/0.6)_0%,rgb(15_14_13/0.1)_30%,rgb(15_14_13/0.55)_68%,#0f0e0d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.75)_0%,rgb(15_14_13/0.2)_55%,transparent_80%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-end gap-10 px-4 pb-14 pt-40 sm:px-8 lg:grid-cols-[1fr_auto] lg:pb-20">
          <div>
            <p className="animate-rise text-sm font-semibold text-red-lit">Red Rocks NIL · with Who Rocks the House</p>
            <h1 className="mt-5 max-w-[12ch] animate-rise font-display text-[clamp(56px,8.6vw,140px)] text-ink [animation-delay:60ms]">
              Find the story your brand can stand <em>behind.</em>
            </h1>
            <p className="mt-6 max-w-lg animate-rise text-lg leading-relaxed text-ink/80 [animation-delay:120ms]">
              A routine lasts minutes. Its impact on a young fan, a family, and a Utah community can last much longer.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">
              <Link href="/match" className="btn btn-red">Get matched</Link>
              <Link href="/athletes" className="btn btn-line">Meet the athletes</Link>
              <Link href="/cards" className="btn btn-line">Collect cards</Link>
            </div>
          </div>
          <div className="w-full max-w-sm animate-rise [animation-delay:240ms]">
            <HeroLive />
          </div>
        </div>
      </section>

      {/* Meet-night photo strip */}
      <section className="pb-6 pt-2">
        <PhotoStrip />
      </section>

      {/* Four paths */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <SectionHeading eyebrow="Everyone has a role" title={<>Join the <em>routine.</em></>}>
            Fans, supporters, businesses, and athletes all take part in NIL differently. Start where you fit.
          </SectionHeading>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paths.map((p, i) => (
              <Link key={p.title} href={p.href} className="group card flex flex-col overflow-hidden p-2 transition-colors hover:border-ink/30">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
                  <Image src={p.img} alt={p.alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-paper/85 px-2.5 py-1 font-display text-sm text-ink">0{i + 1}</span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-display text-3xl text-ink">{p.title}</h3>
                  <p className="mt-2 text-[15px] text-muted">{p.body}</p>
                  <span className="mt-auto pt-5 text-sm font-semibold text-red-lit transition-transform group-hover:translate-x-1">Start →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured campaign */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <SectionHeading eyebrow="Featured Impact Routine" title={<>Confidence <em>starts here.</em></>}>
          A business funds it. Fans join it. An athlete leads it. Every dollar is tracked to the community it reaches.
        </SectionHeading>
        <div className="mt-12">
          <FeaturedCampaign />
        </div>
      </section>

      {/* Fan Favorites + Rising Routines, equal weight */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <SectionHeading eyebrow="Back the full roster" title={<>Not just the <em>most followed.</em></>}>
          Fan Favorites bring reach. Rising Routines bring stories and the roster’s highest engagement. Both get the same
          spotlight.
        </SectionHeading>
        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-8">
          {[
            { title: "Fan Favorites", sub: "Broad awareness", list: favorites },
            { title: "Rising Routines", sub: "Community-first", list: rising },
          ].map((g) => (
            <div key={g.title}>
              <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
                <h3 className="font-display text-2xl text-ink">{g.title}</h3>
                <p className="text-sm text-muted">{g.sub}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.list.map((a) => (
                  <AthleteCard key={a.slug} athlete={a} showActions={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/athletes" className="btn btn-line">See all athletes</Link>
        </div>
      </section>

      {/* What's an Impact Routine */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl items-start gap-14 px-4 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28">
            <SectionHeading eyebrow="The idea" title={<>Every partnership becomes an <em>Impact Routine.</em></>}>
              Not a logo on a banner. A complete, athlete-led campaign that fans can join and sponsors can measure.
            </SectionHeading>
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[20px]">
              <Image
                src="/images/team-celebrate.jpg"
                alt="Red Rocks gymnasts laughing and celebrating together on the competition floor"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-[center_30%]"
              />
            </div>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {routineParts.map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[56px_1fr] items-baseline gap-4 py-6">
                <span className="font-display text-base text-red-lit">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-display text-2xl text-ink">{title}</p>
                  <p className="mt-1 text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Community proof */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <SectionHeading eyebrow="Built on real trust" title={<>Red Rocks already has <em>the crowd.</em></>}>
          Some of the biggest crowds in college gymnastics, decades of history, and a community that shows up. Rock the
          Routine turns that trust into opportunity for every athlete.
        </SectionHeading>
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-4 sm:auto-rows-[240px] md:grid-cols-4">
          <Photo src="/images/fan-signs.jpg" alt="Young fans holding Red Rocks signs at a meet" caption="Fans at the Huntsman Center" className="col-span-2 row-span-2" />
          <Photo src="/images/dumke-dedication.jpg" alt="The Dumke Gymnastics Center dedication ceremony" caption="Dumke Gymnastics Center" className="col-span-2" />
          <Photo src="/images/trophies.jpg" alt="Pac-12 championship trophies" caption="Conference titles" />
          <Photo src="/images/team-wrth.jpg" alt="The Red Rocks team in Who Rocks the House shirts" caption="Who Rocks the House" />
        </div>
      </section>

      {/* Salt flats band */}
      <section className="relative flex min-h-[70svh] items-start overflow-hidden">
        <Image
          src="/images/salt-flats-leap.jpg"
          alt="A gymnast in a red leotard leaping above the Bonneville Salt Flats"
          fill
          sizes="100vw"
          className="object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.55)_0%,transparent_45%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 sm:px-8 sm:pt-24">
          <p className="max-w-[11ch] font-display text-[clamp(40px,5vw,76px)] text-white">Every routine ends. <em>Its impact should not.</em></p>
        </div>
      </section>

      {/* Three-year path */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <SectionHeading eyebrow="Illustrative model" title={<>A path toward <em>$2M</em> in NIL activity.</>} align="center">
            Sponsor campaigns, new supporters, and athlete experiences, with renewal built in. These are planning targets: the
            $200K starting point stays unverified until WRTH confirms actual figures.
          </SectionHeading>
          <ol className="relative mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-y-10 md:grid-cols-4">
            <span className="absolute left-[12.5%] right-[12.5%] top-[7px] hidden h-px bg-line md:block" aria-hidden="true" />
            {path.map((p, i) => (
              <li key={p.label} className="relative text-center">
                <span className={`relative mx-auto block h-3.5 w-3.5 rounded-full border-2 ${i === 3 ? "border-red bg-red" : "border-red bg-surface"}`} />
                <p className="mt-5 text-sm text-muted">{p.label}</p>
                <p className="mt-1 font-display text-5xl font-medium text-ink sm:text-6xl">{p.value}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link href="/admin/revenue" className="btn btn-line">Try the revenue simulator</Link>
            <p className="mt-4 text-xs text-faint">Targets, not guarantees.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  redirect("/join");
}

function Photo({ src, alt, caption, className = "" }: { src: string; alt: string; caption: string; className?: string }) {
  return (
    <figure className={`relative overflow-hidden rounded-[20px] ${className}`}>
      <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      <figcaption className="absolute bottom-3 left-3 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-medium text-ink">{caption}</figcaption>
    </figure>
  );
}
