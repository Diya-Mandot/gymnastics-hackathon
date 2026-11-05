"use client";

import Image from "next/image";
import Link from "next/link";
import { useLive } from "@/hooks/useLive";
import { CampaignProgress, LiveDot } from "./CampaignProgress";
import { NoPaymentNotice } from "./Badges";

export function FeaturedCampaign() {
  const { campaign } = useLive();
  return (
    <div className="card grid overflow-hidden p-3 lg:grid-cols-[1.1fr_1fr]">
      <div className="p-5 sm:p-8">
        <LiveDot label="Live campaign" />
        <h3 className="mt-4 font-display text-4xl text-ink sm:text-5xl">{campaign.name}</h3>
        <p className="mt-3 max-w-md text-muted">
          Led by Avery Neff with {campaign.partner}. Funded by {campaign.sponsorName}
          <span className="text-faint"> (fictional sponsor)</span>.
        </p>
        <div className="mt-10">
          <CampaignProgress campaign={campaign} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/support/avery" className="btn btn-red">Give $10 demo</Link>
          <Link href="/routines" className="btn btn-line">See the routine</Link>
        </div>
        <NoPaymentNotice className="mt-4" />
      </div>

      <div className="flex flex-col overflow-hidden rounded-[14px] bg-sand-soft">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1">
          <Image
            src="/images/team-huddle.jpg"
            alt="Red Rocks gymnasts huddled with their coaches during a meet"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <p className="label">Where the money goes</p>
          <ul className="mt-4 space-y-2.5">
            {campaign.supports.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] text-ink">
                <span className="mt-2 h-1 w-3 shrink-0 rounded-full bg-red" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
