"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "@/components/live/RoleGate";
import { useArena } from "@/lib/arena";

export default function Fan() {
  return <RoleGate roles={["fan"]}>{(profile) => <FanHome name={profile.firstName} />}</RoleGate>;
}

function FanHome({ name }: { name: string }) {
  const [offer, setOffer] = useState(false);
  const [claimedReward, setClaimedReward] = useState("");
  const { state } = useArena();

  useEffect(() => {
    const reward = localStorage.getItem("rtr:pending-reward");
    if (reward) {
      setClaimedReward(reward);
      localStorage.removeItem("rtr:pending-reward");
    }
    if (!localStorage.getItem("rtr:new-fan-offer")) return;
    const timer = window.setTimeout(() => {
      setOffer(true);
      localStorage.removeItem("rtr:new-fan-offer");
    }, 15_000);
    return () => window.clearTimeout(timer);
  }, []);

  return <main className="mx-auto max-w-7xl px-4 py-9 sm:px-8">
    {offer && <Membership close={() => setOffer(false)} />}
    <p className="label text-red-lit">Fan HQ - Rock the Arena</p>
    <h1 className="mt-2 font-display text-7xl text-ink">Hey {name}, <em>you&apos;re on the board.</em></h1>

    {claimedReward && <section className="mt-6 rounded-2xl border border-green bg-green/10 p-5" aria-live="polite">
      <p className="label text-green">Reward claimed</p>
      <h2 className="mt-2 font-display text-3xl text-ink">Your {claimedReward} is now in your collection.</h2>
      <Link href="/live/cards" className="mt-3 inline-block text-sm font-semibold text-red-lit">Open my cards -&gt;</Link>
    </section>}

    <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[20px] bg-red p-7 text-white">
        <p className="text-sm text-white/70">Tonight&apos;s {state.status === "live" ? "live" : "scheduled"} challenge - demo simulation</p>
        <h2 className="mt-3 font-display text-6xl">Every rotation counts.</h2>
        <p className="mt-4 max-w-lg text-white/80">Play free trivia, meet the roster, and earn cards through eligible challenges.</p>
        <Link className="btn mt-6 bg-white text-ink" href="/live">Play now</Link>
      </section>
      <section className="card p-7">
        <p className="label">Your rewards</p>
        <p className="mt-2 font-display text-6xl text-ink">{state.points} <span className="text-2xl text-muted">pts</span></p>
        <p className="mt-2 text-sm text-muted">{state.completed.length} challenges - {state.cards.length} cards unlocked</p>
        <div className="mt-6 h-3 rounded-full bg-sand"><div className="h-full rounded-full bg-red" style={{ width: `${Math.min(100, state.points / 300 * 100)}%` }} /></div>
        <Link href="/live/rewards" className="mt-5 block text-sm font-semibold text-red-lit">See my rewards -&gt;</Link>
      </section>
    </div>

    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {[
        ["Collect the roster", "Unlock athlete stories and cards.", "/live/cards"],
        ["Meet night", "Track the staff-approved rotation and collective milestone.", "/live/meet"],
        ["Support", "Optional supporter opportunities; never a game advantage.", "/support/avery"],
      ].map(([title, body, href]) => <Link key={title} href={href} className="card p-6"><h2 className="font-display text-3xl text-ink">{title}</h2><p className="mt-3 text-sm text-muted">{body}</p><p className="mt-6 text-sm font-semibold text-red-lit">Open -&gt;</p></Link>)}
    </div>
    <p className="mt-6 text-xs text-faint">Meet-night progress is saved in this browser. Sign-in is used to save your eligible rewards.</p>
  </main>;
}

function Membership({ close }: { close: () => void }) {
  return <div className="fixed inset-0 z-[100] grid place-items-end bg-black/60 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="WRTH supporter membership">
    <section className="card max-w-md p-7">
      <p className="label text-red-lit">New Fan reward</p>
      <h2 className="mt-3 font-display text-5xl text-ink">Make every meet <em>count.</em></h2>
      <p className="mt-4 text-muted">Join WRTH for $10/month to unlock early card drops, athlete/community updates, streak rewards, and priority access to approved experiences.</p>
      <Link href="/support/avery" className="btn btn-red mt-6 w-full">Start $10/month demo</Link>
      <button onClick={close} className="mt-4 w-full text-sm text-muted">Not now</button>
    </section>
  </div>;
}
