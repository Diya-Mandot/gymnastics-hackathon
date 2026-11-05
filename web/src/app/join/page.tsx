"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient, authConfigured, loadAuthProfile, type AppRole } from "@/lib/auth";

const roles: Exclude<AppRole, "staff">[] = ["fan", "business", "athlete"];

// useSearchParams (for ?ref= referral codes) needs a Suspense boundary so the page can prerender.
export default function Join() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl px-5 py-14 text-muted">Loading…</main>}>
      <JoinForm />
    </Suspense>
  );
}

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState(false);
  const [role, setRole] = useState<Exclude<AppRole, "staff">>("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const referralCode = searchParams.get("ref");
  async function recordReferral(userId: string) {
    const referrer = referralCode ?? localStorage.getItem("rtr:pending-referrer");
    if (!referrer || referrer === userId) return;
    localStorage.setItem("rtr:pending-referrer", referrer);
    await authClient().from("fan_referrals").insert({ referrer_id: referrer, referee_id: userId, status: "signed_up", points: 100 });
    localStorage.removeItem("rtr:pending-referrer");
  }
  async function go() {
    if (!authConfigured) return setMessage("Add the Supabase URL and publishable key to .env.local first.");
    const supabase = authClient();
    if (login) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return setMessage(error?.message ?? "Unable to log in.");
      await recordReferral(data.user.id);
      const profile = await loadAuthProfile(data.user);
      router.push(profile?.role === "staff" ? "/team/live" : profile?.role === "business" ? "/business" : profile?.role === "athlete" ? "/portal/avery" : "/fan");
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: name, role } } });
    if (error) return setMessage(error.message);
    if (!data.session) return setMessage("Check your inbox to confirm your account, then log in.");
    await recordReferral(data.user?.id ?? "");
    if (role === "fan") localStorage.setItem("rtr:new-fan-offer", "1");
    router.push(role === "business" ? "/business" : role === "athlete" ? "/portal/avery" : "/fan");
  }
  return <main className="mx-auto max-w-4xl px-5 py-14">
    <p className="label text-red-lit">Rock the Arena</p><h1 className="mt-3 font-display text-7xl text-ink">Claim your <em>place.</em></h1>
    <p className="mt-5 max-w-xl text-lg text-muted">Sign in to claim game-night rewards and open the experience built for you.</p>
    <div className="mt-8 flex gap-2"><button className={`btn !py-2 ${!login ? "btn-red" : "btn-line"}`} onClick={() => setLogin(false)}>Sign up</button><button className={`btn !py-2 ${login ? "btn-red" : "btn-line"}`} onClick={() => setLogin(true)}>Log in</button></div>
    {!login && <div className="mt-6 grid gap-3 sm:grid-cols-3">{roles.map((item) => <button key={item} onClick={() => setRole(item)} className={`rounded-2xl border p-5 text-left ${role === item ? "border-red bg-red-soft" : "border-line bg-surface"}`}><p className="font-display text-3xl capitalize text-ink">{item}</p><p className="mt-2 text-sm text-muted">{item === "fan" ? "Play, collect, and earn rewards." : item === "business" ? "Match and activate fans." : "Manage your story and approvals."}</p></button>)}</div>}
    <section className="card mt-6 max-w-xl p-6">{!login && <label className="block text-sm text-muted">First name<input className="input mt-2" value={name} onChange={(event) => setName(event.target.value)} /></label>}<label className={`${!login ? "mt-4 " : ""}block text-sm text-muted`}>Email<input className="input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="mt-4 block text-sm text-muted">Password<input className="input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{message && <p className="mt-3 text-sm text-red-lit">{message}</p>}<button className="btn btn-red mt-6 w-full" onClick={go}>{login ? "Log in" : "Create profile"}</button></section>
  </main>;
}
