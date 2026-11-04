import { usd } from "@/lib/labels";
import type { Athlete } from "@/lib/types";
import { ChalkArc } from "./ChalkArc";

/** The digital "I Rocked the Routine" card supporters receive, styled like a ticket stub. */
export function RockedCard({ athlete, amount, supporter, number }: {
  athlete: Athlete;
  amount: number;
  supporter: string;
  number: number;
}) {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[22px] bg-surface shadow-[0_24px_60px_-28px_rgb(28_26_23/0.35)] ring-1 ring-line">
      <div className="relative h-[230px] overflow-hidden rounded-t-[22px] bg-red px-6 pt-5 text-white">
        <ChalkArc className="absolute inset-x-0 top-10 h-40 w-full text-white/50" dashed />
        <div className="relative flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
          <span>Rock the Routine</span>
          <span>No. {number}</span>
        </div>
        <p className="absolute bottom-5 left-6 font-display text-[44px] italic leading-[0.92]">
          I Rocked
          <br />
          the Routine
        </p>
      </div>
      {/* perforation */}
      <div className="relative h-0 border-t border-dashed border-line">
        <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-paper" />
        <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-paper" />
      </div>
      <dl className="grid grid-cols-2 gap-y-3 px-6 py-5 text-sm">
        <dt className="text-muted">Backed</dt>
        <dd className="text-right font-medium text-ink">{athlete.name}</dd>
        <dt className="text-muted">Campaign</dt>
        <dd className="text-right font-medium text-ink">Confidence Starts Here</dd>
        <dt className="text-muted">{supporter}</dt>
        <dd className="text-right font-display text-2xl font-medium text-ink">{usd(amount)}</dd>
      </dl>
      <p className="border-t border-line px-6 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-faint">
        Demo card · no payment processed
      </p>
    </div>
  );
}
