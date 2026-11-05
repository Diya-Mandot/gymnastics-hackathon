"use client";

import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { RAFFLE } from "@/lib/raffle";

// For the arena screen / a printed sign: scan to play Routine IQ on your phone.
export default function ArenaQR() {
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SITE_URL) setOrigin(window.location.origin);
  }, []);
  const url = `${origin}/live/iq`;

  return (
    <main className="on-photo relative min-h-[85svh] overflow-hidden">
      <Image src="/images/arena-crowd.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.94),rgb(15_14_13/0.75)_55%,rgb(120_0_0/0.5))]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-[1fr_auto]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 text-sm font-semibold text-white">
            <span className="h-2 w-2 animate-live rounded-full bg-white" aria-hidden="true" /> Live at the meet
          </span>
          <h1 className="mt-5 font-display text-[clamp(56px,8vw,120px)] leading-[0.9] text-white">
            Scan. Play. <em className="text-red-lit">Win.</em>
          </h1>
          <p className="mt-5 max-w-xl text-xl text-white/85">
            Answer one Routine IQ question on your phone. Sign up free to collect an athlete card and a ticket for tonight’s raffle.
          </p>
          <p className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-gold px-4 py-3 text-lg font-semibold text-black">
            🎟️ Raffle prize: {RAFFLE.prize}
          </p>
          <p className="mt-3 text-sm text-white/60">Sample prize for the demo. Free to play; no purchase needed.</p>
        </div>
        <figure className="mx-auto rounded-[28px] bg-[#fffefa] p-6 shadow-2xl">
          {origin ? (
            <QRCodeSVG value={url} size={300} level="M" fgColor="#1c1a17" bgColor="#fffefa" marginSize={0} />
          ) : (
            <div className="h-[300px] w-[300px]" aria-hidden="true" />
          )}
          <figcaption className="mt-4 max-w-[300px] break-all text-center text-sm text-[#5c574f]">{url.replace(/^https?:\/\//, "")}</figcaption>
        </figure>
      </div>
    </main>
  );
}
