"use client";

import Link from "next/link";
import { useArena } from "@/lib/arena";

const apparatus = ["Vault", "Balance Beam", "Uneven Bars", "Floor Exercise"];

export default function Meet() {
  const { state } = useArena();
  const completed = Math.min(state.crowd, state.milestoneTarget);
  const progress = Math.min(100, completed / state.milestoneTarget * 100);
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <p className="label text-red-lit">Meet night · demo simulation</p>
      <h1 className="mt-2 font-display text-6xl text-ink">Red Rocks <em>Live.</em></h1>
      <p className="mt-4 max-w-2xl text-muted">Meet status and rotations follow the staff-controlled demo schedule. This prototype does not connect to live meet scoring.</p>
      <section className="card mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="label">{state.status.toUpperCase()}</p><h2 className="mt-2 font-display text-4xl text-ink">{apparatus[state.rotation - 1]}</h2><p className="mt-2 text-sm text-muted">Rotation {state.rotation} of 4</p></div>
          <Link href="/live" className="btn btn-red">Play current challenge</Link>
        </div>
        <ol className="mt-7 grid gap-3 sm:grid-cols-2">
          {apparatus.map((name, index) => {
            const rotation = index + 1;
            const current = rotation === state.rotation;
            const finished = rotation < state.rotation || state.status === "completed";
            return <li key={name} className={`rounded-xl border p-4 ${current ? "border-red bg-red-soft" : "border-line bg-surface"}`}><p className="text-xs uppercase tracking-wide text-muted">Rotation {rotation}{finished ? " · completed" : current ? " · current" : ""}</p><p className="mt-1 font-semibold text-ink">{name}</p></li>;
          })}
        </ol>
        <div className="mt-8 border-t border-line pt-6">
          <p className="label">Collective participation milestone</p>
          <p className="mt-2 text-sm text-muted">Eligible fan challenges unlock a pre-approved thank-you story. Contributions do not count toward the goal.</p>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-sand" role="progressbar" aria-label="Crowd challenge progress" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={state.milestoneTarget}><div className="h-full bg-red" style={{ width: `${progress}%` }} /></div>
          <p className="mt-2 text-sm text-muted">{completed.toLocaleString()} / {state.milestoneTarget.toLocaleString()} challenges · {state.milestoneCompleted ? "Demo reward unlocked" : "Demo reward not yet unlocked"}</p>
          <p className="mt-1 text-xs text-faint">The initial 650 completions are a clearly simulated sample baseline.</p>
        </div>
      </section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link href="/live/cards" className="card p-5"><h2 className="font-display text-3xl text-ink">Collect the roster</h2><p className="mt-2 text-sm text-muted">Free athlete cards, stories, and the Meet Night Champion mission reward.</p></Link>
        <Link href="/live/leaderboard" className="card p-5"><h2 className="font-display text-3xl text-ink">Optional leaderboard</h2><p className="mt-2 text-sm text-muted">Points come only from gameplay; donating never improves a rank.</p></Link>
      </div>
    </main>
  );
}
