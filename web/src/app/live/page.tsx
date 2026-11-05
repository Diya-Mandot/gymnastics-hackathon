"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient, authConfigured } from "@/lib/auth";
const options = ["Vault", "Balance Beam", "Floor Exercise"];
export default function Live() {
  const [answer, setAnswer] = useState<string | null>(null); const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { if (authConfigured) authClient().auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user))); }, []);
  const correct = answer === "Balance Beam";
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
    {answer && <RewardModal signedIn={signedIn} correct={correct} />}
    <div className="flex items-center justify-between"><div><p className="label text-red-lit">Rock the Arena · Demo Live</p><h1 className="mt-2 font-display text-6xl text-ink">Every rotation. <em>Every fan.</em></h1></div><p className="tag">225 pts</p></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.7fr_0.8fr]"><section className="card p-6"><p className="text-sm text-muted">Rotation 2 of 4 · Balance Beam</p><h2 className="mt-3 font-display text-4xl text-ink">Routine IQ</h2><p className="mt-5 text-xl text-ink">Which apparatus is approximately 10 centimeters wide?</p><div className="mt-5 grid gap-3">{options.map((option) => <button disabled={Boolean(answer)} key={option} onClick={() => setAnswer(option)} className="rounded-xl border border-line bg-surface px-5 py-4 text-left hover:border-red">{option}</button>)}</div></section><aside className="card p-6"><p className="label">Meet-night Spotlight</p><h2 className="mt-3 font-display text-3xl text-ink">Meet Avery Davis</h2><p className="mt-3 text-sm leading-relaxed text-muted">Her story turns a fall on beam into confidence for young gymnasts.</p><Link href="/athletes/avery" className="btn btn-line mt-5 w-full">Watch her story</Link><Link href="/live/meet" className="btn btn-line mt-2 w-full">Meet progress</Link></aside></div>
  </main>;
}
function RewardModal({ signedIn, correct }: { signedIn: boolean; correct: boolean }) { return <div className="fixed inset-0 z-[100] grid place-items-end bg-black/60 p-4 sm:place-items-center"><section className="card max-w-md p-7"><p className="label text-red-lit">Challenge complete</p><h2 className="mt-3 font-display text-5xl text-ink">{correct ? "You unlocked Avery’s card." : "You completed Routine IQ."}</h2><p className="mt-4 text-muted">{correct ? "Claim 100 points and add the card to your collection." : "Claim your participation reward and get the next challenge."}</p>{signedIn ? <Link href="/live/cards" className="btn btn-red mt-6 w-full">Claim reward</Link> : <><Link href="/join" className="btn btn-red mt-6 w-full">Sign up to claim reward</Link><Link href="/join" className="btn btn-line mt-2 w-full">Log in</Link></>}</section></div> }
