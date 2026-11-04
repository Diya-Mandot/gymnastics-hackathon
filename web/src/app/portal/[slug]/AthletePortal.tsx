"use client";

import Link from "next/link";
import { AthletePortrait } from "@/components/AthletePortrait";
import { FeatureBadge } from "@/components/Badges";
import { useRole, type Role } from "@/hooks/useRole";
import { isSigned, useDeals, type Deal } from "@/lib/deals";
import { compact, usd } from "@/lib/labels";
import { athletes } from "@/lib/seed";
import { rankCategories } from "@/lib/sponsors";
import type { Athlete } from "@/lib/types";
import { BrandStudio, useKitStatus, type KitStatus } from "./BrandStudio";
import { DealsBoard } from "./DealsBoard";

export type PortalTab = "dashboard" | "studio" | "fit" | "deals";

const TAB_LABELS: Record<PortalTab, string> = {
  dashboard: "Dashboard",
  studio: "Brand Studio",
  fit: "Sponsor Fit",
  deals: "Deals",
};

export function AthletePortal({ athlete, tab }: { athlete: Athlete; tab: PortalTab }) {
  const { role, setRole } = useRole();
  const { deals, update, add } = useDeals();
  const kitStatus = useKitStatus(athlete.slug);

  return (
    <>
      {/* Portal hero: the athlete's own photo, faded into the page */}
      <section className="relative flex min-h-[44svh] items-end overflow-hidden">
        <AthletePortrait athlete={athlete} className="absolute inset-0" priority credit={false} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_14_13/0.55)_0%,rgb(15_14_13/0.25)_35%,rgb(15_14_13/0.7)_75%,#0f0e0d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.8)_0%,rgb(15_14_13/0.2)_60%,transparent_85%)]" />
        <header className="relative mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-28 sm:px-8">
          <div>
            <p className="animate-rise text-sm font-semibold text-red-lit">Athlete Intelligence</p>
            <h1 className="mt-3 animate-rise font-display text-[clamp(52px,7vw,104px)] text-ink [animation-delay:60ms]">
              {athlete.firstName}’s <em>portal.</em>
            </h1>
            <p className="mt-3 text-sm text-ink/60">Simulated roles · no real login · real Red Rocks photo; name, story &amp; stats are demo content</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              Athlete
              <select
                value={athlete.slug}
                onChange={(e) => (window.location.href = `/portal/${e.target.value}?tab=${tab}`)}
                className="input !h-10 !w-auto appearance-none !pr-8"
              >
                {athletes.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.name}</option>
                ))}
              </select>
            </label>
            <RoleSwitch role={role} setRole={setRole} />
          </div>
        </header>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <nav className="sticky top-16 z-30 -mx-4 flex gap-6 overflow-x-auto border-b border-line bg-paper/90 px-4 backdrop-blur-md sm:-mx-8 sm:px-8" aria-label="Portal sections">
          {(Object.keys(TAB_LABELS) as PortalTab[]).map((t) => (
            <Link
              key={t}
              href={`/portal/${athlete.slug}?tab=${t}`}
              aria-current={t === tab ? "page" : undefined}
              className={`relative shrink-0 py-3 text-sm font-medium ${t === tab ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {TAB_LABELS[t]}
              {t === tab && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-red" />}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          {tab === "dashboard" && <Dashboard athlete={athlete} role={role} deals={deals} kitStatus={kitStatus} />}
          {tab === "studio" && <BrandStudio athlete={athlete} role={role} />}
          {tab === "fit" && <SponsorFit athlete={athlete} deals={deals} add={add} />}
          {tab === "deals" && <DealsBoard athlete={athlete} role={role} deals={deals} update={update} />}
        </div>
      </div>
    </>
  );
}

function RoleSwitch({ role, setRole }: { role: Role; setRole: (r: Role) => void }) {
  return (
    <div className="flex rounded-full border border-line bg-surface p-1" role="radiogroup" aria-label="Viewing as">
      {(["athlete", "staff"] as Role[]).map((r) => (
        <button
          key={r}
          role="radio"
          aria-checked={role === r}
          onClick={() => setRole(r)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${role === r ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
        >
          {r === "athlete" ? "Athlete view" : "WRTH staff view"}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- Dashboard ---------------------------------- */

function Dashboard({ athlete, role, deals, kitStatus }: { athlete: Athlete; role: Role; deals: Deal[]; kitStatus: KitStatus }) {
  const mine = deals.filter((d) => d.athleteSlug === athlete.slug);
  const pendingDeals = mine.filter((d) => d.athleteApproval !== "approved");
  const reminders = mine
    .flatMap((d) => d.tasks.filter((t) => !t.done).map((t) => ({ ...t, sponsor: d.sponsor })))
    .filter((t) => role === "staff" || t.owner === "Athlete");
  const recs = recommendations(athlete, mine, kitStatus);
  const signedValue = mine.filter((d) => isSigned(d.stage)).reduce((s, d) => s + d.amount, 0);
  const collected = mine.reduce((s, d) => s + d.collected, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      {/* Identity + brand profile */}
      <div className="grid h-fit gap-6">
        <section className="card overflow-hidden p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
            <AthletePortrait athlete={athlete} className="absolute inset-0" priority />
            <div className="absolute left-3 top-3"><FeatureBadge type={athlete.featureType} /></div>
          </div>
          <div className="p-3 pt-5">
            <h2 className="font-display text-3xl text-ink">{athlete.name}</h2>
            <p className="text-sm text-muted">{athlete.specialty} · {athlete.classYear} · {athlete.hometown}</p>
            <dl className="mt-5 grid grid-cols-3 border-t border-line pt-4">
              <Stat label="Reach" value={compact(athlete.reach)} />
              <Stat label="Engagement" value={`${athlete.engagementRate}%`} />
              <Stat label="Utah audience" value={`${athlete.localAudiencePct}%`} />
            </dl>
          </div>
        </section>
        <section className="card p-6">
          <h3 className="text-sm text-muted">Brand profile</h3>
          <p className="mt-2 font-display text-2xl text-ink">
            {kitStatus === "approved" ? "Media kit approved" : kitStatus === "pending" ? "Media kit awaiting approval" : kitStatus === "changes-requested" ? "Changes requested" : "No media kit yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {kitStatus === "approved" ? "WRTH can share it with sponsors." : "Generate it from the Story Seed in Brand Studio."}
          </p>
          <Link href={`/portal/${athlete.slug}?tab=studio`} className="btn btn-line mt-4 !py-2 text-sm">Open Brand Studio</Link>
        </section>
      </div>

      <div className="grid h-fit gap-6">
        {/* AI recommendations */}
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-ink">Recommendations</h3>
            <span className="text-xs text-faint">From approved profile and pipeline data</span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recs.map((r) => (
              <li key={r.text} className="flex items-start justify-between gap-4 py-3.5">
                <span className="text-[15px] leading-relaxed text-ink">{r.text}</span>
                {r.href && (
                  <Link href={r.href} className="shrink-0 text-sm font-semibold text-red-lit">{r.cta} →</Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Opportunities */}
        <section className="card p-6">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-2xl text-ink">Active opportunities</h3>
            <span className="text-xs text-muted">{usd(signedValue)} signed · {usd(collected)} collected</span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {mine.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-ink">{d.sponsor}</span>
                  <span className="text-xs text-faint">{d.packageName} · {d.stage}</span>
                </span>
                <span className="font-display text-xl text-ink">{usd(d.amount)}</span>
              </li>
            ))}
            {!mine.length && <li className="py-3 text-sm text-muted">No opportunities yet.</li>}
          </ul>
          <Link href={`/portal/${athlete.slug}?tab=deals`} className="mt-4 inline-block text-sm text-ink link">Open deals</Link>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section className="card p-6">
            <h3 className="font-display text-xl text-ink">Pending approvals</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {kitStatus === "pending" && <li className="text-ink">Media kit draft</li>}
              {pendingDeals.map((d) => (
                <li key={d.id} className="text-ink">{d.sponsor} partnership</li>
              ))}
              {kitStatus !== "pending" && !pendingDeals.length && <li className="text-muted">Nothing waiting.</li>}
            </ul>
          </section>
          <section className="card p-6">
            <h3 className="font-display text-xl text-ink">Deliverables due</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {reminders.slice(0, 5).map((t) => (
                <li key={`${t.sponsor}-${t.id}`} className="flex justify-between gap-3">
                  <span className="text-ink">{t.title}</span>
                  <span className="shrink-0 text-faint">{t.due}</span>
                </li>
              ))}
              {!reminders.length && <li className="text-muted">All caught up.</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function recommendations(a: Athlete, mine: Deal[], kit: KitStatus) {
  const recs: { text: string; href?: string; cta?: string }[] = [];
  const top = rankCategories(a)[0];
  recs.push({
    text: `${top.category.name} is your strongest sponsor fit (${top.score}%): it ${top.reasons[0]}.`,
    href: `/portal/${a.slug}?tab=fit`,
    cta: "See matches",
  });
  if (kit !== "approved") recs.push({ text: "Approve a media kit so WRTH can share your story with sponsors.", href: `/portal/${a.slug}?tab=studio`, cta: "Brand Studio" });
  const avg = athletes.reduce((s, x) => s + x.engagementRate, 0) / athletes.length;
  recs.push({
    text:
      a.engagementRate >= avg
        ? `Your ${a.engagementRate}% engagement beats the roster average of ${avg.toFixed(1)}%. Lead sponsor pitches with engagement, not follower count.`
        : `Your ${compact(a.reach)} reach is your headline. Pair it with a story video to lift engagement above the ${avg.toFixed(1)}% roster average.`,
  });
  const open = mine.find((d) => !isSigned(d.stage));
  if (open) recs.push({ text: `${open.sponsor}: ${open.nextAction.charAt(0).toLowerCase() + open.nextAction.slice(1)} by ${open.followUp}.`, href: `/portal/${a.slug}?tab=deals`, cta: "Open deal" });
  return recs;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-2xl text-ink">{value}</dd>
      <dt className="text-[11px] text-faint">{label}</dt>
    </div>
  );
}

/* --------------------------------- Sponsor Fit --------------------------------- */

function SponsorFit({ athlete, deals, add }: { athlete: Athlete; deals: Deal[]; add: (d: Deal) => void }) {
  const ranked = rankCategories(athlete);
  return (
    <div>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-red-lit">Reverse matching</p>
        <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Which businesses should want <em>{athlete.firstName}?</em>
        </h2>
        <p className="mt-3 text-muted">
          Ranked from her approved causes, audiences, formats and minimum budget: cause 40%, audience 35%, format 15%, budget 10%.
          Businesses below are fictional examples. Adding one creates a qualified opportunity in the shared pipeline; nothing is sent.
        </p>
      </div>
      <ol className="mt-8 grid gap-4 lg:grid-cols-2">
        {ranked.map((r, i) => (
          <li key={r.category.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-faint">#{i + 1}</p>
                <h3 className="font-display text-2xl text-ink">{r.category.name}</h3>
                <p className="mt-1 text-sm text-muted">Typical budget {usd(r.category.typicalBudget)} · {r.category.pitch}</p>
              </div>
              <p className="font-display text-4xl text-ink">{r.score}%</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${r.score}% fit`}>
              <div className="h-full rounded-full bg-red" style={{ width: `${r.score}%` }} />
            </div>
            <ul className="mt-4 space-y-1 text-sm text-ink">
              {r.reasons.map((x) => <li key={x}>· {x}</li>)}
            </ul>
            {r.businesses.map((b) => {
              const id = `d-${b.id}-${athlete.slug}`;
              const exists = deals.some((d) => d.id === id || (d.sponsor === b.name && d.athleteSlug === athlete.slug));
              return (
                <div key={b.id} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-sand-soft p-4">
                  <div>
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-xs text-muted">{b.location} · {b.objective} · {usd(b.budget)}</p>
                    {b.warmContact && <p className="mt-1 text-xs text-green">Warm contact: {b.warmContact}</p>}
                  </div>
                  <button
                    disabled={exists}
                    onClick={() =>
                      add({
                        id,
                        sponsor: b.name,
                        athleteSlug: athlete.slug,
                        packageName: b.budget >= 50000 ? "Red Rocks Partner" : b.budget >= 15000 ? "Impact Routine" : "Community Spark",
                        amount: b.budget,
                        stage: "Qualified",
                        collected: 0,
                        athleteApproval: "pending",
                        owner: "WRTH partnerships",
                        nextAction: `Draft an intro note to ${b.name} about ${athlete.firstName}`,
                        followUp: "This week",
                        tasks: [{ id: "t1", title: "Review fit and approve outreach", owner: "Athlete", due: "This week", done: false }],
                      })
                    }
                    className={`btn !py-2 text-sm ${exists ? "btn-line" : "btn-red"}`}
                  >
                    {exists ? "✓ In pipeline" : "Add to pipeline"}
                  </button>
                </div>
              );
            })}
          </li>
        ))}
      </ol>
    </div>
  );
}
