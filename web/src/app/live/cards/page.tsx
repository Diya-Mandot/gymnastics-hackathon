"use client";

import Link from "next/link";
import { useArena } from "@/lib/arena";
import { athletes } from "@/lib/seed";
import { AthletePortrait } from "@/components/AthletePortrait";
import { RoleGate } from "@/components/live/RoleGate";

export default function Cards() {
  return <RoleGate roles={["fan"]}><CardsCollection /></RoleGate>;
}

function CardsCollection() {
  const { state } = useArena();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <p className="label text-red-lit">Collect the roster · free meet-night cards</p>
      <h1 className="mt-2 font-display text-6xl text-ink">Your cards</h1>
      <p className="mt-4 text-muted">{state.cards.length} of 5 collectible cards unlocked. Discover the roster without ranking athletes by popularity.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete) => {
          const unlocked = state.cards.includes(athlete.slug);
          return (
            <article key={athlete.slug} className={`card overflow-hidden p-5 ${unlocked ? "border-green" : "opacity-75"}`}>
              <div className="flex items-center gap-4">
                <AthletePortrait athlete={athlete} className={`h-20 w-20 shrink-0 rounded-xl ${unlocked ? "" : "grayscale"}`} />
                <div><p className="text-xs font-semibold text-red-lit">{unlocked ? "UNLOCKED" : "LOCKED · EARN FREE"}</p><h2 className="mt-1 font-display text-3xl text-ink">{athlete.name}</h2><p className="mt-1 text-sm text-muted">{athlete.specialty}</p></div>
              </div>
              <p className="mt-4 text-sm text-muted">{unlocked ? athlete.tagline : "Answer the related rotation challenge correctly to unlock this card."}</p>
              {unlocked ? <Link href={`/athletes/${athlete.slug}`} onClick={() => undefined} className="mt-4 inline-block text-sm font-semibold text-red-lit">Open approved profile →</Link> : <Link href="/live" className="mt-4 inline-block text-sm font-semibold text-red-lit">Play to collect →</Link>}
            </article>
          );
        })}
        <article className={`card p-5 ${state.cards.includes("meet-night-champion") ? "border-green" : "opacity-75"}`}>
          <p className="text-xs font-semibold text-red-lit">{state.cards.includes("meet-night-champion") ? "UNLOCKED" : "LOCKED · COMPLETE FOUR MISSIONS"}</p>
          <h2 className="mt-4 font-display text-3xl text-ink">Meet Night Champion</h2>
          <p className="mt-2 text-sm text-muted">A digital badge for completing all four staff-approved rotation missions.</p>
          {!state.cards.includes("meet-night-champion") && <Link href="/live" className="mt-4 inline-block text-sm font-semibold text-red-lit">Continue missions →</Link>}
        </article>
      </div>
    </main>
  );
}
