import { BreakEven, DealSplit } from "@/components/DealEconomics";
import { sponsorReturn } from "@/lib/nilModel";
import { sponsorPackages } from "@/lib/seed";

// What each package is meant to do for the sponsor's business, and how results are counted.
const value: Record<string, { objective: string; actions: string; attribution: string }> = {
  spark: {
    objective: "Drive first visits or sign-ups for one local offer.",
    actions: "Scan the QR at a meet or on social, claim the offer, make a first purchase or sign-up.",
    attribution: "One unique QR link and one promo code per campaign.",
  },
  routine: {
    objective: "Win new local customers through a full athlete-led campaign.",
    actions: "Watch the athlete story, scan at meet night, claim the sponsor offer, book or buy.",
    attribution: "Unique QR links per placement, campaign promo code, offer redemptions reported by the sponsor.",
  },
  partner: {
    objective: "Season-long customer growth across several athletes and an event.",
    actions: "Attend the community event, join the sponsor’s list, open an account or start a membership.",
    attribution: "Per-athlete referral links and codes, event check-ins, sponsor CRM match on new customers.",
  },
};

export function SponsorValue() {
  const pkgs = sponsorPackages.filter((p) => value[p.id]);
  const example = sponsorReturn(15_000, 100, 200);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-8" aria-label="How sponsors make money">
      <p className="text-sm font-semibold text-red-lit">For sponsors</p>
      <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
        How a sponsorship <em>pays for itself.</em>
      </h2>
      <p className="mt-4 max-w-3xl text-muted">
        Each package has a business goal, customer actions we can count, and a break-even number. Community goodwill is a bonus
        on top, not the reason the numbers work.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {pkgs.map((p) => (
          <article key={p.id} className="card flex flex-col gap-5 p-6">
            <div>
              <p className="label">{p.name}</p>
              <p className="mt-1 font-display text-4xl text-ink">{p.priceLabel}</p>
            </div>
            <dl className="grid gap-3 text-sm">
              <div><dt className="font-semibold text-ink">Business goal</dt><dd className="text-muted">{value[p.id].objective}</dd></div>
              <div><dt className="font-semibold text-ink">Customer actions counted</dt><dd className="text-muted">{value[p.id].actions}</dd></div>
              <div><dt className="font-semibold text-ink">How we attribute them</dt><dd className="text-muted">{value[p.id].attribution}</dd></div>
            </dl>
            <BreakEven cost={p.price} />
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="label">Worked example</p>
          <p className="mt-3 font-display text-3xl text-ink">$15,000 Impact Routine</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Sponsor earns $100 contribution margin per new customer.</li>
            <li>Break-even: <b className="text-ink">150 new customers</b>.</li>
            <li>At 200 new customers: ${example.contribution.toLocaleString()} contribution, <b className="text-ink">${example.net.toLocaleString()} net</b>, {example.roiPct.toFixed(1)}% ROI.</li>
          </ul>
          <p className="mt-4 text-xs text-faint">Illustrative. Uses the sponsor’s real margin, and counts only customers the campaign’s links and codes can prove.</p>
        </div>
        <div className="card p-6">
          <DealSplit amount={15_000} title="Where a $15,000 routine goes" />
        </div>
      </div>
    </section>
  );
}
