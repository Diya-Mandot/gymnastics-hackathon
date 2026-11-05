import Link from "next/link";
import { availabilityLabel, causeLabels, compact, usd } from "@/lib/labels";
import type { Athlete } from "@/lib/types";
import { AthletePortrait } from "./AthletePortrait";
import { DataTag, FeatureBadge } from "./Badges";

export function AthleteCard({ athlete, showActions = true }: { athlete: Athlete; showActions?: boolean }) {
  return (
    <article className="group card flex flex-col p-3 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-ink/25">
      <Link href={`/athletes/${athlete.slug}`} className="relative block aspect-square overflow-hidden rounded-[14px]" aria-label={`View ${athlete.name}'s profile`}>
        <AthletePortrait athlete={athlete} className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3">
          <FeatureBadge type={athlete.featureType} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-3xl text-ink">{athlete.name}</h3>
          <DataTag kind="estimate">Sample campaign</DataTag>
        </div>
        <p className="mt-0.5 text-sm text-muted">{athlete.specialty} · {athlete.classYear}</p>
        <p className="mt-3 text-[15px] leading-snug text-ink/85">{athlete.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {athlete.causes.slice(0, 2).map((c) => (
            <span key={c} className="tag">{causeLabels[c]}</span>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-3 border-t border-line pt-4">
          <Metric label="Reach" value={compact(athlete.reach)} />
          <Metric label="Engagement" value={`${athlete.engagementRate}%`} />
          <Metric label="From" value={usd(athlete.budgetMin).replace(",000", "K")} />
        </dl>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${athlete.daysUntilAvailable <= 14 ? "bg-green" : "bg-faint"}`} />
          {availabilityLabel(athlete.daysUntilAvailable)}
        </p>

        {showActions && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link href={`/routines?athlete=${athlete.slug}`} className="btn btn-line !px-3 !py-2.5 text-sm">
              Sponsor
            </Link>
            <Link href={`/support/${athlete.slug}`} className="btn btn-red !px-3 !py-2.5 text-sm">
              Support
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="font-display text-xl font-medium text-ink tabular-nums">{value}</dd>
      <dt className="text-[11px] text-faint">{label}</dt>
    </div>
  );
}
