"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "@/components/live/RoleGate";
import { useArena } from "@/lib/arena";
import { authClient, authConfigured } from "@/lib/auth";

export default function Fan() {
  return <RoleGate roles={["fan"]}>{(profile) => <FanHome name={profile.firstName} profileId={profile.id} />}</RoleGate>;
}

function FanHome({ name, profileId }: { name: string; profileId: string }) {
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
    <div className="mt-8 grid gap-5 lg:grid-cols-2">
      <ReferralPanel profileId={profileId} />
      <SupporterRewards total={state.supportTotal} />
    </div>
    <p className="mt-6 text-xs text-faint">Meet-night progress is saved in this browser. Sign-in is used to save your eligible rewards.</p>
  </main>;
}

function ReferralPanel({ profileId }: { profileId: string }) {
  const [points, setPoints] = useState(0);
  const [friends, setFriends] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!authConfigured) return;
    authClient().from("fan_referrals").select("status,points").eq("referrer_id", profileId).then(({ data }) => {
      const referrals = (data ?? []) as unknown as Array<{ status: "signed_up" | "contributed"; points: number }>;
      setFriends(referrals.length);
      setPoints(referrals.reduce((total, referral) => total + referral.points, 0));
    }).catch(() => undefined);
  }, [profileId]);
  const share = async () => {
    const url = `${window.location.origin}/join?ref=${profileId}`;
    const text = "Join me in Rock the Arena: play free meet-night games, collect Red Rocks cards, and unlock fan rewards.";
    try { if (navigator.share) await navigator.share({ title: "Rock the Arena", text, url }); else await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch {}
  };
  const next = points < 500 ? 500 : points < 1000 ? 1000 : 2000;
  return <section className="card p-6">
    <p className="label text-red-lit">Invite your section</p>
    <h2 className="mt-2 font-display text-4xl text-ink">Bring friends. Unlock rewards.</h2>
    <p className="mt-3 text-sm leading-relaxed text-muted">Friends earn their own free cards. You earn 100 referral points when they create a Fan account, plus 300 more when they make their first $10 supporter contribution.</p>
    <div className="mt-5 flex items-end gap-5"><div><p className="font-display text-5xl text-ink">{points}</p><p className="text-xs text-muted">referral points</p></div><div><p className="font-display text-3xl text-ink">{friends}</p><p className="text-xs text-muted">friends joined</p></div></div>
    <p className="mt-4 text-xs text-faint">At 500: digital badge · 1,000: merch-entry reward · 2,000: approved photo-op or premium experience. {Math.max(0, next - points)} points to the next reward.</p>
    <button onClick={share} className="btn btn-red mt-5 w-full">{copied ? "Invite link copied" : "Invite friends"}</button>
  </section>;
}

function SupporterRewards({ total }: { total: number }) {
  const tiers = [[10, "Supporter badge"], [25, "Merch-entry reward"], [50, "Exclusive merch claim"], [100, "Approved photo-op or premium experience"]] as const;
  const next = tiers.find(([amount]) => total < amount);
  return <section className="card p-6">
    <p className="label text-red-lit">Supporter rewards</p>
    <h2 className="mt-2 font-display text-4xl text-ink">Your support unlocks more.</h2>
    <p className="mt-3 text-sm text-muted">Your personal supporter total: <span className="font-semibold text-ink">${total}</span>. These are thank-you benefits, not game points or leaderboard advantages.</p>
    <div className="mt-5 space-y-2">{tiers.map(([amount, reward]) => <div key={amount} className={`flex items-center justify-between rounded-xl border p-3 text-sm ${total >= amount ? "border-green bg-green/10 text-ink" : "border-line text-muted"}`}><span>${amount} total</span><span className="font-semibold">{total >= amount ? "Unlocked · " : ""}{reward}</span></div>)}</div>
    <p className="mt-4 text-xs text-faint">{next ? `$${next[0] - total} more unlocks ${next[1]}.` : "All current supporter rewards unlocked."}</p>
    <Link href="/support/avery" className="btn btn-line mt-5 w-full">Explore optional support</Link>
  </section>;
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
