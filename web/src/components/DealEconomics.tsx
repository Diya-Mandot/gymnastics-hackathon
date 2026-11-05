import { DataTag } from "./Badges";
import { allocation, breakEvenCustomers, contributionScenarios, splitDeal } from "@/lib/nilModel";

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Where a sponsorship's money goes: athlete pay, costs and platform fee, shown separately. */
export function DealSplit({ amount, title = "Where the money goes" }: { amount: number; title?: string }) {
  const parts = splitDeal(amount);
  return (
    <div aria-label="Deal allocation">
      <p className="label flex flex-wrap items-center gap-2">{title} · {usd(amount)} <DataTag kind="estimate" /></p>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full" aria-hidden="true">
        {allocation.map((a, i) => (
          <span key={a.key} style={{ width: `${a.pct * 100}%` }} className={["bg-red", "bg-ink/70", "bg-ink/45", "bg-ink/25", "bg-line"][i]} />
        ))}
      </div>
      <table className="mt-4 w-full text-sm">
        <tbody>
          {allocation.map((a) => (
            <tr key={a.key} className="border-b border-line last:border-0">
              <td className="py-2 text-muted">
                <span className={a.key === "athlete" ? "font-semibold text-ink" : ""}>{a.label}</span>
                <span className="block text-xs text-faint">{a.note}</span>
              </td>
              <td className="py-2 text-right text-muted">{Math.round(a.pct * 100)}%</td>
              <td className={`py-2 text-right font-display text-lg ${a.key === "athlete" ? "text-ink" : "text-muted"}`}>{usd(parts[a.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-faint">Proposed 65/12/10/8/5 split, not an industry benchmark. Real splits depend on deliverables, NIL rules and costs.</p>
    </div>
  );
}

/** Customers a sponsor needs to break even, at three illustrative contribution margins. */
export function BreakEven({ cost }: { cost: number }) {
  return (
    <div aria-label="Sponsor break-even">
      <p className="label flex flex-wrap items-center gap-2">Sponsor break-even · {usd(cost)} <DataTag kind="estimate" /></p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {contributionScenarios.map((c) => (
          <div key={c.perCustomer} className="rounded-[14px] border border-line p-3">
            <p className="font-display text-3xl text-ink">{breakEvenCustomers(cost, c.perCustomer).toLocaleString()}</p>
            <p className="text-xs text-muted">new customers at {usd(c.perCustomer)} each</p>
            <p className="mt-1 text-[11px] text-faint">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-faint">
        Customers needed = package cost ÷ contribution margin per new customer. Count only incremental customers tracked through
        the campaign’s QR links and promo codes. Goodwill and awareness are extra, not counted as return.
      </p>
    </div>
  );
}
