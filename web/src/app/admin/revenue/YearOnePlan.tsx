import { DataTag } from "@/components/Badges";
import { EXISTING_BASELINE, lineTotal, planTotals, reporting, year1Plan } from "@/lib/nilModel";

const k = (n: number) => (n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0)}M` : `$${Math.round(n / 1000)}K`);
const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** The team's three-year target and how Year 1 is built, reconciled with the funnel simulator below. Team-only. */
export function YearOnePlan({ simulatedNew, scenario }: { simulatedNew: number; scenario: string }) {
  const plan = planTotals();
  const r = reporting();
  const path = [
    { label: "Today (unverified)", value: EXISTING_BASELINE },
    { label: "Year 1 plan", value: plan.total },
    { label: "Year 2 target", value: 1_240_000 },
    { label: "Year 3 goal", value: 2_000_000 },
  ];
  const measures = [
    { label: "Year 1 plan: total NIL activity", value: plan.total, body: "Gross value of every deal and fan payment, plus the existing $200K baseline. Assumes the package mix below all sells." },
    { label: "Year 1 plan: new NIL activity", value: plan.newActivity, body: "Same plan without the baseline." },
    { label: `Simulator (${scenario}): new collected funding`, value: simulatedNew, body: "Cash actually collected in Year 1 after a realistic sales funnel, close rate and collection rate. No baseline." },
  ];

  return (
    <section className="card mt-8 p-6" aria-label="Year 1 plan">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-ink">The plan: $200K to $2M in NIL activity</h2>
        <p className="flex items-center gap-2 text-xs text-faint"><DataTag kind="estimate" /> Team view only · planning targets, not guarantees</p>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {path.map((p, i) => (
          <li key={p.label} className={`rounded-[14px] border p-4 ${i === 1 ? "border-red" : "border-line"}`}>
            <p className="text-xs text-muted">{p.label}</p>
            <p className="mt-1 font-display text-4xl text-ink">{k(p.value)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="label">How the Year 1 plan adds up</p>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {year1Plan.map((l) => (
                <tr key={l.stream} className="border-b border-line">
                  <td className="py-2 text-ink">{l.stream}</td>
                  <td className="py-2 text-muted">{l.count.toLocaleString()} × {usd(l.unit)}{l.months ? ` × ${l.months} mo` : ""}</td>
                  <td className="py-2 text-right text-ink">{usd(lineTotal(l))}</td>
                </tr>
              ))}
              <tr className="border-b border-line"><td className="py-2 font-semibold text-ink" colSpan={2}>New NIL activity</td><td className="py-2 text-right font-semibold text-ink">{usd(plan.newActivity)}</td></tr>
              <tr className="border-b border-line"><td className="py-2 text-muted" colSpan={2}>Existing baseline (unverified)</td><td className="py-2 text-right text-muted">{usd(plan.baseline)}</td></tr>
              <tr><td className="py-2 font-semibold text-ink" colSpan={2}>Total · {plan.multiple.toFixed(2)}× today</td><td className="py-2 text-right font-display text-2xl text-red-lit">{usd(plan.total)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-faint">Check before presenting: the $200K baseline must not already include any stream above, or it is double-counted.</p>
        </div>

        <div className="grid h-fit gap-6">
          <div>
            <p className="label">Three numbers, three meanings</p>
            <ul className="mt-3 grid gap-2">
              {measures.map((m) => (
                <li key={m.label} className="rounded-[14px] border border-line p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">{m.label}</span>
                    <span className="font-display text-2xl text-ink">{k(m.value)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{m.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label">Where the plan’s sponsor money goes</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-[14px] border border-line p-3"><dt className="text-xs text-muted">Athlete pay (65%)</dt><dd className="font-display text-2xl text-ink">{k(r.athleteFromSponsorships)}</dd></div>
              <div className="rounded-[14px] border border-line p-3"><dt className="text-xs text-muted">Campaign costs (30%)</dt><dd className="font-display text-2xl text-ink">{k(r.campaignCosts)}</dd></div>
              <div className="rounded-[14px] border border-line p-3"><dt className="text-xs text-muted">Platform fee (5%)</dt><dd className="font-display text-2xl text-ink">{k(r.platformRevenue)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-faint">Of {usd(plan.sponsorActivity)} in planned sponsorships. Platform fee is gross revenue, not profit.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
