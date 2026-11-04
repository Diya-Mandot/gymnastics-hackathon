"use client";

import Link from "next/link";
import { useLive } from "@/hooks/useLive";
import type { Athlete } from "@/lib/types";
import { NoPaymentNotice } from "./Badges";
import { CampaignProgress, LiveDot } from "./CampaignProgress";

export function YourImpact({ athlete }: { athlete: Athlete }) {
  const { campaign } = useLive();
  const leads = campaign.athleteSlug === athlete.slug;
  return (
    <div className="card grid gap-10 p-6 sm:p-10 lg:grid-cols-2">
      <div>
        <p className="text-sm font-semibold text-red-lit">Your impact</p>
        <h2 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Where does my <em>money go?</em></h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          100% of contributions support Utah gymnasts through Who Rocks the House and their participation in charitable,
          civic, educational, and community-focused activities.
        </p>
        <ul className="mt-6 space-y-2.5">
          {campaign.supports.map((s) => (
            <li key={s} className="flex gap-3 text-ink">
              <span className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-red" />
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[16px] bg-paper p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="text-muted">
            {campaign.name}
            {!leads && <span className="text-faint"> · team campaign</span>}
          </p>
          <LiveDot />
        </div>
        <div className="mt-5">
          <CampaignProgress campaign={campaign} />
        </div>
        <Link href={`/support/${athlete.slug}`} className="btn btn-red mt-8 w-full sm:w-auto">
          Give $10 demo
        </Link>
        <NoPaymentNotice className="mt-3" />
      </div>
    </div>
  );
}
