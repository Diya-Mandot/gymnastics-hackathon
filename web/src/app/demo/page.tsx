"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { CampaignProgress, LiveDot } from "@/components/CampaignProgress";
import { ChalkArc } from "@/components/ChalkArc";
import { Wordmark } from "@/components/Wordmark";
import { useLive } from "@/hooks/useLive";

export default function DemoHub() {
  const { campaign } = useLive();
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SITE_URL) setOrigin(window.location.origin);
  }, []);
  const qrUrl = `${origin}/support/avery`;

  return (
    <div className="relative min-h-[calc(100dvh-6px)] overflow-hidden">
      <ChalkArc className="pointer-events-none absolute -left-20 top-1/3 h-[60%] w-[75%] text-red-lit/35" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-6px)] max-w-7xl items-center gap-14 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto]">
        <div>
          <Wordmark />
          <p className="mt-14 text-sm font-semibold text-red-lit">Live demo</p>
          <h1 className="mt-4 font-display text-[clamp(52px,7vw,104px)] text-ink">
            Scan to back
            <br /><em>a gymnast.</em>
          </h1>
          <p className="mt-5 max-w-lg text-xl text-muted">Try the $10 supporter experience. No real payment happens.</p>
          <div className="card mt-10 max-w-xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-muted">{campaign.name}</p>
              <LiveDot />
            </div>
            <div className="mt-4">
              <CampaignProgress campaign={campaign} compact />
            </div>
          </div>
          <nav className="mt-8 flex flex-wrap gap-2 text-sm" aria-label="Presenter shortcuts">
            <Link href="/demo/admin" className="btn btn-ink !py-2.5">Open admin reveal</Link>
            <Link href="/demo/athlete/avery" className="btn btn-line !py-2.5">Avery’s profile</Link>
            <Link href="/match" className="btn btn-line !py-2.5">Get Matched</Link>
            <Link href="/" className="btn btn-line !py-2.5">Home</Link>
          </nav>
        </div>

        <figure className="mx-auto">
          <div className="card p-8 shadow-[0_30px_80px_-40px_rgb(28_26_23/0.4)]">
            {origin ? (
              <QRCodeSVG value={qrUrl} size={320} level="M" fgColor="#1c1a17" bgColor="#fffefa" marginSize={0} />
            ) : (
              <div className="h-[320px] w-[320px]" />
            )}
          </div>
          <figcaption className="mt-4 break-all text-center text-sm text-muted">{qrUrl.replace(/^https?:\/\//, "")}</figcaption>
        </figure>
      </div>
    </div>
  );
}
