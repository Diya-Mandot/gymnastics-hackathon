"use client";

import { usd } from "@/lib/labels";
import type { Campaign } from "@/lib/types";
import { AnimatedNumber } from "./AnimatedNumber";

export function LiveDot({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold text-red-lit">
      <i className="h-1.5 w-1.5 animate-live rounded-full bg-red" aria-hidden="true" />
      {label}
    </span>
  );
}

export function ProgressBar({ value, max, className = "h-2" }: { value: number; max: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      className={`overflow-hidden rounded-full bg-sand ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label="Campaign progress"
    >
      <div className="h-full rounded-full bg-red transition-[width] duration-1000 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function CampaignProgress({ campaign, compact = false }: { campaign: Campaign; compact?: boolean }) {
  const pct = Math.round((campaign.raised / campaign.goal) * 100);
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="label">Raised so far</p>
          <p className={`mt-2 font-display font-medium text-ink ${compact ? "text-5xl" : "text-6xl sm:text-7xl"}`}>
            <AnimatedNumber value={campaign.raised} format={(n) => usd(n)} />
          </p>
        </div>
        <p className="pb-1 text-right text-sm text-muted">
          {pct}% of {usd(campaign.goal)}
        </p>
      </div>
      <ProgressBar value={campaign.raised} max={campaign.goal} className="mt-5 h-2" />
      <dl className="mt-6 grid grid-cols-3 divide-x divide-line border-t border-line pt-5">
        <Stat label="Supporters" value={<AnimatedNumber value={campaign.supporters} />} first />
        <Stat label="Business" value={usd(campaign.businessFunding)} />
        <Stat label="Fans" value={<AnimatedNumber value={campaign.fanContributions} format={(n) => usd(n)} />} />
      </dl>
    </div>
  );
}

function Stat({ label, value, first = false }: { label: string; value: React.ReactNode; first?: boolean }) {
  return (
    <div className={first ? "pr-3" : "px-3"}>
      <dd className="font-display text-3xl font-medium text-ink">{value}</dd>
      <dt className="mt-1 text-xs text-muted">{label}</dt>
    </div>
  );
}
