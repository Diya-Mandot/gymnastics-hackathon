"use client";

import Link from "next/link";
import { useArena } from "@/lib/arena";
import { RoleGate } from "@/components/live/RoleGate";

export default function Leaderboard() {
  return <RoleGate roles={["fan"]}><LeaderboardPage /></RoleGate>;
}

function LeaderboardPage() {
  const { state } = useArena();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <p className="label text-red-lit">Optional · gameplay only</p>
      <h1 className="mt-2 font-display text-6xl text-ink">Meet leaderboard</h1>
      <p className="mt-4 text-muted">Fans opt in before appearing. Points come only from eligible gameplay; donations and sponsor interactions never affect rank.</p>
      <section className="card mt-8 overflow-hidden">
        {state.leaderboard.length ? (
          <ol>{state.leaderboard.map((row, index) => <li key={row.fanId} className="flex items-center justify-between border-b border-line px-5 py-4 last:border-0"><div><p className="text-sm font-semibold text-ink">#{index + 1} · Arena Fan {row.fanId.slice(-4).toUpperCase()}</p><p className="mt-1 text-xs text-muted">{row.completed} challenges completed</p></div><p className="font-display text-2xl text-ink">{row.points} pts</p></li>)}</ol>
        ) : <div className="p-6"><h2 className="font-display text-3xl text-ink">No opted-in scores yet.</h2><p className="mt-2 text-sm text-muted">Play a challenge and opt in from Rewards to show a pseudonymous score here.</p><Link href="/live/rewards" className="mt-4 inline-block text-sm font-semibold text-red-lit">Choose leaderboard settings →</Link></div>}
      </section>
      <p className="mt-5 text-xs text-faint">Leaderboard data is local to this demo browser. Production should use authorized shared fan records and allow opt-out.</p>
    </main>
  );
}
