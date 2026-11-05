"use client";

import { DataTag } from "@/components/Badges";
import { YearOnePlan } from "./YearOnePlan";
import { useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { LiveDot } from "@/components/CampaignProgress";
import { useLive } from "@/hooks/useLive";
import { dealTotals, useDeals } from "@/lib/deals";
import { computeFinance, costStages, scenarios, type FinanceInputs } from "@/lib/finance";
import { usd } from "@/lib/labels";
import { seedCampaign } from "@/lib/seed";

// Chart colors validated with the dataviz palette checker on the #181716 card surface (dark mode):
// all checks pass, worst adjacent CVD ΔE 26.3. Stack order keeps red and amber apart.
const C = { sponsor: "var(--chart-sponsor)", supporters: "var(--chart-supporters)", upgrades: "var(--chart-upgrades)" };

const GOAL = 2_000_000;
type ScenarioKey = keyof typeof scenarios;

const kfmt = (n: number): string => {
  if (n < 0) return `−${kfmt(-n)}`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return usd(n);
};
const pct = (n: number) => `${Math.round(n * 100)}%`;

export function RevenueIntelligence() {
  const [scenario, setScenario] = useState<ScenarioKey | "custom">("base");
  const [inputs, setInputs] = useState<FinanceInputs>(scenarios.base);
  const o = computeFinance(inputs);
  const set = <K extends keyof FinanceInputs>(k: K, v: number) => {
    setInputs((p) => ({ ...p, [k]: v }));
    setScenario("custom");
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="max-w-2xl text-muted">
            Every input is a hypothetical planning assumption, not verified WRTH data. Existing supporter revenue is shown but
            never counted as new. Signed agreements and collected cash are kept separate.
          </p>
        </div>
        <div className="flex rounded-full border border-line bg-surface p-1" role="radiogroup" aria-label="Scenario">
          {(Object.keys(scenarios) as ScenarioKey[]).map((k) => (
            <button
              key={k}
              role="radio"
              aria-checked={scenario === k}
              onClick={() => {
                setInputs(scenarios[k]);
                setScenario(k);
              }}
              className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${scenario === k ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {k}
            </button>
          ))}
          {scenario === "custom" && <span className="rounded-full bg-red-soft px-4 py-1.5 text-sm text-red-dark">Custom</span>}
        </div>
      </header>

      <YearOnePlan simulatedNew={o.newCollected} scenario={scenario} />

      {/* Headline numbers: the funnel simulator */}
      <section className="card mt-8 grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x" aria-label="Year-one results">
        <Hero label="New collected NIL funding" value={o.newCollected} sub="year 1 · fans + sponsors" />
        <Hero label="Net incremental benefit" value={o.netIncremental} sub="after build, operating and variable costs" tone={o.netIncremental >= 0 ? "good" : "bad"} />
        <Hero label="Break-even new funding" value={o.breakEven} sub={`${kfmt(o.fixedCosts)} fixed ÷ (1 − ${pct(inputs.variableCostRate)})`} />
        <Hero label="Existing revenue (not counted)" value={o.existingAnnualized} sub="annualized estimate, unverified" muted />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Assumptions */}
        <section className="card h-fit p-6" aria-label="Assumptions">
          <h2 className="font-display text-2xl text-ink">Assumptions</h2>
          <Group title="A · Existing supporters (estimate)">
            <Slider label="Current supporters" value={inputs.existingSupporters} min={450} max={500} step={5} fmt={(v) => `${v}`} onChange={(v) => set("existingSupporters", v)} />
            <Slider label="On the $25 tier" value={inputs.existingPct25} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("existingPct25", v)} />
          </Group>
          <Group title="B · New fan revenue">
            <Slider label="New supporters this year" value={inputs.newSupporters} min={0} max={1500} step={10} fmt={(v) => `${v}`} onChange={(v) => set("newSupporters", v)} />
            <Slider label="New supporters on $25" value={inputs.newPct25} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("newPct25", v)} />
            <Slider label="Avg months active in year 1" value={inputs.avgMonthsActive} min={1} max={12} step={1} fmt={(v) => `${v} mo`} onChange={(v) => set("avgMonthsActive", v)} />
            <Slider label="$10 → $25 upgrades" value={inputs.upgradeRate} min={0} max={0.5} step={0.01} fmt={pct} onChange={(v) => set("upgradeRate", v)} />
            <Slider label="One-time gifts" value={inputs.oneTimeGifts} min={0} max={3000} step={50} fmt={(v) => `${v} × ${usd(inputs.avgOneTimeGift)}`} onChange={(v) => set("oneTimeGifts", v)} />
          </Group>
          <Group title="C · Sponsorship funnel">
            <Slider label="Prospects identified" value={inputs.prospects} min={0} max={400} step={5} fmt={(v) => `${v}`} onChange={(v) => set("prospects", v)} />
            <Slider label="Qualified" value={inputs.qualificationRate} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("qualificationRate", v)} />
            <Slider label="Get a proposal" value={inputs.proposalRate} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("proposalRate", v)} />
            <Slider label="Close rate" value={inputs.closeRate} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("closeRate", v)} />
            <Slider label="Average deal size" value={inputs.avgDealSize} min={2500} max={100000} step={2500} fmt={kfmt} onChange={(v) => set("avgDealSize", v)} />
            <Slider label="Collected in year 1" value={inputs.collectionRate} min={0.5} max={1} step={0.05} fmt={pct} onChange={(v) => set("collectionRate", v)} />
            <Slider label="Expected renewals" value={inputs.renewalRate} min={0} max={1} step={0.05} fmt={pct} onChange={(v) => set("renewalRate", v)} />
          </Group>
          <Group title="D · Costs">
            <Slider label="One-time build" value={inputs.buildCost} min={0} max={150000} step={5000} fmt={kfmt} onChange={(v) => set("buildCost", v)} />
            <Slider label="Annual operating" value={inputs.annualOperatingCost} min={0} max={100000} step={5000} fmt={kfmt} onChange={(v) => set("annualOperatingCost", v)} />
            <Slider label="Variable cost rate" value={inputs.variableCostRate} min={0} max={0.3} step={0.01} fmt={pct} onChange={(v) => set("variableCostRate", v)} />
          </Group>
        </section>

        <div className="grid h-fit gap-6">
          <FundingMix o={o} />
          <Funnel inputs={inputs} o={o} />
          <Attribution o={o} />
          <GoalCompare o={o} />
        </div>
      </div>

      <LiveRecords />
      <MemberIntelligence inputs={inputs} />
      <CostsAndRoadmap />
    </div>
  );
}

/* --------------------------------- pieces --------------------------------- */

function Hero({ label, value, sub, tone, muted }: { label: string; value: number; sub: string; tone?: "good" | "bad"; muted?: boolean }) {
  return (
    <div className="p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 font-display text-5xl ${muted ? "text-muted" : tone === "bad" ? "text-red-lit" : "text-ink"}`}>
        <AnimatedNumber value={Math.round(value)} format={(n) => kfmt(Math.round(n))} />
      </p>
      <p className="mt-1 text-xs text-faint">{sub}</p>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-6 border-t border-line pt-5">
      <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</legend>
      <div className="mt-3 space-y-4">{children}</div>
    </fieldset>
  );
}

function Slider({ label, value, min, max, step, fmt, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums text-muted">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-red)]"
      />
    </label>
  );
}

type Out = ReturnType<typeof computeFinance>;

function FundingMix({ o }: { o: Out }) {
  const [hover, setHover] = useState<string | null>(null);
  const segs = [
    { key: "sponsor", label: "Sponsor funding collected", value: o.sponsorCollected, color: C.sponsor },
    { key: "supporters", label: "New supporters", value: o.newSupporterRevenue, color: C.supporters },
    { key: "upgrades", label: "Upgrades + one-time gifts", value: o.upgradeRevenue + o.oneTimeRevenue, color: C.upgrades },
  ];
  const total = Math.max(1, o.newCollected);
  const scaleMax = Math.max(o.newCollected, o.existingAnnualized, 1);
  const active = segs.find((s) => s.key === hover);
  return (
    <section className="card p-6" aria-label="New funding mix">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">New funding mix</h2>
        <p className="text-sm text-muted">{active ? `${active.label}: ${usd(Math.round(active.value))} (${Math.round((active.value / total) * 100)}%)` : "Hover a segment"}</p>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-1.5 text-xs text-muted">New collected, year 1 · {kfmt(o.newCollected)}</p>
          <div className="flex h-7 gap-[2px]" style={{ width: `${(o.newCollected / scaleMax) * 100}%` }}>
            {segs.map((s) =>
              s.value > 0 ? (
                <div
                  key={s.key}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                  className={`h-full rounded-[4px] transition-opacity ${hover && hover !== s.key ? "opacity-50" : ""}`}
                  style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
                  role="img"
                  aria-label={`${s.label}: ${usd(Math.round(s.value))}`}
                />
              ) : null,
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs text-muted">Existing supporters (annualized estimate, not counted) · {kfmt(o.existingAnnualized)}</p>
          <div className="h-7 rounded-[4px] border border-dashed border-faint bg-sand" style={{ width: `${(o.existingAnnualized / scaleMax) * 100}%` }} />
        </div>
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {segs.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-muted">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            {s.label} <span className="text-ink">{kfmt(Math.round(s.value))}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Funnel({ inputs, o }: { inputs: FinanceInputs; o: Out }) {
  const rows = [
    { label: "Prospects", n: inputs.prospects },
    { label: "Qualified", n: o.qualified },
    { label: "Proposals", n: o.proposals },
    { label: "Signed deals", n: o.signedDeals },
  ];
  const max = Math.max(1, inputs.prospects);
  return (
    <section className="card p-6" aria-label="Sponsorship funnel">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">Sponsorship funnel</h2>
        <p className="text-sm text-muted">{kfmt(o.signedValue)} signed · {kfmt(o.sponsorCollected)} collected</p>
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[96px_1fr_48px] items-center gap-3" title={`${r.label}: ${r.n.toFixed(1)}`}>
            <span className="text-sm text-muted">{r.label}</span>
            <span className="h-5 rounded-r-[4px] bg-red" style={{ width: `${Math.max(0.5, (r.n / max) * 100)}%` }} />
            <span className="text-right text-sm tabular-nums text-ink">{r.n % 1 === 0 ? r.n : r.n.toFixed(1)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-faint">
        Next-year renewals expected at {pct(inputs.renewalRate)} of signed deals ({kfmt(o.expectedRenewalValue)}), not counted in year 1.
      </p>
    </section>
  );
}

function Attribution({ o }: { o: Out }) {
  const rows: [string, number, string][] = [
    ["Prospective pipeline (proposals)", o.pipelineValue, "Not revenue until signed"],
    ["Signed sponsor agreements", o.signedValue, "Commitments"],
    ["Sponsor funding collected", o.sponsorCollected, "Cash received"],
    ["New supporter revenue", o.newSupporterRevenue, "Incremental"],
    ["Upgrades + one-time gifts", o.upgradeRevenue + o.oneTimeRevenue, "Incremental"],
    ["Existing supporter revenue", o.existingAnnualized, "Shown, not counted"],
    ["Variable costs", -o.variableCosts, "Fulfillment, processing, creative"],
    ["Build + operating costs", -o.fixedCosts, "Year 1"],
  ];
  return (
    <section className="card p-6" aria-label="Revenue attribution">
      <h2 className="font-display text-2xl text-ink">Attribution</h2>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {rows.map(([k, v, note]) => (
            <tr key={k} className="border-b border-line">
              <th scope="row" className="py-2.5 pr-3 text-left font-normal text-ink">
                {k}
                <span className="block text-xs text-faint">{note}</span>
              </th>
              <td className={`py-2.5 text-right tabular-nums ${v < 0 ? "text-muted" : "text-ink"}`}>{v < 0 ? `−${usd(Math.round(-v))}` : usd(Math.round(v))}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="pt-3 text-left font-semibold text-ink">Net incremental benefit</th>
            <td className={`pt-3 text-right font-display text-2xl tabular-nums ${o.netIncremental < 0 ? "text-red-lit" : "text-ink"}`}>
              {o.netIncremental < 0 ? `−${usd(Math.round(-o.netIncremental))}` : usd(Math.round(o.netIncremental))}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-xs text-faint">Net = new collected funding − variable costs − build and operating costs. Pipeline and signed values are never added to it.</p>
    </section>
  );
}

function GoalCompare({ o }: { o: Out }) {
  const share = Math.min(1, o.totalWithExisting / GOAL);
  const existingShare = Math.min(1, o.existingAnnualized / GOAL);
  return (
    <section className="card p-6" aria-label="$2M goal comparison">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-ink">Against the $2M goal</h2>
        <p className="text-sm text-muted">{Math.round(share * 100)}% · gap {kfmt(Math.max(0, GOAL - o.totalWithExisting))}</p>
      </div>
      <div className="mt-5 flex h-4 gap-[2px] overflow-hidden rounded-[4px] bg-sand">
        <div className="h-full bg-faint" style={{ width: `${existingShare * 100}%` }} title="Existing (estimate)" />
        <div className="h-full bg-red" style={{ width: `${(share - existingShare) * 100}%` }} title="New collected" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-faint" />Existing (estimate)</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-red" />New collected</span>
      </div>
      <p className="mt-4 rounded-[12px] bg-red-soft px-4 py-3 text-xs text-red-dark">
        Goal basis to be confirmed with WRTH: shown here as a one-year total. If $2M is cumulative over several years, this
        comparison overstates the gap.
      </p>
    </section>
  );
}

function LiveRecords() {
  const { campaign } = useLive();
  const { deals } = useDeals();
  const t = dealTotals(deals);
  const demoGifts = Math.max(0, campaign.fanContributions - seedCampaign.fanContributions);
  const demoSupporters = Math.max(0, campaign.supporters - seedCampaign.supporters);
  return (
    <section className="card mt-6 p-6" aria-label="Live demo records">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-3 font-display text-2xl text-ink">Live demo records <DataTag kind="live" /></h2>
        <span className="flex items-center gap-3 text-xs text-faint">
          <LiveDot /> Sample records from this session · not part of the model above
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-5">
        <Rec label="Demo contributions today" value={usd(demoGifts)} sub={`${demoSupporters} new demo supporters`} />
        <Rec label="Open pipeline" value={usd(t.pipeline)} sub={`${t.openCount} opportunities`} />
        <Rec label="Signed agreements" value={usd(t.signed)} sub={`${t.signedCount} deals`} />
        <Rec label="Collected" value={usd(t.collected)} sub="cash received" />
        <Rec label="Outstanding on signed" value={usd(t.signed - t.collected)} sub="signed − collected" />
      </dl>
    </section>
  );
}

function Rec({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-3xl text-ink">{value}</dd>
      <dd className="text-xs text-faint">{sub}</dd>
    </div>
  );
}

function MemberIntelligence({ inputs }: { inputs: FinanceInputs }) {
  const on25 = Math.round(inputs.existingSupporters * inputs.existingPct25);
  const on10 = inputs.existingSupporters - on25;
  const tiles: [string, string, string][] = [
    ["Active members", String(inputs.existingSupporters), "from assumption A"],
    ["Chalk Circle · $10", String(on10), `${pct(1 - inputs.existingPct25)} of members`],
    ["Routine Partner · $25", String(on25), `${pct(inputs.existingPct25)} of members`],
    ["Upgrade-ready", "64", "engaged $10 members, illustrative"],
    ["At-risk renewals", "38", "no activity in 60 days, illustrative"],
    ["Card collectors", "186", "digital cards collected, illustrative"],
  ];
  return (
    <section className="card mt-6 p-6" aria-label="Member intelligence">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl text-ink">
          Member intelligence <span className="text-muted">· sample</span>
        </h2>
        <p className="text-xs text-faint">Retain the supporters you acquire. Production needs approved membership data and consent.</p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line md:grid-cols-3 lg:grid-cols-6">
        {tiles.map(([k, v, sub]) => (
          <div key={k} className="bg-surface p-5">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="mt-1 font-display text-4xl text-ink">{v}</dd>
            <dd className="mt-1 text-xs text-faint">{sub}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const phases = [
  { name: "Phase 0 · Validate", gate: "Is there a real, addressable revenue opportunity?", items: "Confirm WRTH revenue, sponsor workflows, data and payment permissions, ownership." },
  { name: "Phase 1 · Lean pilot", gate: "Does the pilot earn enough to justify more investment?", items: "Onboard approved athletes, pilot Sponsor Scout and proposals, track real leads and staff time saved." },
  { name: "Phase 2 · Production", gate: "Can it run securely and economically at scale?", items: "Real auth and permissions, approved integrations, agreement workflows, staff training." },
  { name: "Phase 3 · Expansion", gate: "Does new funding justify further scale?", items: "Larger packages, renewal analytics, supporter segmentation, more activations." },
];

function CostsAndRoadmap() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="card p-6" aria-label="Cost stages">
        <h2 className="font-display text-2xl text-ink">What it costs to run</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-normal">Stage</th>
              <th className="py-2 font-normal">One-time build</th>
              <th className="py-2 font-normal">Annual operating</th>
            </tr>
          </thead>
          <tbody>
            {costStages.map((c) => (
              <tr key={c.stage} className="border-b border-line last:border-0">
                <td className="py-2.5 text-ink">{c.stage}</td>
                <td className="py-2.5 text-muted">{c.build}</td>
                <td className="py-2.5 text-muted">{c.operating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-faint">
          Planning ranges, not vendor quotes. Reuse what WRTH already has (payments, membership records, marketing channels, standard
          CRM) and custom-build only the athlete-sponsor intelligence. Example: $25K pilot + $20K first-year operation at 10%
          variable cost breaks even at $50K of new funding.
        </p>
      </section>
      <section className="card p-6" aria-label="Phased roadmap">
        <h2 className="font-display text-2xl text-ink">Phased rollout</h2>
        <ol className="mt-4 divide-y divide-line border-y border-line">
          {phases.map((p) => (
            <li key={p.name} className="py-3.5">
              <p className="font-medium text-ink">{p.name}</p>
              <p className="mt-1 text-sm text-muted">{p.items}</p>
              <p className="mt-1 text-xs text-red-lit">Gate: {p.gate}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
