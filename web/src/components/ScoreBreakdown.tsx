import { WEIGHTS, type ScoreBreakdown as Breakdown } from "@/lib/match";

const labels: Record<keyof typeof WEIGHTS, string> = {
  cause: "Cause alignment",
  audience: "Audience fit",
  format: "Campaign format",
  budget: "Budget fit",
  availability: "Availability",
};

export function ScoreBreakdown({ breakdown }: { breakdown: Breakdown }) {
  return (
    <dl className="space-y-3">
      {(Object.keys(WEIGHTS) as Array<keyof typeof WEIGHTS>).map((k) => {
        const pct = (breakdown[k] / WEIGHTS[k]) * 100;
        return (
          <div key={k}>
            <div className="flex justify-between text-xs">
              <dt className="text-muted">
                {labels[k]} <span className="text-faint">· {WEIGHTS[k]}%</span>
              </dt>
              <dd className="tabular-nums text-ink">
                {Math.round(breakdown[k] * 10) / 10}/{WEIGHTS[k]}
              </dd>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-sand">
              <div className="h-full rounded-full bg-red" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </dl>
  );
}

/** Thin ring with the match percentage. */
export function MatchRing({ score, size = 88 }: { score: number; size?: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${score}% match`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-sand)" strokeWidth="3" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-red)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-medium leading-none text-ink" style={{ fontSize: size * 0.22 }}>
            {score}%
          </div>
          <div className="mt-0.5 text-[10px] text-muted">match</div>
        </div>
      </div>
    </div>
  );
}
