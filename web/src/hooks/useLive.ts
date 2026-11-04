"use client";

import { useCallback, useEffect, useState } from "react";
import { getLiveSource, type GiveInput } from "@/lib/live";
import { seedCampaign } from "@/lib/seed";
import type { Donation, LiveState } from "@/lib/types";

// Server render + first client paint use the seed so there's no hydration mismatch.
const initial: LiveState = { campaign: seedCampaign, activity: [] };

export function useLive() {
  const [state, setState] = useState<LiveState>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDonation, setLastDonation] = useState<Donation | null>(null);

  useEffect(() => {
    const src = getLiveSource();
    let alive = true;
    src
      .load()
      .then((s) => alive && (setState(s), setReady(true)))
      .catch((e) => alive && setError(String(e?.message ?? e)));
    const off = src.subscribe((e) => {
      setState(e.state);
      if (e.donation) setLastDonation(e.donation);
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  const give = useCallback(async (input: GiveInput) => {
    const e = await getLiveSource().giveDemo(input);
    setState(e.state);
    if (e.donation) setLastDonation(e.donation);
    return e;
  }, []);

  const reset = useCallback(async (passcode?: string) => {
    setState(await getLiveSource().reset(passcode));
    setLastDonation(null);
  }, []);

  return { ...state, ready, error, lastDonation, give, reset };
}
