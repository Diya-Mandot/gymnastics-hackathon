"use client";

import { useCallback, useEffect, useState } from "react";
import type { Deal } from "./dealModel";

export { dealTotals, isSigned, STAGES } from "./dealModel";
export type { Deal, DealTask, Stage } from "./dealModel";

// Sample sponsor opportunities (fictional) shared by the Athlete Portal, admin and revenue views.
// Stored in localStorage so stage changes, approvals and payments persist across pages in the demo.

const seedDeals: Deal[] = [
  {
    id: "d-brightpath", sponsor: "BrightPath Family Wellness", athleteSlug: "avery", packageName: "Impact Routine", amount: 15000,
    stage: "Campaign", collected: 7500, athleteApproval: "approved", owner: "WRTH partnerships", nextAction: "Collect second installment after meet night", followUp: "Nov 22",
    tasks: [
      { id: "t1", title: "Record 45s story video", owner: "Athlete", due: "Nov 4", done: true },
      { id: "t2", title: "Approve social creative", owner: "Athlete", due: "Nov 6", done: false },
      { id: "t3", title: "Publish QR campaign page", owner: "WRTH team", due: "Nov 6", done: true },
      { id: "t4", title: "Send sponsor offer artwork", owner: "Sponsor", due: "Nov 8", done: false },
      { id: "t5", title: "Meet-night activation", owner: "WRTH team", due: "Nov 21", done: false },
      { id: "t6", title: "Submit NIL deal disclosure for review", owner: "WRTH team", due: "Nov 7", done: false },
    ],
  },
  {
    id: "d-arches", sponsor: "Little Arches Pediatrics", athleteSlug: "mia", packageName: "Impact Routine", amount: 15000,
    stage: "Meeting", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Send proposal draft after Thursday's meeting", followUp: "Nov 7",
    tasks: [
      { id: "t1", title: "Confirm adaptive clinic date", owner: "Athlete", due: "Nov 10", done: false },
      { id: "t2", title: "Draft proposal", owner: "WRTH team", due: "Nov 8", done: false },
    ],
  },
  {
    id: "d-canyon", sponsor: "Canyon Byte Learning Lab", athleteSlug: "sofia", packageName: "Community Spark", amount: 5000,
    stage: "Proposal", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Follow up on proposal", followUp: "Nov 9",
    tasks: [
      { id: "t1", title: "Review Flip Science proposal", owner: "Athlete", due: "Nov 8", done: false },
      { id: "t2", title: "Share classroom visit dates", owner: "Sponsor", due: "Nov 12", done: false },
    ],
  },
  {
    id: "d-wasatch", sponsor: "Wasatch Peak Credit Union", athleteSlug: "jordan", packageName: "Red Rocks Partner", amount: 50000,
    stage: "Contacted", collected: 0, athleteApproval: "pending", owner: "WRTH partnerships", nextAction: "Book intro meeting with marketing lead", followUp: "Nov 11",
    tasks: [{ id: "t1", title: "Prepare multi-athlete concept", owner: "WRTH team", due: "Nov 11", done: false }],
  },
];

const KEY = "rtr:deals:v2";
const CHANNEL = "rtr-deals";

function read(): Deal[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Deal[];
  } catch {}
  return seedDeals;
}

function write(deals: Deal[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(deals));
  } catch {}
  if (typeof BroadcastChannel !== "undefined") new BroadcastChannel(CHANNEL).postMessage(deals);
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>(seedDeals);

  useEffect(() => {
    setDeals(read());
    const ch = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
    ch?.addEventListener("message", (m) => setDeals(m.data as Deal[]));
    return () => ch?.close();
  }, []);

  const update = useCallback((id: string, fn: (d: Deal) => Deal) => {
    setDeals((prev) => {
      const next = prev.map((d) => (d.id === id ? fn(d) : d));
      write(next);
      return next;
    });
  }, []);

  const add = useCallback((deal: Deal) => {
    setDeals((prev) => {
      if (prev.some((d) => d.id === deal.id)) return prev;
      const next = [...prev, deal];
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    write(seedDeals);
    setDeals(seedDeals);
  }, []);

  return { deals, update, add, reset };
}
