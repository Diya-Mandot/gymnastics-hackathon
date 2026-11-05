"use client";

import Link from "next/link";
import { useArena } from "@/lib/arena";

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <article className="card p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 font-display text-4xl text-ink">{value}</p>{note && <p className="mt-2 text-xs text-faint">{note}</p>}</article>;
}

export default function Analytics() {
  const { state } = useArena();
  const m = state.metrics;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
    <p className="label text-red-lit">WRTH staff · live analytics · simulated</p>
    <h1 className="mt-2 font-display text-6xl text-ink">Engagement, not <em>guesswork.</em></h1>
    <p className="mt-4 max-w-3xl text-muted">All figures combine a clearly labelled sample baseline with actions in this browser. Financial categories remain separate; this dashboard does not claim verified revenue.</p>

    <h2 className="mt-10 font-display text-3xl text-ink">Game engagement</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Unique participants" value={m.participants.toLocaleString()} />
      <Metric label="Challenge starts" value={m.challengeStarts.toLocaleString()} />
      <Metric label="Challenge completions" value={m.challengeCompletions.toLocaleString()} />
      <Metric label="Avg. completed challenges" value={m.averageCompletedChallenges} />
      <Metric label="Cards collected" value={m.cardsCollected.toLocaleString()} />
      <Metric label="Athlete profile visits" value={m.athleteProfileVisits.toLocaleString()} />
      <Metric label="Repeat participants" value={m.repeatParticipants.toLocaleString()} />
      <Metric label="Current rotation" value={`${state.rotation} of 4`} note={state.status.toUpperCase()} />
    </div>

    <h2 className="mt-10 font-display text-3xl text-ink">Fan conversion</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Supporter CTA impressions" value={m.supporterImpressions.toLocaleString()} />
      <Metric label="Supporter CTA clicks" value={m.supporterClicks.toLocaleString()} />
      <Metric label="Click rate" value={`${m.conversionRate}%`} />
      <Metric label="New opt-in followers" value={m.newOptIns.toLocaleString()} />
      <Metric label="Simulated contributions" value={m.simulatedContributions.toLocaleString()} />
      <Metric label="New fan contribution total" value={`$${m.newFanContributions.toLocaleString()}`} />
    </div>

    <h2 className="mt-10 font-display text-3xl text-ink">Sponsor performance</h2>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Sponsored challenge impressions" value={m.sponsoredChallengeImpressions.toLocaleString()} />
      <Metric label="Sponsored challenge starts" value={m.sponsoredChallengeStarts.toLocaleString()} />
      <Metric label="Sponsored challenge completions" value={m.sponsoredChallengeCompletions.toLocaleString()} />
      <Metric label="Sponsor spotlight views" value={m.sponsorSpotlightViews.toLocaleString()} />
      <Metric label="Sponsor link clicks" value={m.sponsorLinkClicks.toLocaleString()} />
      <Metric label="Offer claims" value={m.offerClaims.toLocaleString()} />
      <Metric label="Attributable outcomes" value={m.attributableOutcomes} note="No guaranteed sales claimed" />
    </div>

    <section className="card mt-10 p-6">
      <p className="label">NIL funding guardrail</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">Sponsor opportunity value, signed sponsorship funding, collected sponsorship funding, new fan contributions, existing supporter revenue, activation costs, and athlete NIL compensation must remain separate in production. This competition prototype only records simulated fan contribution events.</p>
      <div className="mt-5 flex flex-wrap gap-3"><Link href="/team/live" className="btn btn-red">Return to controller</Link><Link href="/live" className="btn btn-line">Preview fan experience</Link></div>
    </section>
  </main>;
}
