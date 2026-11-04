"use client";

import { useMemo, useState } from "react";

const dollars = (amount: number) => `$${Math.round(amount).toLocaleString()}`;

export function RevenueInsights() {
  const [newSupporters, setNewSupporters] = useState(180);
  const [monthlyGift, setMonthlyGift] = useState(15);
  const [retention, setRetention] = useState(78);
  const [prospects, setProspects] = useState(24);
  const [qualification, setQualification] = useState(45);
  const [proposal, setProposal] = useState(65);
  const [closeRate, setCloseRate] = useState(30);
  const [dealSize, setDealSize] = useState(15000);
  const [collection, setCollection] = useState(90);
  const [buildCost, setBuildCost] = useState(25000);
  const [operatingCost, setOperatingCost] = useState(20000);
  const [variableCost, setVariableCost] = useState(10);
  const model = useMemo(() => {
    const newFan = newSupporters * monthlyGift * 12 * retention / 100;
    const signed = prospects * qualification / 100 * proposal / 100 * closeRate / 100 * dealSize;
    const collected = signed * collection / 100;
    const total = newFan + collected;
    const fixed = buildCost + operatingCost;
    const net = total - fixed - (total * variableCost / 100);
    const breakeven = fixed / (1 - variableCost / 100);
    return { newFan, signed, collected, total, fixed, net, breakeven };
  }, [newSupporters, monthlyGift, retention, prospects, qualification, proposal, closeRate, dealSize, collection, buildCost, operatingCost, variableCost]);
  const controls: Array<[string, number, (n: number) => void, number, number, number, string]> = [
    ["New supporters", newSupporters, setNewSupporters, 0, 1000, 10, "people"], ["Average monthly gift", monthlyGift, setMonthlyGift, 5, 100, 1, "dollars"], ["First-year retention", retention, setRetention, 0, 100, 1, "%"], ["Prospects identified", prospects, setProspects, 0, 200, 1, "businesses"], ["Qualification rate", qualification, setQualification, 0, 100, 1, "%"], ["Proposal rate", proposal, setProposal, 0, 100, 1, "%"], ["Close rate", closeRate, setCloseRate, 0, 100, 1, "%"], ["Average deal size", dealSize, setDealSize, 5000, 200000, 1000, "dollars"], ["Collection rate", collection, setCollection, 0, 100, 1, "%"],
  ];
  return <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8"><p className="text-sm font-semibold text-red-lit">Revenue intelligence</p><h1 className="mt-3 max-w-5xl font-display text-6xl sm:text-7xl">Show what is new, signed, collected, and <em>worth building.</em></h1><p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">All figures below are interactive planning assumptions, not WRTH financial records or forecasts. Existing supporter revenue is separated and never counted as new funding.</p>
    <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Existing supporter baseline","$99,750","Illustrative 475 supporters × $17.50 × 12"],["New supporter revenue",dollars(model.newFan),"Incremental and retention-adjusted"],["Signed sponsorships",dollars(model.signed),"Commitments, not cash"],["Collected new funding",dollars(model.collected),"Collection-rate adjusted" ]].map(([k,v,sub]) => <div key={k} className="card p-6"><p className="text-sm text-muted">{k}</p><p className="mt-2 font-display text-5xl">{v}</p><p className="mt-2 text-xs text-faint">{sub}</p></div>)}</section>
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]"><div className="card p-6 sm:p-8"><p className="label">Scenario simulator</p><h2 className="mt-3 font-display text-4xl">Change the assumptions.</h2><div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">{controls.map(([label, value, set, min, max, step, unit]) => <label key={label} className="block"><span className="flex justify-between text-sm text-muted"><span>{label}</span><b className="text-ink">{unit === "dollars" ? dollars(value) : `${value}${unit === "%" ? "%" : ""}`}</b></span><input className="mt-2 w-full accent-red" type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))}/></label>)}</div></div><div className="card p-7"><p className="label">Incremental benefit</p><p className={`mt-4 font-display text-6xl ${model.net >= 0 ? "text-green" : "text-red-lit"}`}>{dollars(model.net)}</p><p className="mt-2 text-sm text-muted">new attributable collected funding minus incremental fixed and variable costs</p><dl className="mt-7 divide-y divide-line border-y border-line text-sm">{[["New supporter funding",dollars(model.newFan)],["Collected sponsorship funding",dollars(model.collected)],["Incremental fixed costs",`−${dollars(model.fixed)}`],["Variable cost rate",`${variableCost}%`],["Break-even funding",dollars(model.breakeven)]].map(([k,v]) => <div key={k} className="flex justify-between py-3"><dt className="text-muted">{k}</dt><dd>{v}</dd></div>)}</dl><p className="mt-5 text-xs text-faint">Formula: fixed incremental cost ÷ (1 − variable cost rate).</p></div></section>
    <section className="mt-8 grid gap-6 lg:grid-cols-2"><div className="card p-7"><p className="label">Member intelligence · sample</p><h2 className="mt-3 font-display text-4xl">Retain the supporters you acquire.</h2><dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line">{[["Active members","475"],["Chalk Circle","58%"],["Routine Partner","31%"],["Upgrade-ready","64"],["At-risk renewal","38"],["Card collectors","186"]].map(([k,v]) => <div key={k} className="bg-surface p-5"><dd className="font-display text-4xl">{v}</dd><dt className="mt-1 text-sm text-muted">{k}</dt></div>)}</dl><p className="mt-5 text-xs text-faint">Illustrative dashboard only; production requires approved membership data and consent.</p></div><div className="card p-7"><p className="label">Deployment & ownership</p><h2 className="mt-3 font-display text-4xl">Pilot before production.</h2><ol className="mt-7 divide-y divide-line border-y border-line">{[["1. Validate","Confirm revenue baseline, permissions, and sponsor demand."],["2. Lean pilot","Approved athletes, authorized support flow, Sponsor Scout, and tracked outcomes."],["3. Production","Security, integrations, staff training, and operating ownership."],["4. Expand","Renewal analytics and broader roster adoption after measured value."]].map(([title,body]) => <li key={title} className="py-4"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted">{body}</p></li>)}</ol><p className="mt-5 text-sm text-muted">Planning ranges: lean pilot $40K build / $15K–$35K annually; production $150K build / $60K–$100K annually. These are assumptions, not quotes.</p></div></section>
  </main>;
}
