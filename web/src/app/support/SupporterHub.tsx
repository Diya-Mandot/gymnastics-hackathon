"use client";

import Link from "next/link";
import { useAudience } from "@/components/AudienceProvider";
import { supporterTypes } from "@/lib/audience";
import { athleteBySlug, communityActivities, fanExperiences, unlockLabel } from "@/lib/seed";

const usd = (n: number) => `$${n.toLocaleString()}`;

/** A short welcome for signed-in supporters, tuned to how they support. */
export function SupporterWelcome() {
  const { audience } = useAudience();
  if (audience?.group !== "supporter" || !audience.supporterType) return null;
  const t = supporterTypes[audience.supporterType];
  return (
    <div className="card mx-auto mb-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 p-6" data-testid="supporter-welcome">
      <div>
        <p className="label">Welcome{audience.name ? `, ${audience.name}` : ""} · {t.label}</p>
        <p className="mt-2 font-display text-3xl text-ink">{t.pitch}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <a href="#experiences" className="btn btn-line">Fan experiences</a>
        <a href="#activities" className="btn btn-red">Fund a community activity</a>
      </div>
    </div>
  );
}

/** Fan experiences and small community activities: the supporter side, below business Impact Routines. */
export function SupporterOffers() {
  return (
    <>
      <section id="experiences" className="mx-auto max-w-7xl scroll-mt-16 px-4 py-24 sm:px-8">
        <p className="text-sm font-semibold text-red-lit">Fan experiences</p>
        <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Get closer to the routine.</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Every experience pays the athlete directly through Who Rocks the House. Anyone can buy one, and monthly supporters unlock
          them over time. Prices are illustrative.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fanExperiences.map((x) => (
            <article key={x.id} className="card flex flex-col p-6">
              <span className="self-start rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold">
                Monthly supporters · {unlockLabel(x.unlockMonth).toLowerCase()}
              </span>
              <p className="mt-4 font-display text-4xl text-ink">{x.price}</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">{x.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{x.body}</p>
              <Link href="/support/avery" className="btn btn-line mt-6 text-sm">Request (demo)</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="activities" className="scroll-mt-16 border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
          <p className="text-sm font-semibold text-red-lit">Community fund</p>
          <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Fund something small. <em>See it happen.</em></h2>
          <p className="mt-4 max-w-2xl text-muted">
            Small community activities, each led by a Red Rock and each under $2,500, that fans, families, alumni and local
            companies fund together. No sponsorship needed: chip in any amount. Bigger campaigns are business Impact Routines.
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Pick an activity", "A clinic, school visit or community day an athlete wants to run."],
              ["2", "Chip in any amount", "Fans and local companies fill the goal together."],
              ["3", "See it happen", "The athlete leads it and you get a photo recap of the day."],
            ].map(([n, title, body]) => (
              <li key={n} className="flex gap-3 rounded-2xl border border-line bg-paper p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red font-display text-lg text-white">{n}</span>
                <span>
                  <b className="block text-ink">{title}</b>
                  <span className="text-sm text-muted">{body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {communityActivities.map((c) => {
              const athlete = athleteBySlug(c.athleteSlug)!;
              const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
              return (
                <article key={c.id} className="card p-6">
                  <p className="label">Led by {athlete.name} · with {c.partner}</p>
                  <h3 className="mt-2 font-display text-3xl text-ink">{c.name}</h3>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.name} funded`}>
                    <div className="h-full bg-red" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    <b className="text-ink">{usd(c.raised)}</b> of {usd(c.goal)} · {pct}% funded
                  </p>
                  <Link href={`/support/${athlete.slug}`} className="btn btn-red mt-5 text-sm">Chip in (demo)</Link>
                </article>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-faint">Activities, partners and totals are fictional demo content. No payment is processed.</p>
        </div>
      </section>
    </>
  );
}
