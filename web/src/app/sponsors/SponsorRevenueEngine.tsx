"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AthletePortrait } from "@/components/AthletePortrait";
import { isSigned, STAGES, useDeals, type Deal, type Stage } from "@/lib/deals";
import { audienceLabels, causeLabels, usd } from "@/lib/labels";
import { athletes, sponsorPackages } from "@/lib/seed";
import { categoryById, rankAthletesForBusiness, rankCategories, sampleBusinesses, type SampleBusiness } from "@/lib/sponsors";

const tabs = ["Sponsor Scout", "Reverse Match", "Package Builder", "CRM", "Performance"] as const;
type Tab = (typeof tabs)[number];

const packageFor = (budget: number) =>
  budget >= 200000 ? "Strategic Partner" : budget >= 50000 ? "Red Rocks Partner" : budget >= 15000 ? "Impact Routine" : "Community Spark";

export function SponsorRevenueEngine() {
  const [tab, setTab] = useState<Tab>("Sponsor Scout");
  const [businessId, setBusinessId] = useState(sampleBusinesses[0].id);
  const [athleteSlug, setAthleteSlug] = useState("avery");
  const [packageId, setPackageId] = useState("routine");
  const { deals, update, add } = useDeals();
  const business = sampleBusinesses.find((b) => b.id === businessId)!;
  const athlete = athletes.find((a) => a.slug === athleteSlug)!;
  const pkg = sponsorPackages.find((p) => p.id === packageId)!;
  const matches = useMemo(() => rankAthletesForBusiness(business, athletes).slice(0, 3), [business]);
  const top = matches[0].athlete;

  const dealId = (b: SampleBusiness, slug: string) => `d-${b.id}-${slug}`;
  const inPipeline = (b: SampleBusiness, slug: string) => deals.some((d) => d.id === dealId(b, slug) || (d.sponsor === b.name && d.athleteSlug === slug));

  function addDeal(b: SampleBusiness, slug: string, stage: Stage, amount: number, packageName: string, nextAction: string) {
    if (inPipeline(b, slug)) return;
    add({
      id: dealId(b, slug),
      sponsor: b.name,
      athleteSlug: slug,
      packageName,
      amount,
      stage,
      collected: 0,
      athleteApproval: "pending",
      owner: "WRTH partnerships",
      nextAction,
      followUp: "Next business day",
      tasks: [{ id: "t1", title: `Review fit and approve outreach with ${b.name}`, owner: "Athlete", due: "This week", done: false }],
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8">
      <p className="text-sm font-semibold text-red-lit">Sponsorship Revenue Engine</p>
      <h1 className="mt-3 max-w-5xl font-display text-6xl text-ink sm:text-7xl">
        Make sponsor growth <em>systematic.</em>
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">
        Fictional businesses and illustrative economics only. This prototype qualifies opportunities, explains athlete fit, drafts a
        proposal, and keeps signed commitments separate from collected funding. The CRM is the same pipeline the athlete portal,
        admin and revenue dashboard use.
      </p>

      <div className="mt-10 flex gap-2 overflow-x-auto border-b border-line" role="tablist" aria-label="Sponsor tools">
        {tabs.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`shrink-0 px-4 py-4 text-sm font-semibold ${tab === item ? "border-b-2 border-red text-ink" : "text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Sponsor Scout" && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="card p-6">
            <p className="label">AI Sponsor Scout</p>
            <h2 className="mt-3 font-display text-4xl">Qualify a sample business.</h2>
            <label className="mt-7 block text-sm text-muted">
              Business
              <select className="input mt-2" value={businessId} onChange={(e) => setBusinessId(e.target.value)}>
                {sampleBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {[
                ["Category", categoryById(business.categoryId).name],
                ["Geography", business.location],
                ["Objective", business.objective],
                ["Typical budget", usd(business.budget)],
                ["Warm contact", business.warmContact ?? "No current relationship"],
                ["Qualification", business.notes],
              ].map(([k, v]) => (
                <div key={k} className="py-3">
                  <dt className="text-faint">{k}</dt>
                  <dd className="mt-1 text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6">
            <p className="label">Recommended athletes</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {matches.map((m, i) => (
                <article key={m.athlete.slug} className="rounded-[16px] border border-line p-3">
                  <div className="relative aspect-square overflow-hidden rounded-[12px]">
                    <AthletePortrait athlete={m.athlete} className="absolute inset-0" />
                  </div>
                  <p className="mt-3 font-display text-2xl">{m.athlete.name}</p>
                  <p className="mt-1 text-xs text-muted">#{i + 1} · {m.score}% fit</p>
                  <p className="mt-2 text-xs text-faint">{m.reasons[0]}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-[16px] bg-paper p-5">
              <p className="font-semibold">Recommended next action</p>
              <p className="mt-2 text-sm text-muted">
                Invite {business.name} to a 20-minute discovery call with a tailored {top.firstName} campaign concept. No outreach is
                sent automatically.
              </p>
            </div>
            <button
              className="btn btn-red mt-6"
              disabled={inPipeline(business, top.slug)}
              onClick={() => addDeal(business, top.slug, "Qualified", business.budget, packageFor(business.budget), `Confirm discovery meeting with ${business.name}`)}
            >
              {inPipeline(business, top.slug) ? "✓ In the pipeline" : "Create qualified opportunity"}
            </button>
            {inPipeline(business, top.slug) && (
              <button className="ml-3 text-sm link" onClick={() => setTab("CRM")}>View CRM</button>
            )}
          </div>
        </section>
      )}

      {tab === "Reverse Match" && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <div className="card p-6">
            <p className="label">Athlete-to-business discovery</p>
            <label className="mt-5 block text-sm text-muted">
              Select athlete
              <select className="input mt-2" value={athleteSlug} onChange={(e) => setAthleteSlug(e.target.value)}>
                {athletes.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.name}</option>
                ))}
              </select>
            </label>
            <p className="mt-6 text-sm text-muted">
              Approved demo attributes: {athlete.causes.map((c) => causeLabels[c].toLowerCase()).join(", ")} ·{" "}
              {athlete.audiences.map((x) => audienceLabels[x]).join(", ")} · {athlete.inPerson ? "in-person available" : "digital formats"}.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-4xl">Businesses {athlete.firstName} should meet.</h2>
            <div className="mt-6 grid gap-3">
              {rankCategories(athlete)
                .flatMap((r) => r.businesses.map((b) => ({ b, r })))
                .slice(0, 4)
                .map(({ b, r }) => (
                  <div key={b.id} className="flex items-center justify-between gap-4 rounded-[16px] border border-line p-4">
                    <div>
                      <p className="font-semibold">{b.name}</p>
                      <p className="mt-1 text-sm text-muted">{r.category.name} · {r.score}% fit · {r.reasons[0]}</p>
                    </div>
                    <button
                      onClick={() => {
                        setBusinessId(b.id);
                        setTab("Sponsor Scout");
                      }}
                      className="btn btn-line !px-4 !py-2 text-sm"
                    >
                      Scout
                    </button>
                  </div>
                ))}
            </div>
            <p className="mt-5 text-xs text-faint">Recommendations are explainable demo suggestions, not external research or outreach.</p>
          </div>
        </section>
      )}

      {tab === "Package Builder" && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
          <div className="card p-6">
            <p className="label">Illustrative package concepts</p>
            <div className="mt-5 grid gap-2">
              {sponsorPackages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPackageId(p.id)}
                  className={`rounded-[14px] border p-4 text-left ${packageId === p.id ? "border-red bg-red-soft" : "border-line"}`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="float-right font-display text-2xl">{p.priceLabel}</span>
                  <span className="mt-1 block text-sm text-muted">{p.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-7">
            <p className="label">Sponsor proposal · draft</p>
            <h2 className="mt-3 font-display text-5xl">
              {pkg.name} with <em>{top.firstName}.</em>
            </h2>
            <p className="mt-4 text-muted">
              For {business.name}: {business.objective}. Proposed price is illustrative, not a confirmed market rate.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {[
                ["Audience", `${top.localAudiencePct}% Utah audience · ${top.audiences.map((x) => audienceLabels[x]).join(", ")}`],
                ["Timeline", "4 weeks: story → social → QR activation → report"],
                ["Commercial activation", "Sponsor offer + fan QR action at a meet-night moment"],
                ["Measurement", "QR visits, offer claims, views, fan actions, attendance, and completion"],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-line pt-4">
                  <p className="text-sm font-semibold">{k}</p>
                  <p className="mt-1 text-sm text-muted">{v}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-7 text-sm font-semibold">Proposed deliverables</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {pkg.perks.map((item) => (
                <li key={item} className="rounded-full bg-paper px-4 py-2 text-sm">✓ {item}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                className="btn btn-red"
                onClick={() => {
                  addDeal(business, top.slug, "Proposal", pkg.price, pkg.name, `Walk ${business.name} through the ${pkg.name} proposal`);
                  setTab("CRM");
                }}
              >
                {inPipeline(business, top.slug) ? "View in CRM" : "Add proposal to CRM"}
              </button>
              <Link href={`/routines?athlete=${top.slug}&package=${pkg.id}&ai=1#ai-brief`} className="btn btn-line">
                Draft the full brief with AI
              </Link>
            </div>
            <p className="mt-3 text-xs text-faint">
              Business and lead athlete come from the Sponsor Scout tab. Adobe proposal output is represented here as the sponsor-ready
              creative brief; no external file is generated.
            </p>
          </div>
        </section>
      )}

      {tab === "CRM" && <Crm deals={deals} update={update} />}

      {tab === "Performance" && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="card p-7">
            <p className="label">Confidence Starts Here · illustrative campaign report</p>
            <h2 className="mt-3 font-display text-5xl">
              Results that make renewal <em>credible.</em>
            </h2>
            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-3">
              {[["Reach", "48.2K"], ["Story views", "18.4K"], ["QR visits", "1,284"], ["Offer claims", "212"], ["Event RSVPs", "146"], ["Deliverables", "5/5"]].map(([k, v]) => (
                <div key={k} className="bg-surface p-5">
                  <dd className="font-display text-4xl">{v}</dd>
                  <dt className="mt-1 text-sm text-muted">{k}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-7">
            <p className="label">Renewal recommendation</p>
            <h2 className="mt-3 font-display text-4xl">Renew with a spring family-confidence routine.</h2>
            <p className="mt-5 leading-relaxed text-muted">
              The illustrative offer-claim rate beat the campaign target by 41%. Recommend a $15K follow-on campaign with Avery and Mia,
              subject to sponsor review and athlete approval.
            </p>
            <Link className="btn btn-red mt-7" href="/routines?athlete=avery&package=routine&ai=1#ai-brief">Draft renewal proposal</Link>
            <p className="mt-4 text-xs text-faint">Illustrative results; no historical performance is claimed.</p>
          </div>
        </section>
      )}
    </main>
  );
}

function Crm({ deals, update }: { deals: Deal[]; update: (id: string, fn: (d: Deal) => Deal) => void }) {
  return (
    <section className="mt-8">
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              {["Sponsor", "Athlete", "Proposed", "Stage", "Agreement", "Collected", "Next action"].map((h) => (
                <th key={h} className="px-5 py-4 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="px-5 py-4">
                  <p className="font-semibold">{d.sponsor}</p>
                  <p className="text-xs text-faint">{d.packageName}</p>
                </td>
                <td className="px-5 py-4">{athletes.find((a) => a.slug === d.athleteSlug)?.name}</td>
                <td className="px-5 py-4">{usd(d.amount)}</td>
                <td className="px-5 py-4">
                  <select
                    aria-label={`Stage for ${d.sponsor}`}
                    className="rounded border border-line bg-paper px-2 py-1.5"
                    value={d.stage}
                    onChange={(e) => update(d.id, (x) => ({ ...x, stage: e.target.value as Stage }))}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">{isSigned(d.stage) ? "Signed" : "Not signed"}</td>
                <td className="px-5 py-4">{usd(d.collected)}</td>
                <td className="px-5 py-4 text-muted">
                  {d.nextAction}
                  <br />
                  <span className="text-xs text-faint">{d.followUp}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-faint">
        Same pipeline as the athlete portal, admin and revenue dashboard. A signed agreement and collected funding are deliberately
        separate; record payments from the athlete portal’s Deals tab as a WRTH manager.
      </p>
    </section>
  );
}
