"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLive } from "@/hooks/useLive";
import { isMockSource } from "@/lib/live";
import { compact, timeAgo, usd } from "@/lib/labels";
import { isSigned, useDeals } from "@/lib/deals";
import { athleteBySlug, seedFanActions, tasks } from "@/lib/seed";
import type { Donation, FanAction } from "@/lib/types";
import { AdminTabs } from "./AdminTabs";
import { AnimatedNumber } from "./AnimatedNumber";
import { ChalkArc } from "./ChalkArc";
import { LiveDot, ProgressBar } from "./CampaignProgress";
import { Wordmark } from "./Wordmark";

function useNow(ms = 10_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function AdminDashboard({ presenter = false }: { presenter?: boolean }) {
  const { campaign, activity, lastDonation, reset, ready, error } = useLive();
  const { deals, reset: resetDeals } = useDeals();
  const now = useNow();
  const [fanActions, setFanActions] = useState<FanAction[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setFanActions(seedFanActions()), []);

  const pct = Math.round((campaign.raised / campaign.goal) * 100);
  const featured = lastDonation ?? activity[0] ?? null;

  return (
    <div className={`mx-auto max-w-7xl px-4 pb-20 sm:px-8 ${presenter ? "pt-10" : ""}`}>
      {presenter ? (
        <div className="mb-10">
          <Wordmark />
        </div>
      ) : (
        <AdminTabs active="live" />
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <LiveDot label={ready ? "Live" : "Connecting"} />
            {isMockSource() && <span className="text-xs text-faint">Mock data · syncs across tabs</span>}
          </div>
          {presenter && <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">WRTH <em>Admin</em></h1>}
          <p className="mt-2 text-muted">{campaign.name} · {campaign.partner}</p>
        </div>
        <div className="flex items-center gap-2">
          {confirmReset ? (
            <>
              <span className="text-sm text-muted">Restore seeded numbers?</span>
              <button
                className="btn btn-ink !py-2 text-sm"
                onClick={async () => {
                  await reset();
                  resetDeals();
                  try {
                    Object.keys(localStorage).filter((k) => k.startsWith("rtr:mediakit:")).forEach((k) => localStorage.removeItem(k));
                  } catch {}
                  setConfirmReset(false);
                }}
              >
                Reset
              </button>
              <button className="btn btn-line !py-2 text-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-line !py-2 text-sm" onClick={() => setConfirmReset(true)}>Reset demo</button>
          )}
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-soft p-4 text-sm text-red-dark">
          Couldn’t reach the live backend: {error}
        </p>
      )}

      {/* The reveal */}
      <section className="mt-8" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {featured && (
            <motion.div
              key={featured.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className={`relative overflow-hidden rounded-[24px] p-6 sm:p-9 ${lastDonation ? "bg-red text-white" : "card"}`}
            >
              {lastDonation && <ChalkArc className="pointer-events-none absolute -right-10 top-0 h-full w-2/3 text-white/30" dashed />}
              <p className={`relative text-sm font-semibold ${lastDonation ? "text-white/80" : "text-muted"}`}>
                {lastDonation ? "New supporter · just now" : "Latest activity"}
              </p>
              <p className={`relative mt-3 max-w-4xl font-display text-3xl sm:text-5xl ${lastDonation ? "" : "text-ink"}`}>
                {featured.supporterName} backed {featured.athleteName} with {usd(featured.amount)}.
              </p>
              <EventDetails d={featured} onRed={!!lastDonation} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* KPIs */}
      <section className="card mt-6 grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x" aria-label="Campaign metrics">
        <Kpi label="Total raised" value={<AnimatedNumber value={campaign.raised} format={(n) => usd(n)} />} sub={`of ${usd(campaign.goal)} goal`} />
        <Kpi label="Supporters" value={<AnimatedNumber value={campaign.supporters} />} sub="community supporters" />
        <Kpi label="Fan contributions" value={<AnimatedNumber value={campaign.fanContributions} format={(n) => usd(n)} />} sub={`+ ${usd(campaign.businessFunding)} business`} />
        <Kpi label="Progress" value={<AnimatedNumber value={pct} format={(n) => `${Math.round(n)}%`} />} sub="funded">
          <ProgressBar value={campaign.raised} max={campaign.goal} className="mt-3 h-1.5" />
        </Kpi>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Live activity" right={<LiveDot />}>
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {activity.slice(0, 8).map((d) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, backgroundColor: "rgba(204,0,0,0.08)" }}
                  animate={{ opacity: 1, backgroundColor: "rgba(204,0,0,0)" }}
                  transition={{ duration: 1.8 }}
                  className="-mx-2 flex items-center gap-4 rounded-xl px-2 py-3.5"
                >
                  <Avatar name={d.supporterName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-ink">
                      <span className="font-semibold">{d.supporterName}</span> <span className="text-muted">backed</span> {d.athleteName}
                    </p>
                    <p className="text-xs text-faint">
                      {d.supportType} · {now ? timeAgo(d.createdAt, now) : ""}
                    </p>
                  </div>
                  <span className="font-display text-xl font-medium text-ink tabular-nums">{usd(d.amount)}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Panel>

        <div className="grid gap-6">
          <Panel title="Funding mix">
            <FundingMix business={campaign.businessFunding} fans={campaign.fanContributions} goal={campaign.goal} />
          </Panel>
          <Panel title="Recent fan actions">
            <ul className="space-y-3.5">
              {fanActions.map((f) => (
                <li key={f.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-muted">
                    <span className="font-semibold text-ink">{f.who}</span> {f.action}
                  </span>
                  <span className="shrink-0 text-xs text-faint">{now ? timeAgo(f.createdAt, now) : ""}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Campaign tasks" right={<span className="text-xs text-muted">{tasks.filter((t) => t.status === "done").length} of {tasks.length} done</span>}>
          <ul className="divide-y divide-line">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <StatusIcon status={t.status} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${t.status === "done" ? "text-faint line-through" : "text-ink"}`}>{t.title}</p>
                  <p className="text-xs text-faint">{t.owner} · due {t.due}</p>
                </div>
                {t.approval === "pending" && <span className="tag !bg-sand-soft !text-[11px] !text-muted">Needs approval</span>}
                {t.approval === "approved" && <span className="tag !bg-green/15 !text-[11px] !text-green">Approved</span>}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Sponsor pipeline" right={<span className="text-xs text-muted">Drafts only, never auto-sends</span>}>
          <ul className="divide-y divide-line">
            {deals.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{d.sponsor}</p>
                  <p className="text-xs text-faint">
                    {d.packageName} · match: {athleteBySlug(d.athleteSlug)?.firstName} · {usd(d.collected)} collected
                  </p>
                </div>
                <span className="font-display text-lg text-ink tabular-nums">${compact(d.amount)}</span>
                <StagePill stage={d.stage} signed={isSigned(d.stage)} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-faint">All businesses shown are fictional.</p>
        </Panel>
      </div>

      {!presenter && (
        <p className="mt-10 text-center text-sm text-muted">
          Presenting? Open <Link href="/demo/admin" className="link text-ink">/demo/admin</Link> for a full-screen view.
        </p>
      )}
    </div>
  );
}

function EventDetails({ d, onRed }: { d: Donation; onRed: boolean }) {
  const rows: [string, string][] = [
    ["Supporter", d.supporterName],
    ["Athlete", d.athleteName],
    ["Campaign", d.campaignName],
    ["Amount", usd(d.amount)],
    ["Support type", d.supportType],
    ["Thank-you pack", d.thankYouPack],
    ["Status", d.status],
  ];
  return (
    <dl className={`relative mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4 lg:grid-cols-7 ${onRed ? "border-white/25" : "border-line"}`}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className={`text-xs ${onRed ? "text-white/70" : "text-faint"}`}>{k}</dt>
          <dd className={`mt-1 text-sm font-semibold ${onRed ? "text-white" : "text-ink"}`}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Kpi({ label, value, sub, children }: { label: string; value: React.ReactNode; sub: string; children?: React.ReactNode }) {
  return (
    <div className="p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-5xl font-medium text-ink sm:text-6xl">{value}</p>
      <p className="mt-1 text-xs text-faint">{sub}</p>
      {children}
    </div>
  );
}

function Panel({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card min-w-0 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("");
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-soft font-display text-base text-red-lit">
      {initials || "★"}
    </span>
  );
}

function StatusIcon({ status }: { status: "done" | "in-progress" | "todo" }) {
  if (status === "done")
    return <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-paper" aria-label="Done">✓</span>;
  if (status === "in-progress")
    return <span className="h-5 w-5 rounded-full border-[1.5px] border-red border-r-transparent" aria-label="In progress" />;
  return <span className="h-5 w-5 rounded-full border-[1.5px] border-line" aria-label="To do" />;
}

function StagePill({ stage, signed }: { stage: string; signed: boolean }) {
  return <span className={`tag !text-[11px] ${signed ? "!bg-ink !text-paper" : stage === "Proposal" || stage === "Negotiation" ? "!bg-red-soft !text-red-dark" : ""}`}>{stage}</span>;
}

function FundingMix({ business, fans, goal }: { business: number; fans: number; goal: number }) {
  const remaining = Math.max(0, goal - business - fans);
  const seg = (n: number) => `${(n / goal) * 100}%`;
  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-sand">
        <div className="rounded-full bg-ink transition-[width] duration-1000" style={{ width: seg(business) }} />
        <div className="rounded-full bg-red transition-[width] duration-1000" style={{ width: seg(fans) }} />
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <Legend swatch="bg-ink" label="Business" value={usd(business)} />
        <Legend swatch="bg-red" label="Fans" value={<AnimatedNumber value={fans} format={(n) => usd(n)} />} />
        <Legend swatch="bg-sand" label="To goal" value={<AnimatedNumber value={remaining} format={(n) => usd(n)} />} />
      </dl>
    </div>
  );
}

function Legend({ swatch, label, value }: { swatch: string; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-xs text-muted">
        <span className={`h-2 w-2 rounded-full ${swatch}`} />
        {label}
      </dt>
      <dd className="mt-1 font-display text-2xl font-medium text-ink">{value}</dd>
    </div>
  );
}
