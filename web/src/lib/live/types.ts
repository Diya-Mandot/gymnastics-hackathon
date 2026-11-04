import type { Donation, LiveState } from "../types";

export type GiveInput = {
  athleteSlug: string;
  amount: number;
  supporterName: string;
  supportType?: Donation["supportType"];
};

export type LiveEvent = { state: LiveState; donation?: Donation };

/**
 * Everything the UI needs for the realtime demo. Pages only talk to this,
 * so swapping mock <-> Supabase is a config change.
 * NEVER calls a payment provider.
 */
export interface LiveSource {
  load(): Promise<LiveState>;
  giveDemo(input: GiveInput): Promise<LiveEvent>;
  subscribe(cb: (e: LiveEvent) => void): () => void;
  reset(passcode?: string): Promise<LiveState>;
}
