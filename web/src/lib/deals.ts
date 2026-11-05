"use client";

import { useCallback, useEffect, useState } from "react";
import { fromDealRow, seedDeals, type Deal, type DealRow } from "./dealModel";
import { getSupabaseClient } from "./live";

export { dealTotals, isSigned, STAGES } from "./dealModel";
export type { Deal, DealTask, Stage } from "./dealModel";

/**
 * One shared deal store for Sponsor Scout, the CRM, athlete approvals, the admin dashboard
 * and the revenue dashboard.
 *
 * - Supabase configured: records live in public.demo_deals. Every page reads the same rows,
 *   writes go through the save_demo_deal RPC, and realtime pushes changes to every open screen
 *   (laptop, phone, other tabs).
 * - Mock mode, or the demo_deals migration not applied yet: falls back to localStorage plus a
 *   BroadcastChannel, so the demo still works in one browser.
 */

export type DealSync = "loading" | "supabase" | "local";

type Snapshot = { deals: Deal[]; sync: DealSync; error: string | null };

const KEY = "rtr:deals:v4"; // v4: real athletes (camie / clara / ella)
const CHANNEL = "rtr-deals";
const DEALS_COLUMNS =
  "id, sponsor, athlete_slug, package_name, amount, stage, collected, athlete_approval, owner, next_action, follow_up, tasks, sort_order";

let snap: Snapshot = { deals: seedDeals, sync: "loading", error: null };
const listeners = new Set<(s: Snapshot) => void>();
let started = false;

function emit(next: Partial<Snapshot>) {
  snap = { ...snap, ...next };
  listeners.forEach((l) => l(snap));
}

// ---------- local fallback ----------

function readLocal(): Deal[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Deal[];
  } catch {}
  return seedDeals;
}

function writeLocal(deals: Deal[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(deals));
  } catch {}
  if (typeof BroadcastChannel !== "undefined") {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage(deals);
    ch.close();
  }
}

function startLocal(error: string | null) {
  emit({ deals: readLocal(), sync: "local", error });
  if (typeof BroadcastChannel !== "undefined") {
    new BroadcastChannel(CHANNEL).addEventListener("message", (m) => emit({ deals: m.data as Deal[] }));
  }
}

// ---------- Supabase ----------

const toPayload = (d: Deal, sortOrder: number) => ({ ...d, sortOrder });

/** Supabase errors are plain objects, not Error instances. */
const messageOf = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);

async function loadRemote(): Promise<Deal[]> {
  const db = getSupabaseClient()!;
  const { data, error } = await db.from("demo_deals").select(DEALS_COLUMNS).order("sort_order").order("created_at");
  if (error) throw error;
  return (data as DealRow[]).map(fromDealRow);
}

async function saveRemote(deal: Deal, sortOrder: number) {
  const { error } = await getSupabaseClient()!.rpc("save_demo_deal", { p_deal: toPayload(deal, sortOrder) });
  if (error) throw error;
}

async function refresh() {
  try {
    emit({ deals: await loadRemote(), error: null });
  } catch (e) {
    emit({ error: messageOf(e) || "Could not load deals." });
  }
}

async function startRemote() {
  const db = getSupabaseClient()!;
  try {
    let deals = await loadRemote();
    if (deals.length === 0) {
      // First run on a fresh database: seed the sample deals once (upsert, so it is safe if two screens race).
      await Promise.all(seedDeals.map((d, i) => saveRemote(d, i)));
      deals = await loadRemote();
    }
    emit({ deals, sync: "supabase", error: null });
  } catch (e) {
    // Most likely the demo_deals migration hasn't been applied; keep the demo running locally.
    const message = messageOf(e);
    console.warn("[deals] Supabase unavailable, using this browser only:", message);
    startLocal(`Deals are saved in this browser only (${message}).`);
    return;
  }
  db.channel("rtr-demo-deals")
    .on("postgres_changes", { event: "*", schema: "public", table: "demo_deals" }, () => void refresh())
    .subscribe();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (getSupabaseClient()) void startRemote();
  else startLocal(null);
}

// ---------- mutations ----------

function persist(deal: Deal) {
  // Always keep a local copy, so a change made while Supabase is still loading (or unreachable) is never lost.
  writeLocal(snap.deals);
  if (snap.sync === "supabase" || (snap.sync === "loading" && getSupabaseClient())) {
    const sortOrder = snap.deals.findIndex((d) => d.id === deal.id);
    saveRemote(deal, Math.max(0, sortOrder)).catch((e) => {
      if (snap.sync !== "supabase") return; // fell back to this browser; the local copy above already has it
      emit({ error: `Couldn't save "${deal.sponsor}": ${messageOf(e)}` });
      void refresh(); // roll the optimistic change back to what the database has
    });
  }
}

function updateDeal(id: string, fn: (d: Deal) => Deal) {
  const current = snap.deals.find((d) => d.id === id);
  if (!current) return;
  const next = fn(current);
  emit({ deals: snap.deals.map((d) => (d.id === id ? next : d)) });
  persist(next);
}

function addDeal(deal: Deal) {
  if (snap.deals.some((d) => d.id === deal.id)) return;
  emit({ deals: [...snap.deals, deal] });
  persist(deal);
}

/**
 * Restore the sample deals. With Supabase the server reset route (/api/demo/reset) has already
 * rewritten demo_deals using the service role, so this only reloads.
 */
function resetDeals() {
  if (snap.sync === "supabase") {
    void refresh();
  } else {
    emit({ deals: seedDeals });
    writeLocal(seedDeals);
  }
}

export function useDeals() {
  const [state, setState] = useState<Snapshot>(snap);

  useEffect(() => {
    listeners.add(setState);
    start();
    setState(snap);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const update = useCallback(updateDeal, []);
  const add = useCallback(addDeal, []);
  const reset = useCallback(resetDeals, []);

  return { deals: state.deals, sync: state.sync, error: state.error, update, add, reset };
}
