"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Audience, Group } from "@/lib/audience";
import type { AppRole, AuthProfile } from "@/lib/auth";

// The one sign-in for the whole site: a quick sign-up (name + role, no password), remembered on
// this device. Each person's role decides which group's view and navigation they get.

export const AUDIENCE_KEY = "rtr:audience:v2";

const roleForGroup: Record<Group, AppRole> = { supporter: "fan", business: "business", athlete: "athlete", team: "staff" };

type Ctx = {
  audience: Audience | null;
  /** The signed-in person in account form (id, name, role) for pages that need it. */
  profile: AuthProfile | null;
  ready: boolean; // false until this device's sign-in has been read, so gates don't flash
  signIn: (a: Omit<Audience, "id"> & { id?: string }) => Audience;
  signOut: () => Promise<void>;
};

const AudienceContext = createContext<Ctx>({
  audience: null, profile: null, ready: false,
  signIn: (a) => ({ ...a, id: "x" }) as Audience, signOut: async () => {},
});

function read(): Audience | null {
  try {
    const raw = localStorage.getItem(AUDIENCE_KEY);
    return raw ? (JSON.parse(raw) as Audience) : null;
  } catch {
    return null;
  }
}

const toProfile = (a: Audience): AuthProfile => ({ id: a.id, email: a.email ?? "", firstName: a.name ?? "", role: roleForGroup[a.group] });

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAudience(read());
    setReady(true);
    // Keep every open tab on the same person.
    const onStorage = (e: StorageEvent) => e.key === AUDIENCE_KEY && setAudience(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((a: Omit<Audience, "id"> & { id?: string }) => {
    const next: Audience = { ...a, id: a.id ?? `fan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}` };
    try { localStorage.setItem(AUDIENCE_KEY, JSON.stringify(next)); } catch {}
    setAudience(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    try { localStorage.removeItem(AUDIENCE_KEY); } catch {}
    setAudience(null);
  }, []);

  return (
    <AudienceContext.Provider value={{ audience, profile: audience ? toProfile(audience) : null, ready, signIn, signOut }}>
      {children}
    </AudienceContext.Provider>
  );
}

export const useAudience = () => useContext(AudienceContext);
