"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiSections, SourceTag, Sparkle } from "@/components/AiSections";
import { ROLE_LABELS, type Role } from "@/hooks/useRole";
import { useTextStream } from "@/hooks/useTextStream";
import { COPILOT_SECTIONS } from "@/lib/ai/copilot";
import { isSigned, type Deal } from "@/lib/deals";
import { usd } from "@/lib/labels";
import type { Athlete } from "@/lib/types";
import type { KitStatus } from "./BrandStudio";

/* ------------------------------ Operations Copilot ------------------------------ */

export function OperationsCopilot({ athlete, deals }: { athlete: Athlete; deals: Deal[] }) {
  const mine = deals.filter((d) => d.athleteSlug === athlete.slug);
  const [dealId, setDealId] = useState(mine[0]?.id ?? "");
  const deal = mine.find((d) => d.id === dealId) ?? mine[0];
  const { status, text, source, start, reset } = useTextStream("/api/copilot");
  const streaming = status === "streaming";

  useEffect(() => reset(), [dealId, reset]);

  if (!deal) {
    return (
      <div className="card p-10 text-center">
        <p className="font-display text-3xl text-ink">No deals to work on yet.</p>
        <p className="mt-2 text-muted">Add an opportunity from Sponsor Fit first.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <section className="card h-fit p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-lit">
          <Sparkle /> Operations Copilot
        </p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          Prepare the <em>next human action.</em>
        </h2>
        <p className="mt-3 text-sm text-muted">
          Summarizes a deal, surfaces what’s blocking, and drafts the follow-up. Nothing is sent, approved or cleared automatically.
        </p>
        <label className="mt-6 block">
          <span className="text-sm text-muted">Deal</span>
          <select value={deal.id} onChange={(e) => setDealId(e.target.value)} className="input mt-2 appearance-none">
            {mine.map((d) => (
              <option key={d.id} value={d.id}>{d.sponsor} · {d.stage}</option>
            ))}
          </select>
        </label>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[14px] bg-paper p-3">
            <dt className="text-xs text-muted">{isSigned(deal.stage) ? "Signed" : "Proposed"}</dt>
            <dd className="mt-1 font-display text-2xl text-ink">{usd(deal.amount)}</dd>
          </div>
          <div className="rounded-[14px] bg-paper p-3">
            <dt className="text-xs text-muted">Collected</dt>
            <dd className="mt-1 font-display text-2xl text-ink">{usd(deal.collected)}</dd>
          </div>
        </dl>
        <button onClick={() => start({ athleteSlug: athlete.slug, deal })} disabled={streaming} className="btn btn-red mt-6 w-full">
          {streaming ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Working…
            </>
          ) : (
            <>
              <Sparkle /> {text ? "Run again" : "Run copilot"}
            </>
          )}
        </button>
      </section>

      <section className="card p-6 sm:p-8" aria-live="polite" aria-busy={streaming}>
        {!text && status !== "error" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {COPILOT_SECTIONS.map((s) => (
              <div key={s} className="rounded-[14px] border border-dashed border-line px-4 py-6 text-sm text-faint">{s}</div>
            ))}
          </div>
        )}
        {status === "error" && <p role="alert" className="text-sm text-red-lit">Couldn’t reach the copilot. Try again.</p>}
        {text && (
          <>
            <div className="mb-6 flex flex-wrap gap-2 text-xs">
              <span className="tag !bg-red-soft !text-red-dark">Draft · a person decides every next step</span>
              <SourceTag source={source} />
            </div>
            <AiSections text={text} streaming={streaming} wide={["Deal summary", "Next actions", "Draft follow-up"]} />
          </>
        )}
      </section>
    </div>
  );
}

/* ---------------------------------- Approvals ---------------------------------- */

type ItemStatus = "awaiting" | "approved" | "changes";
type AuditEvent = { at: string; who: string; what: string };
type ApprovalState = { items: Record<string, ItemStatus>; audit: AuditEvent[] };

const keyFor = (slug: string) => `rtr:approvals:${slug}`;

function loadApprovals(slug: string): ApprovalState {
  try {
    const raw = localStorage.getItem(keyFor(slug));
    if (raw) return JSON.parse(raw) as ApprovalState;
  } catch {}
  return { items: {}, audit: [] };
}

export function Approvals({ athlete, role, deals, update, kitStatus }: {
  athlete: Athlete;
  role: Role;
  deals: Deal[];
  update: (id: string, fn: (d: Deal) => Deal) => void;
  kitStatus: KitStatus;
}) {
  const [state, setState] = useState<ApprovalState>({ items: {}, audit: [] });
  useEffect(() => setState(loadApprovals(athlete.slug)), [athlete.slug]);

  const mine = deals.filter((d) => d.athleteSlug === athlete.slug);
  const proposalFor = mine.find((d) => !isSigned(d.stage)) ?? mine[0];
  const content = [
    { id: "reel", title: "Instagram Reel: Confidence Starts Here", preparedBy: "Creative reviewer" },
    { id: "offer", title: "Meet-night sponsor offer card", preparedBy: "WRTH manager" },
    ...(proposalFor ? [{ id: `proposal-${proposalFor.id}`, title: `${proposalFor.sponsor} proposal draft`, preparedBy: "WRTH manager" }] : []),
  ];

  function record(itemId: string, status: ItemStatus, what: string) {
    const next: ApprovalState = {
      items: { ...state.items, [itemId]: status },
      audit: [{ at: new Date().toISOString(), who: ROLE_LABELS[role], what }, ...state.audit].slice(0, 30),
    };
    setState(next);
    try {
      localStorage.setItem(keyFor(athlete.slug), JSON.stringify(next));
    } catch {}
  }

  const isAthlete = role === "athlete";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
      <section className="card h-fit p-6">
        <p className="text-sm font-semibold text-red-lit">Role-based collaboration</p>
        <h2 className="mt-2 font-display text-3xl text-ink">
          Viewing as <em>{ROLE_LABELS[role]}.</em>
        </h2>
        <p className="mt-3 text-sm text-muted">
          {isAthlete
            ? `${athlete.firstName} approves every public use of her profile, story and partnerships.`
            : `${ROLE_LABELS[role]}s prepare work and resubmit it, but can never approve on ${athlete.firstName}’s behalf.`}
        </p>
        <h3 className="mt-8 text-sm text-muted">Audit trail</h3>
        <ol className="mt-3 space-y-2 text-sm">
          {state.audit.length === 0 && <li className="text-faint">No actions yet in this session.</li>}
          {state.audit.map((e, i) => (
            <li key={i} className="border-l-2 border-line pl-3">
              <span className="text-ink">{e.who}</span> <span className="text-muted">{e.what}</span>
              <span className="block text-xs text-faint">{new Date(e.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-faint">Simulated roles and local demo events. Production needs real sign-in and a server-side audit log.</p>
      </section>

      <section className="card divide-y divide-line px-6" aria-label="Approval queue">
        {/* Media kit */}
        <Row
          title="Sponsor-ready media kit"
          meta={kitStatus === "none" ? "Not generated yet" : "Generated in Brand Studio"}
          status={kitStatus === "approved" ? "approved" : kitStatus === "changes-requested" ? "changes" : kitStatus === "pending" ? "awaiting" : null}
          action={<Link href={`/portal/${athlete.slug}?tab=studio`} className="btn btn-line !px-4 !py-2 text-sm">Open Brand Studio</Link>}
        />
        {/* Partnerships */}
        {mine.map((d) => (
          <Row
            key={d.id}
            title={`${d.sponsor} partnership`}
            meta={`${d.packageName} · ${usd(d.amount)} · ${d.stage}`}
            status={d.athleteApproval === "approved" ? "approved" : d.athleteApproval === "changes-requested" ? "changes" : "awaiting"}
            action={
              isAthlete && d.athleteApproval !== "approved" ? (
                <Decide
                  onApprove={() => update(d.id, (x) => ({ ...x, athleteApproval: "approved" }))}
                  onChanges={() => update(d.id, (x) => ({ ...x, athleteApproval: "changes-requested" }))}
                />
              ) : null
            }
          />
        ))}
        {/* Content */}
        {content.map((c) => {
          const s = state.items[c.id] ?? "awaiting";
          return (
            <Row
              key={c.id}
              title={c.title}
              meta={`Prepared by ${c.preparedBy}`}
              status={s}
              action={
                isAthlete && s === "awaiting" ? (
                  <Decide onApprove={() => record(c.id, "approved", `approved “${c.title}”`)} onChanges={() => record(c.id, "changes", `requested changes to “${c.title}”`)} />
                ) : !isAthlete && s === "changes" ? (
                  <button className="btn btn-line !px-4 !py-2 text-sm" onClick={() => record(c.id, "awaiting", `resubmitted “${c.title}”`)}>
                    Resubmit
                  </button>
                ) : null
              }
            />
          );
        })}
      </section>
    </div>
  );
}

function Row({ title, meta, status, action }: { title: string; meta: string; status: ItemStatus | null; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm text-muted">
          {meta}
          {status && (
            <span className={`ml-2 tag !py-0.5 !text-[11px] ${status === "approved" ? "!bg-green/15 !text-green" : status === "changes" ? "" : "!bg-red-soft !text-red-dark"}`}>
              {status === "approved" ? "Approved" : status === "changes" ? "Changes requested" : "Awaiting athlete"}
            </span>
          )}
        </p>
      </div>
      {action}
    </div>
  );
}

function Decide({ onApprove, onChanges }: { onApprove: () => void; onChanges: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button className="btn btn-red !px-4 !py-2 text-sm" onClick={onApprove}>Approve</button>
      <button className="btn btn-line !px-4 !py-2 text-sm" onClick={onChanges}>Changes</button>
    </div>
  );
}
