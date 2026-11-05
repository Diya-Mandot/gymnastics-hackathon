"use client";

import Link from "next/link";
import { useArena } from "@/lib/arena";

export default function Rewards() {
  const { state, setLeaderboardOptIn } = useArena();
  const nextBadge = Math.max(0, 300 - state.points);
  const badges = [
    { title: "Chalk Starter", detail: "Complete your first eligible challenge.", earned: state.completed.length >= 1 },
    { title: "Routine Reader", detail: "Earn 300 game points.", earned: state.points >= 300 },
    { title: "Full Roster", detail: "Collect all four athlete cards.", earned: ["avery", "mia", "sofia", "jordan"].every((slug) => state.cards.includes(slug)) },
    { title: "Meet Night Champion", detail: "Complete all four rotation missions.", earned: state.cards.includes("meet-night-champion") },
    { title: "Crowd Builder", detail: "Help fans unlock the collective participation reward.", earned: state.milestoneCompleted },
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <p className="label text-red-lit">Your Fan HQ · free gameplay rewards</p>
      <h1 className="mt-2 font-display text-6xl text-ink">Rewards & <em>progress.</em></h1>
      <section className="card mt-8 p-6 sm:p-7">
        <p className="label">Meet-night progress</p>
        <p className="mt-2 font-display text-7xl text-ink">{state.points} <span className="text-2xl text-muted">pts</span></p>
        <p className="mt-2 text-sm text-muted">{state.completed.length} unique challenge{state.completed.length === 1 ? "" : "s"} · {state.cards.length} cards · points are earned only through eligible gameplay.</p>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-sand"><div className="h-full bg-red" style={{ width: `${Math.min(100, state.points / 300 * 100)}%` }} /></div>
        <p className="mt-2 text-sm text-muted">{nextBadge ? `${nextBadge} points until Routine Reader.` : "Routine Reader achieved."}</p>
      </section>
      <section className="mt-8">
        <h2 className="font-display text-4xl text-ink">Your badges</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{badges.map((badge) => <article key={badge.title} className={`card p-5 ${badge.earned ? "border-green" : "opacity-70"}`}><p className="text-xs font-semibold text-red-lit">{badge.earned ? "EARNED" : "UP NEXT"}</p><h3 className="mt-2 font-display text-2xl text-ink">{badge.title}</h3><p className="mt-2 text-sm text-muted">{badge.detail}</p></article>)}</div>
      </section>
      <section className="card mt-8 p-6">
        <p className="label">Optional participation leaderboard</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Choose whether to appear</h2>
        <p className="mt-2 text-sm text-muted">Only gameplay points count. Contributions, sponsor clicks, and supporter status never change ranks. The demo uses a pseudonymous fan label.</p>
        <label className="mt-5 flex items-center gap-3 text-sm text-ink"><input type="checkbox" checked={state.optedIn} onChange={(event) => setLeaderboardOptIn(event.target.checked)} />Show my pseudonymous score on the meet leaderboard</label>
        <Link href="/live/leaderboard" className="mt-4 inline-block text-sm font-semibold text-red-lit">View leaderboard →</Link>
      </section>
      <section className="card mt-5 p-6">
        <h2 className="font-display text-3xl text-ink">Optional supporter perks</h2>
        <p className="mt-3 text-sm text-muted">$10/month membership is an optional WRTH opportunity. Contributions unlock no game points, cards, or leaderboard advantages.</p>
        <Link href="/support/avery" className="btn btn-line mt-5">Learn about supporting</Link>
      </section>
    </main>
  );
}
