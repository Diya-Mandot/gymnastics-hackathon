"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAudience } from "@/components/AudienceProvider";
import type { Group } from "@/lib/audience";
import { homeForRole, type AppRole } from "@/lib/auth";
import { markPendingEntry } from "@/lib/raffle";
import { athletes } from "@/lib/seed";

// The one sign-in for the whole site: a quick sign-up, no password, remembered on this device.
// ?next=/path returns people where they were going · ?role=fan|business|athlete|staff preselects ·
// ?from=qr is the in-arena game flow (fans only; enters tonight's raffle) · ?ref= is a referral.

const choices: { role: AppRole; group: Group; title: string; body: string }[] = [
  { role: "fan", group: "supporter", title: "Fan", body: "Play, collect cards, earn rewards, enter raffles." },
  { role: "business", group: "business", title: "Business", body: "Get matched with athletes and run a campaign." },
  { role: "athlete", group: "athlete", title: "Athlete", body: "Your story, deals and approvals." },
  { role: "staff", group: "team", title: "WRTH team", body: "Live control, sponsors and revenue." },
];

const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : null);

export default function Join() {
  // useSearchParams needs a Suspense boundary so the page can prerender.
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl px-5 py-14 text-muted">Loading…</main>}>
      <JoinForm />
    </Suspense>
  );
}

function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { profile, ready, signIn } = useAudience();
  const fromQr = params.get("from") === "qr";
  const next = safeNext(params.get("next"));
  const preset = params.get("role") as AppRole | null;
  const [role, setRole] = useState<AppRole>(fromQr ? "fan" : choices.some((c) => c.role === preset) ? preset! : "fan");
  const [athleteSlug, setAthleteSlug] = useState(athletes[0].slug);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reward, setReward] = useState<string | null>(null);

  useEffect(() => {
    try {
      setReward(localStorage.getItem("rtr:pending-reward"));
      const ref = params.get("ref");
      if (ref) localStorage.setItem("rtr:pending-referrer", ref);
    } catch {}
  }, [params]);

  function finish(r: AppRole, slug?: string) {
    if (fromQr) markPendingEntry(); // played the arena game: raffle ticket once signed in
    router.push(next ?? (r === "athlete" ? `/portal/${slug ?? athleteSlug}` : homeForRole(r)));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const choice = choices.find((c) => c.role === role)!;
    const isAthlete = choice.group === "athlete";
    signIn({
      group: choice.group,
      name: isAthlete ? athletes.find((a) => a.slug === athleteSlug)?.firstName : name.trim() || undefined,
      email: email.trim() || undefined,
      supporterType: choice.group === "supporter" ? "fan" : undefined,
      athleteSlug: isAthlete ? athleteSlug : undefined,
    });
    if (role === "fan") try { localStorage.setItem("rtr:new-fan-offer", "1"); } catch {}
    finish(role);
  }

  // Already signed in on this device: never ask again.
  if (ready && profile) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <p className="label text-red-lit">You’re signed in</p>
        <h1 className="mt-3 font-display text-6xl text-ink">Hi, <em>{profile.firstName || "there"}.</em></h1>
        <p className="mt-4 text-muted">You’re using this site as a {profile.role === "staff" ? "WRTH team member" : profile.role}.</p>
        <button className="btn btn-red mt-7" onClick={() => finish(profile.role)}>Continue</button>
      </main>
    );
  }

  const isAthlete = role === "athlete";

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-16">
      <div>
        <p className="label text-red-lit">{fromQr ? "Rock the Arena · meet night" : "Rock the Routine"}</p>
        <h1 className="mt-3 font-display text-[clamp(48px,7vw,84px)] leading-[0.95] text-ink">
          {fromQr ? <>Collect your <em>reward.</em></> : <>Jump <em>in.</em></>}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {fromQr
            ? "Add your first name to save your reward and get a ticket for tonight’s raffle. No password, done in seconds."
            : "Tell us who you are and we’ll show you the parts of the site made for you. No password needed."}
        </p>

        {fromQr && (
          <div className="mt-6 flex flex-wrap gap-3">
            {reward && <span className="rounded-full bg-gold-soft px-3 py-1.5 text-sm font-semibold text-gold">🃏 {reward}</span>}
            <span className="rounded-full bg-red-soft px-3 py-1.5 text-sm font-semibold text-red-dark">🎟️ Tonight’s raffle entry</span>
          </div>
        )}

        {!fromQr && (
          <fieldset className="mt-8">
            <legend className="text-sm text-muted">I’m a…</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {choices.map((c) => (
                <button type="button" key={c.role} onClick={() => setRole(c.role)} aria-pressed={role === c.role}
                  className={`rounded-2xl border p-4 text-left transition-colors ${role === c.role ? "border-red bg-red-soft" : "border-line bg-surface hover:border-ink/40"}`}>
                  <p className="font-display text-2xl text-ink">{c.title}</p>
                  <p className="mt-1 text-sm text-muted">{c.body}</p>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <form className="card mt-6 max-w-xl p-6" onSubmit={submit}>
          {isAthlete ? (
            <label className="block text-sm text-muted">Which athlete are you?
              <select className="input mt-2" value={athleteSlug} onChange={(e) => setAthleteSlug(e.target.value)}>
                {athletes.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </label>
          ) : (
            <label className="block text-sm text-muted">{role === "business" ? "Business name" : "First name"}
              <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} required autoComplete={role === "business" ? "organization" : "given-name"} />
            </label>
          )}
          {!isAthlete && (
            <label className="mt-4 block text-sm text-muted">Email <span className="text-faint">(optional, for raffle and reward updates)</span>
              <input className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          )}
          <button className="btn btn-red mt-6 w-full">{fromQr ? "Collect my reward" : "Continue"}</button>
          <p className="mt-3 text-xs text-faint">Demo sign-up: no password, remembered on this device only.</p>
        </form>
        <p className="mt-4 text-sm text-muted">Just browsing? <Link href="/athletes" className="link">Meet the athletes</Link> without signing up.</p>
      </div>

      <div className="relative hidden overflow-hidden rounded-[28px] lg:block">
        <Image src="/images/fan-signs-2.jpg" alt="A family with handmade Red Rocks signs in the stands" fill sizes="45vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_14_13/0.85),transparent_55%)]" />
        <p className="absolute bottom-6 left-6 right-6 font-display text-4xl text-white">Every routine ends. <em className="text-red-lit">Its impact shouldn’t.</em></p>
      </div>
    </main>
  );
}
