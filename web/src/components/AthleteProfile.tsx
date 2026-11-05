import Image from "next/image";
import Link from "next/link";
import {
  audienceLabels,
  availabilityLabel,
  campaignTypeLabels,
  causeLabels,
  compact,
  platformLabels,
  usd,
} from "@/lib/labels";
import { defaultBrief, scoreAthlete } from "@/lib/match";
import { sponsorPackages, supporterTiers } from "@/lib/seed";
import type { Athlete } from "@/lib/types";
import { AthletePortrait } from "./AthletePortrait";
import { ChalkArc } from "./ChalkArc";
import { DemoBadge, FeatureBadge } from "./Badges";
import { MatchRing, ScoreBreakdown } from "./ScoreBreakdown";
import { StoryPlayer } from "./StoryPlayer";
import { YourImpact } from "./YourImpact";

export function AthleteProfile({ athlete }: { athlete: Athlete }) {
  const fit = scoreAthlete(athlete, defaultBrief);

  return (
    <article>
      {/* Hero: text left, framed official portrait right (portrait first on phones) */}
      <header className="relative overflow-hidden bg-paper">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(closest-side,rgb(204_0_0/0.22),transparent)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24 lg:pt-4">
          <figure className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:order-2 lg:max-w-[440px]">
            <ChalkArc className="absolute -left-10 -top-8 h-[60%] w-[120%] opacity-40" dashed />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)]">
              <AthletePortrait athlete={athlete} className="absolute inset-0" priority credit={false} />
            </div>
            <figcaption className="mt-3 text-center text-xs text-faint">Official roster photo · Utah Athletics</figcaption>
          </figure>
          <div className="lg:order-1">
            <div className="flex flex-wrap gap-2">
              <FeatureBadge type={athlete.featureType} />
              <DemoBadge />
            </div>
            <p className="mt-6 animate-rise text-sm font-semibold text-red-lit">Red Rocks Gymnastics · {athlete.specialty}</p>
            <h1 className="mt-3 animate-rise font-display text-[clamp(60px,8vw,128px)] leading-[0.88] text-ink [animation-delay:60ms]">
              {athlete.firstName}
              <br />
              <em>{athlete.name.split(" ").slice(1).join(" ")}</em>
            </h1>
            <p className="mt-4 text-muted">{athlete.classYear} · {athlete.hometown}</p>
            {athlete.photo && <p className="mt-1 text-xs text-faint">Photo &amp; highlights: utahutes.com · quote, story, causes &amp; stats are sample content</p>}
            <blockquote className="mt-8 animate-rise border-l-2 border-red pl-5 font-display text-3xl leading-snug text-ink [animation-delay:120ms] sm:text-[34px]">
              “{athlete.quote}”
            </blockquote>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:180ms]">
              <Link href={`/support/${athlete.slug}`} className="btn btn-red">Back {athlete.firstName}</Link>
              <Link href="/support#cards" className="btn btn-line">Collect card</Link>
              <Link href="/sponsors" className="btn btn-line">Sponsor inquiry</Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        {/* Stats strip */}
        <dl className="card grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
          <Metric label="Social reach" value={compact(athlete.reach)} />
          <Metric label="Engagement rate" value={`${athlete.engagementRate}%`} />
          <Metric label="Utah audience" value={`${athlete.localAudiencePct}%`} />
          <Metric label="Campaigns from" value={usd(athlete.budgetMin)} />
        </dl>
        <p className="mt-2 text-right text-xs text-faint">Sample numbers for the demo, not her real social stats.</p>

        <p className="mx-auto mt-10 max-w-3xl text-center font-display text-2xl leading-snug text-ink/85 sm:text-3xl">{athlete.bio}</p>

        {/* Story + about */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <StoryPlayer athlete={athlete} />
          <div className="card divide-y divide-line px-6">
            <Row title="Causes she cares about">
              <Tags items={athlete.causes.map((c) => causeLabels[c])} />
            </Row>
            <Row title="Audience">
              <Tags items={athlete.audiences.map((a) => audienceLabels[a])} />
              <p className="mt-2 text-sm text-muted">On {athlete.platforms.map((p) => platformLabels[p]).join(", ")}</p>
            </Row>
            <Row title="Availability">
              <p className="flex items-center gap-2 text-ink">
                <span className={`h-1.5 w-1.5 rounded-full ${athlete.daysUntilAvailable <= 14 ? "bg-green" : "bg-faint"}`} />
                {availabilityLabel(athlete.daysUntilAvailable)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {athlete.inPerson ? "Open to in-person appearances. " : ""}
                {athlete.campaignTypes.map((t) => campaignTypeLabels[t]).join(", ")}
              </p>
            </Row>
          </div>
        </section>

        {/* Community work + sponsor fit */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink">Highlights</h2>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {athlete.pastWork.map((w) => (
                <li key={w} className="py-3.5 text-ink">{w}</li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">Content examples</p>
            <Tags items={athlete.contentExamples} className="mt-3" />
          </div>
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-3xl text-ink">Sponsor fit</h2>
            <div className="mt-5 flex items-start gap-5">
              <MatchRing score={fit.score} />
              <p className="text-muted">
                For a <span className="text-ink">Utah family brand</span> backing youth confidence with a $15K community event.{" "}
                <span className="text-ink">{fit.explanation}</span>
              </p>
            </div>
            <div className="mt-7">
              <ScoreBreakdown breakdown={fit.breakdown} />
            </div>
            <Link href="/match" className="link mt-6 inline-block text-sm text-ink">
              Run your own brief
            </Link>
          </div>
        </section>

        {/* Packages */}
        <section className="mt-24">
          <p className="text-sm font-semibold text-red-lit">For businesses</p>
          <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Campaign packages</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sponsorPackages.map((p) => {
              const hot = p.id === "routine";
              return (
                <div key={p.id} className={`card relative flex flex-col p-7 ${hot ? "!border-ink" : ""}`}>
                  {hot && <span className="tag absolute right-5 top-5 !bg-red !text-white">Most chosen</span>}
                  <p className="text-muted">{p.name}</p>
                  <p className="mt-2 font-display text-6xl font-medium text-ink">{p.priceLabel}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-5 text-[15px] text-ink">
                    {p.perks.map((x) => (
                      <li key={x} className="flex gap-2.5"><span className="text-red-lit">✓</span>{x}</li>
                    ))}
                  </ul>
                  <Link href={`/routines?athlete=${athlete.slug}&package=${p.id}`} className={`btn mt-7 ${hot ? "btn-red" : "btn-line"}`}>
                    Build this campaign
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supporter tiers + celebration video */}
        <section className="mt-24">
          <p className="text-sm font-semibold text-red-lit">For fans</p>
          <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Back <em>{athlete.firstName}.</em></h2>
          <div className="card mt-8 grid divide-line sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {supporterTiers.map((t) => (
              <div key={t.id} className="p-6">
                <p className="text-sm text-muted">{t.name}</p>
                <p className="mt-1 font-display text-4xl font-medium text-ink">{t.price}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-muted">
                  {t.perks.map((x) => <li key={x}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div id="celebration" className="mt-4 flex flex-col gap-5 rounded-[20px] bg-red p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div>
              <p className="text-sm font-semibold text-white/75">Premium celebration video</p>
              <p className="mt-2 font-display text-4xl">A 15–30 second video from {athlete.firstName}.</p>
              <p className="mt-2 text-white/75">Birthdays, graduations, good-luck wishes, and big congratulations.</p>
            </div>
            <Link href={`/support/${athlete.slug}`} className="btn shrink-0 bg-white text-paper hover:bg-white/90">Request a video</Link>
          </div>
        </section>

        {/* Team context: real photos of the program, never captioned as this athlete */}
        <section className="mt-24">
          <p className="text-sm font-semibold text-red-lit">Red Rocks</p>
          <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">The team behind <em>every routine.</em></h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
            {[
              ["/images/team-huddle.jpg", "Red Rocks gymnasts huddled with their coaches during a meet", "Meet-day huddle", "col-span-2 md:col-span-1"],
              ["/images/gymnast-leap.jpg", "A Red Rocks gymnast in a split leap above a packed arena", "Huntsman Center", ""],
              ["/images/team-wrth.jpg", "The Red Rocks team in Who Rocks the House shirts", "Who Rocks the House", ""],
            ].map(([src, alt, cap, cls]) => (
              <figure key={src} className={`relative aspect-[4/3] overflow-hidden rounded-[20px] md:aspect-auto md:h-[300px] ${cls}`}>
                <Image src={src} alt={alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-3 py-1.5 text-xs font-medium text-ink">{cap}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">Team photos supplied by Who Rocks the House.</p>
        </section>

        {/* Your Impact */}
        <section className="mt-24">
          <YourImpact athlete={athlete} />
        </section>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6">
      <dd className="font-display text-5xl font-medium text-ink">{value}</dd>
      <dt className="mt-1 text-sm text-muted">{label}</dt>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-5">
      <h2 className="mb-3 text-sm text-muted">{title}</h2>
      {children}
    </div>
  );
}

function Tags({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((i) => <span key={i} className="tag">{i}</span>)}
    </div>
  );
}
