"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, authConfigured, loadAuthProfile, type AuthProfile } from "@/lib/auth";

const dashboardFor = (role: AuthProfile["role"]) => ({
  fan: "/fan",
  business: "/business",
  athlete: "/portal/avery",
  staff: "/team/live",
})[role];

export function ProfileMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [ready, setReady] = useState(!authConfigured);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authConfigured) return;
    const client = authClient();
    let mounted = true;
    async function refresh() {
      const { data } = await client.auth.getUser();
      if (!mounted) return;
      setProfile(data.user ? await loadAuthProfile(data.user) : null);
      setReady(true);
    }
    refresh();
    const { data: listener } = client.auth.onAuthStateChange(() => { refresh(); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    if (authConfigured) await authClient().auth.signOut();
    setProfile(null);
    setOpen(false);
    router.push("/join");
    router.refresh();
  }

  if (!ready) return <div className="fixed right-4 top-4 z-[210] grid h-11 w-11 place-items-center rounded-full bg-surface text-xs text-muted shadow-xl" aria-label="Loading account">…</div>;
  if (!profile) return <Link href="/join" className="fixed right-4 top-4 z-[210] inline-flex h-11 items-center gap-2 rounded-full bg-red px-4 text-sm font-semibold text-white shadow-xl hover:bg-red-lit"><span aria-hidden="true">◎</span> Sign in</Link>;

  const initials = profile.firstName.slice(0, 2).toUpperCase();
  return <div className="fixed right-4 top-4 z-[210]">
    <button onClick={() => setOpen((value) => !value)} className="grid h-11 min-w-11 place-items-center rounded-full border border-white/20 bg-ink px-3 text-sm font-bold text-paper shadow-xl hover:border-red-lit" aria-expanded={open} aria-label="Open profile menu">
      {initials}
    </button>
    {open && <section className="absolute right-0 mt-2 w-60 rounded-2xl border border-line bg-surface p-4 shadow-2xl">
      <p className="text-sm font-semibold text-ink">{profile.firstName}</p>
      <p className="mt-1 text-xs capitalize text-muted">{profile.role} account · signed in</p>
      <Link href={dashboardFor(profile.role)} onClick={() => setOpen(false)} className="btn btn-line mt-4 w-full !py-2.5 text-sm">Open my dashboard</Link>
      <button onClick={signOut} className="mt-3 w-full rounded-full px-3 py-2 text-sm font-semibold text-red-lit hover:bg-red-soft">Sign out</button>
    </section>}
  </div>;
}
