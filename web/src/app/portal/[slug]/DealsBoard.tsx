"use client";

import { DealSplit } from "@/components/DealEconomics";
import { useState } from "react";
import type { Role } from "@/hooks/useRole";
import { isSigned, STAGES, type Deal } from "@/lib/deals";
import { usd } from "@/lib/labels";
import type { Athlete } from "@/lib/types";

export function DealsBoard({ athlete, role, deals, update }: {
  athlete: Athlete;
  role: Role;
  deals: Deal[];
  update: (id: string, fn: (d: Deal) => Deal) => void;
}) {
  const mine = deals.filter((d) => d.athleteSlug === athlete.slug);
  const [selectedId, setSelectedId] = useState<string | null>(mine[0]?.id ?? null);
  const deal = mine.find((d) => d.id === selectedId) ?? mine[0];

  if (!deal) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-3xl text-ink">No opportunities yet.</p>
        <p className="mt-2 text-muted">Add one from the Sponsor Fit tab.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <ul className="card h-fit divide-y divide-line" aria-label="Opportunities">
        {mine.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => setSelectedId(d.id)}
              aria-current={d.id === deal.id}
              className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${d.id === deal.id ? "bg-sand-soft" : "hover:bg-sand-soft/60"}`}
            >
              <span>
                <span className="block font-medium text-ink">{d.sponsor}</span>
                <span className="text-xs text-faint">{d.packageName} · {d.stage}</span>
              </span>
              <span className="font-display text-xl text-ink">{usd(d.amount)}</span>
            </button>
          </li>
        ))}
      </ul>

      <DealDetail deal={deal} athlete={athlete} role={role} update={update} />
    </div>
  );
}

function DealDetail({ deal, athlete, role, update }: { deal: Deal; athlete: Athlete; role: Role; update: (id: string, fn: (d: Deal) => Deal) => void }) {
  const [payment, setPayment] = useState("");
  const idx = STAGES.indexOf(deal.stage);
  const signed = isSigned(deal.stage);
  const staff = role === "staff";
  const outstanding = deal.amount - deal.collected;

  const move = (dir: 1 | -1) =>
    update(deal.id, (d) => ({ ...d, stage: STAGES[Math.min(STAGES.length - 1, Math.max(0, STAGES.indexOf(d.stage) + dir))] }));

  return (
    <section className="card p-6 sm:p-8" aria-label={`${deal.sponsor} opportunity`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{deal.packageName} · owner: {deal.owner}</p>
          <h2 className="mt-1 font-display text-4xl text-ink">{deal.sponsor}</h2>
          <p className="mt-1 text-xs text-faint">Fictional sponsor · sample opportunity</p>
        </div>
        <span className={`tag ${deal.athleteApproval === "approved" ? "!bg-green/15 !text-green" : deal.athleteApproval === "changes-requested" ? "" : "!bg-red-soft !text-red-dark"}`}>
          {deal.athleteApproval === "approved" ? `Approved by ${athlete.firstName}` : deal.athleteApproval === "changes-requested" ? `${athlete.firstName} requested changes` : `Awaiting ${athlete.firstName}’s approval`}
        </span>
      </div>

      {/* Stage stepper */}
      <ol className="mt-8 flex gap-1" aria-label="Pipeline stage">
        {STAGES.map((s, i) => (
          <li key={s} className="flex-1" title={s}>
            <span className={`block h-1.5 rounded-full ${i <= idx ? "bg-red" : "bg-sand"}`} />
            <span className={`mt-2 hidden text-[10px] lg:block ${i === idx ? "font-semibold text-ink" : "text-faint"}`}>{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-ink lg:hidden">Stage: {deal.stage}</p>
      {staff && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-line !py-2 text-sm" onClick={() => move(-1)} disabled={idx === 0}>← Back</button>
          <button className="btn btn-ink !py-2 text-sm" onClick={() => move(1)} disabled={idx === STAGES.length - 1}>
            Move to {STAGES[Math.min(idx + 1, STAGES.length - 1)]} →
          </button>
        </div>
      )}

      {/* Money: proposed vs signed vs collected */}
      <dl className="mt-8 grid grid-cols-3 divide-x divide-line rounded-[16px] border border-line">
        <Money label={signed ? "Signed commitment" : "Proposed"} value={usd(deal.amount)} />
        <Money label="Collected" value={usd(deal.collected)} />
        <Money label="Outstanding" value={signed ? usd(outstanding) : "—"} />
      </dl>
      <p className="mt-2 text-xs text-faint">A signed agreement is a commitment. Collected is cash actually received. They are tracked separately.</p>
      <div className="mt-6 rounded-[16px] border border-line p-5">
        <DealSplit amount={deal.amount} title={`${deal.packageName} is not all athlete pay`} />
      </div>
      {staff && signed && outstanding > 0 && (
        <form
          className="mt-4 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const amt = Math.min(outstanding, Math.max(0, Math.round(Number(payment) || 0)));
            if (!amt) return;
            update(deal.id, (d) => ({ ...d, collected: d.collected + amt }));
            setPayment("");
          }}
        >
          <label className="flex items-center gap-2 text-sm text-muted">
            Record a payment (demo)
            <input value={payment} onChange={(e) => setPayment(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" placeholder={String(outstanding)} className="input !h-10 !w-32" />
          </label>
          <button className="btn btn-line !py-2 text-sm">Record</button>
        </form>
      )}
      {staff && !signed && <p className="mt-3 text-xs text-muted">Payments can be recorded once the deal reaches Agreement.</p>}

      {/* Next action */}
      <div className="mt-8 rounded-[16px] bg-sand-soft p-4">
        <p className="text-xs text-muted">Next action · follow up {deal.followUp}</p>
        <p className="mt-1 text-ink">{deal.nextAction}</p>
      </div>

      {/* Tasks */}
      <h3 className="mt-8 font-display text-2xl text-ink">Deliverables & tasks</h3>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {deal.tasks.map((t) => {
          const canToggle = staff || t.owner === "Athlete";
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={t.done}
                disabled={!canToggle}
                onChange={() => update(deal.id, (d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) }))}
                className="h-4 w-4 accent-[var(--color-red)]"
                aria-label={t.title}
              />
              <span className={`flex-1 text-sm ${t.done ? "text-faint line-through" : "text-ink"}`}>{t.title}</span>
              <span className="text-xs text-faint">{t.owner} · {t.due}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-faint">NIL disclosure and compliance review stay with people. The platform reminds; it never clears a deal automatically.</p>

      {/* Athlete approval */}
      {role === "athlete" && deal.athleteApproval !== "approved" && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
          <button className="btn btn-red" onClick={() => update(deal.id, (d) => ({ ...d, athleteApproval: "approved" }))}>Approve this partnership</button>
          <button className="btn btn-line" onClick={() => update(deal.id, (d) => ({ ...d, athleteApproval: "changes-requested" }))}>Request changes</button>
        </div>
      )}
    </section>
  );
}

function Money({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl text-ink">{value}</dd>
    </div>
  );
}
