import { athleteBySlug, seedActivity, seedCampaign } from "../seed";
import type { Donation, LiveState } from "../types";
import type { GiveInput, LiveEvent, LiveSource } from "./types";

// Browser-only mock: state lives in localStorage and syncs across tabs of the
// same browser via BroadcastChannel. Cross-device sync (phone -> laptop) needs
// the Supabase source.

const KEY = "rtr:live:v1";
const CHANNEL = "rtr-live";

function seedState(): LiveState {
  return { campaign: { ...seedCampaign }, activity: seedActivity() };
}

function read(): LiveState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LiveState;
  } catch {}
  const s = seedState();
  write(s);
  return s;
}

function write(s: LiveState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function createMockSource(): LiveSource {
  const listeners = new Set<(e: LiveEvent) => void>();
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
  const emit = (e: LiveEvent) => listeners.forEach((l) => l(e));

  channel?.addEventListener("message", (m) => emit(m.data as LiveEvent));

  const publish = (e: LiveEvent) => {
    write(e.state);
    emit(e);
    channel?.postMessage(e);
  };

  return {
    async load() {
      return read();
    },
    async giveDemo({ athleteSlug, amount, supporterName, supportType }: GiveInput) {
      await new Promise((r) => setTimeout(r, 700)); // feels like a real request
      const prev = read();
      const athlete = athleteBySlug(athleteSlug);
      const donation: Donation = {
        id: `demo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        supporterName: supporterName.trim() || "Demo Judge",
        athleteSlug,
        athleteName: athlete?.name ?? athleteSlug,
        campaignName: prev.campaign.name,
        amount,
        supportType: supportType ?? "One-time supporter",
        thankYouPack: "Sent",
        status: "Received",
      };
      const state: LiveState = {
        campaign: {
          ...prev.campaign,
          raised: prev.campaign.raised + amount,
          supporters: prev.campaign.supporters + 1,
          fanContributions: prev.campaign.fanContributions + amount,
        },
        activity: [donation, ...prev.activity].slice(0, 50),
      };
      const e = { state, donation };
      publish(e);
      return e;
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async reset() {
      const state = seedState();
      publish({ state });
      return state;
    },
  };
}
