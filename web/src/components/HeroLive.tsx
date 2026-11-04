"use client";

import Link from "next/link";
import { useLive } from "@/hooks/useLive";
import { usd } from "@/lib/labels";
import { AnimatedNumber } from "./AnimatedNumber";
import { LiveDot, ProgressBar } from "./CampaignProgress";

/** Small live strip under the hero headline. */
export function HeroLive() {
  const { campaign } = useLive();
  return (
    <Link href="/support/avery" className="card group block p-5 transition-colors hover:border-ink/25">
      <div className="flex items-center justify-between">
        <LiveDot />
        <span className="text-xs text-muted transition-colors group-hover:text-ink">Back Avery →</span>
      </div>
      <p className="mt-3 text-sm text-muted">{campaign.name}</p>
      <p className="mt-1 font-display text-4xl font-medium text-ink">
        <AnimatedNumber value={campaign.raised} format={(n) => usd(n)} />
        <span className="ml-2 font-sans text-sm font-normal text-faint">of {usd(campaign.goal)}</span>
      </p>
      <ProgressBar value={campaign.raised} max={campaign.goal} className="mt-4 h-1.5" />
    </Link>
  );
}
