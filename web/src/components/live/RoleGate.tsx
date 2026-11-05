"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient, authConfigured, loadAuthProfile, type AppRole, type AuthProfile } from "@/lib/auth";
import type { Group } from "@/lib/audience";
import { useAudience } from "@/components/AudienceProvider";

// The demo sign-in (/signin) and real accounts (/join) both count, so nobody is asked to sign in twice.
const roleForGroup: Record<Group, AppRole> = { supporter: "fan", business: "business", athlete: "athlete", team: "staff" };

export function RoleGate({ roles, children }: { roles: AppRole[]; children: React.ReactNode | ((p: AuthProfile) => React.ReactNode) }) {
  const { audience, ready } = useAudience();
  const [account, setAccount] = useState<AuthProfile | null | undefined>(undefined);

  useEffect(() => {
    if (!authConfigured) { setAccount(null); return; }
    authClient().auth.getUser()
      .then(async ({ data }) => setAccount(data.user ? await loadAuthProfile(data.user) : null))
      .catch(() => setAccount(null));
  }, []);

  const demo: AuthProfile | null = audience
    ? { id: `demo-${audience.group}`, email: "", firstName: audience.name || "Demo", role: roleForGroup[audience.group] }
    : null;
  const profile = account && roles.includes(account.role) ? account : demo && roles.includes(demo.role) ? demo : account ?? demo;

  if (account === undefined || !ready) return <p className="p-8 text-muted">Loading your profile…</p>;
  if (!profile || !roles.includes(profile.role)) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24">
        <p className="label">Reward locked</p>
        <h1 className="mt-3 font-display text-6xl text-ink">Sign in to <em>claim it.</em></h1>
        <p className="mt-4 text-muted">Create a profile or log in to access this experience.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/join" className="btn btn-red">Sign up or log in</Link>
          <Link href="/signin" className="btn btn-line">Use the demo sign-in</Link>
        </div>
      </div>
    );
  }
  return <>{typeof children === "function" ? children(profile) : children}</>;
}
