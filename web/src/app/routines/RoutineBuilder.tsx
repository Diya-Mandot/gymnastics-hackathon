"use client";

import Link from "next/link";
import { useState } from "react";
import { AiBriefPanel } from "@/components/AiBriefPanel";
import { AthletePortrait } from "@/components/AthletePortrait";
import { DemoBadge } from "@/components/Badges";
import { audienceLabels, causeLabels, compact, lower, sentenceTail } from "@/lib/labels";
import { athletes, sponsorPackages } from "@/lib/seed";
import type { Athlete } from "@/lib/types";

export function RoutineBuilder({ athlete: initial, initialPackage, autoAi = false }: { athlete: Athlete; initialPackage: string; autoAi?: boolean }) {
  const [athlete, setAthlete] = useState(initial);
  const [pkgId, setPkgId] = useState(initialPackage);
  const [sent, setSent] = useState(false);
  const pkg = sponsorPackages.find((p) => p.id === pkgId)!;

  const outcome: [string, string][] = [
    ["Who you reach", `${compact(athlete.reach)} followers, ${athlete.localAudiencePct}% in Utah. Strongest with ${athlete.audiences.slice(0, 2).map((a) => lower(audienceLabels[a])).join(" and ")}.`],
    ["Why she fits", `${athlete.firstName} leads on ${athlete.causes.slice(0, 2).map((c) => lower(causeLabels[c])).join(" and ")}. She ${sentenceTail(athlete.tagline)}`],
    ["What you receive", pkg.perks.join(", ") + "."],
    ["Fan action included", "QR activation at a meet night, confidence notes, and your sponsor offer unlocked by fans."],
    ["Community impact", "Funds an athlete-led community activation with a WRTH-aligned partner."],
    ["How success is measured", "QR scans, offer claims, fan actions, video views, event attendance, and a renewal recommendation."],
  ];

  return (
    <>
      <section className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.4fr]" aria-label="Build a campaign">
        <div className="card p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px]">
            <AthletePortrait athlete={athlete} className="absolute inset-0" />
            <div className="absolute left-3 top-3"><DemoBadge /></div>
          </div>
          <div className="space-y-6 p-3 pt-5">
            <label className="block">
              <span className="text-sm text-muted">Athlete</span>
              <select
                value={athlete.slug}
                onChange={(e) => {
                  setAthlete(athletes.find((a) => a.slug === e.target.value)!);
                  setSent(false);
                }}
                className="input mt-2 appearance-none font-display text-xl"
              >
                {athletes.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </label>
            <fieldset>
              <legend className="text-sm text-muted">Package</legend>
              <div className="mt-2 grid gap-2">
                {sponsorPackages.map((p) => (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center justify-between rounded-[14px] border px-4 py-3.5 transition-colors ${
                      pkgId === p.id ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink hover:border-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pkg"
                      value={p.id}
                      checked={pkgId === p.id}
                      onChange={() => {
                        setPkgId(p.id);
                        setSent(false);
                      }}
                      className="sr-only"
                    />
                    <span className="font-medium">{p.name}</span>
                    <span className="font-display">{p.priceLabel}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        <div className="card p-6 sm:p-10">
          <p className="text-sm font-semibold text-red-lit">Your Impact Routine</p>
          <h2 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            {pkg.name} with {athlete.firstName}
          </h2>
          <dl className="mt-8 grid gap-x-8 sm:grid-cols-2">
            {outcome.map(([k, v]) => (
              <div key={k} className="border-t border-line py-5">
                <dt className="text-sm font-semibold text-ink">{k}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {sent ? (
              <p role="status" className="rounded-full bg-green/15 px-5 py-3 text-sm text-green">
                ✓ Proposal drafted for the WRTH team to review. Nothing was sent or charged.
              </p>
            ) : (
              <button onClick={() => setSent(true)} className="btn btn-red">Request this campaign</button>
            )}
            <Link href={`/athletes/${athlete.slug}`} className="btn btn-line">View {athlete.firstName}’s profile</Link>
          </div>
          <p className="mt-4 text-xs text-faint">Demo only. The athlete reviews and approves every public output.</p>
        </div>
      </section>
      <div id="ai-brief" className="scroll-mt-24">
        <AiBriefPanel athlete={athlete} pkg={pkg} autoStart={autoAi} />
      </div>
    </>
  );
}
