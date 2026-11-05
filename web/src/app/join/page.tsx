"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAudience } from "@/components/AudienceProvider";
import { authClient, authConfigured, homeForRole, loadAuthProfile, type AppRole } from "@/lib/auth";
import { markPendingEntry } from "@/lib/raffle";

// The one sign-in page for the whole site (Supabase Auth).
// ?next=/path returns people where they were going · ?role=fan preselects a role ·
// ?mode=login opens the log-in tab · ?from=qr is the in-arena game flow (enters the raffle) · ?ref= is a referral.

type SignupRole = Exclude<AppRole, "staff">;
const roles: { id: SignupRole; title: string; body: string }[] = [
  { id: "fan", title: "Fan", body: "Play, collect cards, earn rewards and enter raffles." },
  { id: "business", title: "Business", body: "Get matched with athletes and run a campaign." },
  { id: "athlete", title: "Athlete", body: "Manage your story, deals and approvals." },
];

// Only allow returning to a path on this site.
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
  const { profile, ready } = useAudience();
  const fromQr = params.get("from") === "qr";
  const next = safeNext(params.get("next"));
  const presetRole = params.get("role") as SignupRole | null;
  const [login, setLogin] = useState(params.get("mode") === "login");
  const [role, setRole] = useState<SignupRole>(presetRole && roles.some((r) => r.id === presetRole) ? presetRole : "fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const referralCode = params.get("ref");

  useEffect(() => {
    try { setReward(localStorage.getItem("rtr:pending-reward")); } catch {}
  }, []);

  async function recordReferral(userId: string) {
    const referrer = referralCode ?? localStorage.getItem("rtr:pending-referrer");
    if (!referrer || referrer === userId) return;
    localStorage.setItem("rtr:pending-referrer", referrer);
    await authClient().from("fan_referrals").insert({ referrer_id: referrer, referee_id: userId, status: "signed_up", points: 100 });
    localStorage.removeItem("rtr:pending-referrer");
  }

  /** People who came from the arena QR game get tonight's raffle entry once they have an account. */
  function markRaffle() {
    if (fromQr) markPendingEntry();
  }

  async function go(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!authConfigured) return setMessage("Sign-in isn’t set up on this copy of the site yet (missing Supabase settings).");
    setBusy(true);
    try {
      const supabase = authClient();
      if (login) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return setMessage(error?.message ?? "Unable to log in.");
        await recordReferral(data.user.id);
        markRaffle();
        const p = await loadAuthProfile(data.user);
        router.push(next ?? homeForRole(p?.role ?? "fan"));
        return;
      }
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: name, role } } });
      if (error) return setMessage(error.message);
      if (!data.session) return setMessage("Check your inbox to confirm your email, then come back and log in.");
      await recordReferral(data.user?.id ?? "");
      if (role === "fan") localStorage.setItem("rtr:new-fan-offer", "1");
      markRaffle();
      router.push(next ?? homeForRole(role));
    } finally {
      setBusy(false);
    }
  }

  // Already signed in: no need to ask again.
  if (ready && profile) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <p className="label text-red-lit">You’re signed in</p>
        <h1 className="mt-3 font-display text-6xl text-ink">Hi, <em>{profile.firstName || "there"}.</em></h1>
        <p className="mt-4 text-muted">Signed in as {profile.email} ({profile.role} account).</p>
        <button className="btn btn-red mt-7" onClick={() => { markRaffle(); router.push(next ?? homeForRole(profile.role)); }}>Continue</button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_0.9fr] lg:py-16">
      <div>
        <p className="label text-red-lit">{fromQr ? "Rock the Arena · meet night" : "Rock the Routine"}</p>
        <h1 className="mt-3 font-display text-[clamp(48px,7vw,84px)] leading-[0.95] text-ink">
          {fromQr ? <>Collect your <em>reward.</em></> : login ? <>Welcome <em>back.</em></> : <>Claim your <em>place.</em></>}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {fromQr
            ? "Create a free fan account to save your reward and enter tonight’s raffle. It takes 20 seconds."
            : "One account for everything: fans play and collect, businesses get matched, athletes manage their story."}
        </p>

        {fromQr && (
          <div className="mt-6 flex flex-wrap gap-3">
            {reward && <span className="rounded-full bg-gold-soft px-3 py-1.5 text-sm font-semibold text-gold">🃏 {reward}</span>}
            <span className="rounded-full bg-red-soft px-3 py-1.5 text-sm font-semibold text-red-dark">🎟️ Tonight’s raffle entry</span>
          </div>
        )}

        <div className="mt-8 inline-flex rounded-full border border-line p-1" role="tablist" aria-label="Sign up or log in">
          <button role="tab" aria-selected={!login} className={`rounded-full px-5 py-2 text-sm font-semibold ${!login ? "bg-red text-white" : "text-muted"}`} onClick={() => setLogin(false)}>Sign up</button>
          <button role="tab" aria-selected={login} className={`rounded-full px-5 py-2 text-sm font-semibold ${login ? "bg-red text-white" : "text-muted"}`} onClick={() => setLogin(true)}>Log in</button>
        </div>

        {!login && !fromQr && (
          <fieldset className="mt-6">
            <legend className="text-sm text-muted">I’m joining as a…</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {roles.map((r) => (
                <button type="button" key={r.id} onClick={() => setRole(r.id)} aria-pressed={role === r.id}
                  className={`rounded-2xl border p-4 text-left transition-colors ${role === r.id ? "border-red bg-red-soft" : "border-line bg-surface hover:border-ink/40"}`}>
                  <p className="font-display text-2xl text-ink">{r.title}</p>
                  <p className="mt-1 text-sm text-muted">{r.body}</p>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <form className="card mt-6 max-w-xl p-6" onSubmit={go}>
          {!login && (
            <label className="block text-sm text-muted">First name
              <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" />
            </label>
          )}
          <label className={`${!login ? "mt-4 " : ""}block text-sm text-muted`}>Email
            <input className="input mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="mt-4 block text-sm text-muted">Password
            <input className="input mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={login ? "current-password" : "new-password"} />
          </label>
          {message && <p role="alert" className="mt-3 text-sm text-red-lit">{message}</p>}
          <button className="btn btn-red mt-6 w-full" disabled={busy}>
            {busy ? "One moment…" : login ? "Log in" : fromQr ? "Create account & collect" : "Create account"}
          </button>
          {login && <p className="mt-3 text-xs text-faint">WRTH staff accounts are set up by WRTH; log in here with the details you were given.</p>}
        </form>
        <p className="mt-4 text-sm text-muted">Just browsing? <Link href="/athletes" className="link">Meet the athletes</Link> without an account.</p>
      </div>

      <div className="relative hidden overflow-hidden rounded-[28px] lg:block">
        <Image src="/images/fan-signs-2.jpg" alt="A family with handmade Red Rocks signs in the stands" fill sizes="45vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_14_13/0.85),transparent_55%)]" />
        <p className="absolute bottom-6 left-6 right-6 font-display text-4xl text-white">Every routine ends. <em className="text-red-lit">Its impact shouldn’t.</em></p>
      </div>
    </main>
  );
}
