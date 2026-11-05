"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Audience } from "@/lib/audience";

export const AUDIENCE_KEY = "rtr:audience:v1";

type Ctx = {
  audience: Audience | null;
  ready: boolean; // false until this device's sign-in has been read, so gates don't flash
  signIn: (a: Audience) => void;
  signOut: () => void;
};

const AudienceContext = createContext<Ctx>({ audience: null, ready: false, signIn: () => {}, signOut: () => {} });

function read(): Audience | null {
  try {
    const raw = localStorage.getItem(AUDIENCE_KEY);
    return raw ? (JSON.parse(raw) as Audience) : null;
  } catch {
    return null;
  }
}

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAudience(read());
    setReady(true);
    // Keep every open tab on the same identity.
    const onStorage = (e: StorageEvent) => e.key === AUDIENCE_KEY && setAudience(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((a: Audience) => {
    try { localStorage.setItem(AUDIENCE_KEY, JSON.stringify(a)); } catch {}
    setAudience(a);
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(AUDIENCE_KEY); } catch {}
    setAudience(null);
  }, []);

  return <AudienceContext.Provider value={{ audience, ready, signIn, signOut }}>{children}</AudienceContext.Provider>;
}

export const useAudience = () => useContext(AudienceContext);
