"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Audience, Group } from "@/lib/audience";
import { authClient, authConfigured, loadAuthProfile, type AppRole, type AuthProfile } from "@/lib/auth";

// The one sign-in for the whole site: Supabase Auth (accounts made at /join).
// Each account's role decides which group's view and navigation the person gets.

const groupForRole: Record<AppRole, Group> = { fan: "supporter", business: "business", athlete: "athlete", staff: "team" };

type Ctx = {
  audience: Audience | null;
  /** The signed-in Supabase account, when there is one. */
  profile: AuthProfile | null;
  ready: boolean; // false until the session has been checked, so gates don't flash
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AudienceContext = createContext<Ctx>({ audience: null, profile: null, ready: false, signOut: async () => {}, refresh: async () => {} });

function toAudience(p: AuthProfile, athleteSlug?: string): Audience {
  const group = groupForRole[p.role];
  return {
    group,
    name: p.firstName || undefined,
    supporterType: group === "supporter" ? "fan" : undefined,
    athleteSlug: group === "athlete" ? athleteSlug ?? "avery" : undefined,
  };
}

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [ready, setReady] = useState(!authConfigured);

  const refresh = useCallback(async () => {
    if (!authConfigured) { setReady(true); return; }
    try {
      const { data } = await authClient().auth.getUser();
      const p = data.user ? await loadAuthProfile(data.user) : null;
      setProfile(p);
      setAudience(p ? toAudience(p, data.user?.user_metadata?.athlete_slug as string | undefined) : null);
    } catch {
      // No session or Supabase unreachable: the public site keeps working signed out.
      setProfile(null);
      setAudience(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!authConfigured) return;
    const { data } = authClient().auth.onAuthStateChange(() => { void refresh(); });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try { if (authConfigured) await authClient().auth.signOut(); } catch {}
    setProfile(null);
    setAudience(null);
  }, []);

  return <AudienceContext.Provider value={{ audience, profile, ready, signOut, refresh }}>{children}</AudienceContext.Provider>;
}

export const useAudience = () => useContext(AudienceContext);
