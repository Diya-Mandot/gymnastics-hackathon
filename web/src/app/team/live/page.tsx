"use client";

import Link from "next/link";
import { useState } from "react";
import { useArena } from "@/lib/arena";
import { athletes } from "@/lib/seed";
import type { MeetStatus, SpotlightType } from "@/lib/arena-model";

const spotlights: SpotlightType[] = ["athlete", "sponsor", "support", "fundraising", "milestone"];

export default function TeamLive() {
  // The competition controller is deliberately presentation-accessible. It is
  // a local, simulated controller; production access must be protected by WRTH.
  return <Controller />;
}

function Controller() {
  const arena = useArena();
  const { state } = arena;
  const [title, setTitle] = useState(state.meetTitle);
  const [milestoneTarget, setMilestoneTarget] = useState(String(state.milestoneTarget));
  const [fundraisingGoal, setFundraisingGoal] = useState(String(state.fundraisingGoal));
  const [resetNotice, setResetNotice] = useState("");

  function exportReport() {
    const header = ["timestamp", "event_type", "entity_id", "simulated", "amount_usd"].join(",");
    const rows = state.events.map((event) => [
      event.timestamp,
      event.type,
      event.entityId,
      "true",
      event.amount ?? "",
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rock-the-arena-simulated-events.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    if (!window.confirm("Reset this browser's simulated meet and event history? The shared supporter demo ledger is not changed.")) return;
    arena.reset();
    setResetNotice("Arena demo reset. Existing supporter and revenue records were not changed.");
  }

  const setStatus = (status: MeetStatus) => arena.setMeetStatus(status);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      {arena.error && <div role="alert" className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red/30 bg-red-soft p-4 text-sm text-ink"><p>{arena.error}</p><button onClick={arena.clearError} className="font-semibold text-red-lit">Dismiss</button></div>}
      {resetNotice && <p role="status" className="mb-5 rounded-xl bg-sand p-4 text-sm text-ink">{resetNotice}</p>}
      <p className="label text-red-lit">WRTH staff · meet-night simulation controller</p>
      <h1 className="mt-2 font-display text-6xl text-ink">Meet controller</h1>
      <p className="mt-3 text-muted">{state.status.toUpperCase()} · Rotation {state.rotation} · {state.meetTitle}</p>
      <p className="mt-2 text-sm text-muted">Offline demo mode · controls only update this browser and its open tabs. These controls never publish a real score or process a payment.</p>

      <section className="card mt-7 p-6">
        <h2 className="font-display text-3xl text-ink">Meet controls</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={arena.startDemoMeet} className="btn btn-red">Start Demo Meet</button>
          <button onClick={arena.advanceRotation} className="btn btn-line">Advance Rotation</button>
          <button onClick={arena.activateChallenge} className="btn btn-line">Activate current challenge</button>
          <button onClick={() => arena.setChallengeActive(!state.active)} className="btn btn-line">{state.active ? "Deactivate challenge" : "Activate challenge"}</button>
          <button onClick={reset} className="btn btn-line">Reset Arena demo</button>
          <button onClick={exportReport} className="btn btn-line">Export simulated event report</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-muted">Meet status<select className="input mt-2" value={state.status} onChange={(event) => setStatus(event.target.value as MeetStatus)}><option value="upcoming">Upcoming</option><option value="live">Live (demo)</option><option value="completed">Completed</option></select></label>
          <label className="text-sm text-muted">Current rotation<select className="input mt-2" value={state.rotation} onChange={(event) => arena.setRotation(Number(event.target.value))}>{[1, 2, 3, 4].map((rotation) => <option key={rotation} value={rotation}>{rotation} · {["Vault", "Balance Beam", "Uneven Bars", "Floor Exercise"][rotation - 1]}</option>)}</select></label>
          <label className="text-sm text-muted">Meet title<input className="input mt-2" maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} /><button className="mt-2 text-sm font-semibold text-red-lit" onClick={() => arena.setMeetTitle(title)}>Save meet title</button></label>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-3xl text-ink">Spotlight approval & placement</h2>
          <label className="mt-5 block text-sm text-muted">Featured athlete<select className="input mt-2" value={state.featuredAthleteSlug} onChange={(event) => arena.setFeaturedAthlete(event.target.value)}>{athletes.map((athlete) => <option key={athlete.slug} value={athlete.slug}>{athlete.name}</option>)}</select></label>
          <label className="mt-4 block text-sm text-muted">Active spotlight<select className="input mt-2" value={state.spotlight} onChange={(event) => arena.setSpotlight(event.target.value as SpotlightType)}>{spotlights.map((spotlight) => <option key={spotlight} value={spotlight}>{spotlight}</option>)}</select></label>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{spotlights.map((spotlight) => <label key={spotlight} className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm text-ink"><input type="checkbox" checked={state.approvedSpotlights.includes(spotlight)} onChange={(event) => arena.setSpotlightApproval(spotlight, event.target.checked)} />Approve {spotlight} content</label>)}</div>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={state.sponsorPlacementActive} onChange={(event) => arena.setSponsorPlacement(event.target.checked)} />Sponsor placement active (clearly labeled)</label>
          <p className="mt-4 text-xs text-faint">Only pre-approved demo content is available. Production athlete content needs the appropriate athlete and WRTH approvals.</p>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-3xl text-ink">Approved demo goals</h2>
          <label className="mt-5 block text-sm text-muted">Collective participation target<input className="input mt-2" min="1" step="1" type="number" value={milestoneTarget} onChange={(event) => setMilestoneTarget(event.target.value)} /><button className="mt-2 text-sm font-semibold text-red-lit" onClick={() => arena.setMilestoneTarget(Number(milestoneTarget))}>Save challenge target</button></label>
          <label className="mt-5 block text-sm text-muted">Simulated fundraising goal (USD)<input className="input mt-2" min="1" max="1000000" step="1" type="number" value={fundraisingGoal} onChange={(event) => setFundraisingGoal(event.target.value)} /><button className="mt-2 text-sm font-semibold text-red-lit" onClick={() => arena.setFundraisingGoal(Number(fundraisingGoal))}>Save simulated goal</button></label>
          <p className="mt-4 text-xs text-faint">No payment is processed. Goals, seed totals, and campaign activity are simulated; never present them as verified fundraising figures.</p>
        </div>
      </section>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link className="btn btn-red" href="/team/live/analytics">Open live analytics</Link>
        <Link className="btn btn-line" href="/live">Preview the fan experience</Link><Link className="btn btn-red" href="/live/qr">Show the arena QR code</Link>
        <Link className="btn btn-line" href="/sponsors">Open Sponsor Engine</Link>
      </div>
    </main>
  );
}
