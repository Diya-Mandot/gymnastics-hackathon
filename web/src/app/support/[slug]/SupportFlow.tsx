"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AthletePortrait } from "@/components/AthletePortrait";
import { NoPaymentNotice } from "@/components/Badges";
import { CampaignProgress, LiveDot } from "@/components/CampaignProgress";
import { RockedCard } from "@/components/RockedCard";
import { Wordmark } from "@/components/Wordmark";
import { useLive } from "@/hooks/useLive";
import { usd } from "@/lib/labels";
import type { Athlete } from "@/lib/types";

const AMOUNTS = [10, 25, 100];

type Phase = "choose" | "sending" | "done" | "error";

export function SupportFlow({ athlete }: { athlete: Athlete }) {
  const { campaign, give } = useLive();
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("choose");
  const [supporterNo, setSupporterNo] = useState(0);

  const isCustom = custom !== "";
  const finalAmount = isCustom ? Math.max(1, Math.round(Number(custom) || 0)) : amount;
  const supporter = name.trim() || "Demo Judge";

  async function onGive() {
    if (phase === "sending" || finalAmount < 1) return;
    setPhase("sending");
    try {
      const e = await give({
        athleteSlug: athlete.slug,
        amount: finalAmount,
        supporterName: supporter,
        supportType: finalAmount >= 100 ? "Impact Champion" : "One-time supporter",
      });
      setSupporterNo(e.state.campaign.supporters);
      setPhase("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-44">
      <header className="flex items-center justify-between px-5 pb-3 pt-4">
        <Wordmark />
        <LiveDot />
      </header>

      <AnimatePresence mode="wait">
        {phase !== "done" ? (
          <motion.div key="choose" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="px-5">
            {/* Athlete */}
            <section className="flex items-center gap-4 pt-3">
              <AthletePortrait athlete={athlete} className="h-[88px] w-[88px] shrink-0 rounded-[18px]" priority />
              <div>
                <p className="text-sm font-semibold text-red-lit">Scan to back a gymnast</p>
                <h1 className="mt-1 font-display text-[39px] text-ink">Back {athlete.firstName}</h1>
                <p className="text-xs text-faint">Demo profile · real Red Rocks photo</p>
              </div>
            </section>
            <p className="mt-5 text-[17px] leading-relaxed text-ink/85">“{athlete.quote}”</p>

            <section className="card mt-6 p-5">
              <p className="text-sm text-muted">{campaign.name}</p>
              <div className="mt-3">
                <CampaignProgress campaign={campaign} compact />
              </div>
            </section>

            {/* Amount */}
            <section className="mt-8" aria-labelledby="amount-label">
              <h2 id="amount-label" className="font-display text-2xl text-ink">Choose an amount</h2>
              <div className="mt-4 grid grid-cols-4 gap-2" role="radiogroup" aria-labelledby="amount-label">
                {AMOUNTS.map((a) => {
                  const on = !isCustom && amount === a;
                  return (
                    <button
                      key={a}
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setAmount(a);
                        setCustom("");
                      }}
                      className={`h-14 rounded-2xl border font-display text-xl transition-colors ${
                        on ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink"
                      }`}
                    >
                      ${a}
                    </button>
                  );
                })}
                <label className={`flex h-14 items-center rounded-2xl border transition-colors ${isCustom ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink"}`}>
                  <span className="sr-only">Custom amount in dollars</span>
                  <span className="pl-3 font-display text-xl opacity-50">$</span>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Other"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
                    className="w-full bg-transparent px-1 font-display text-xl outline-none placeholder:font-sans placeholder:text-base placeholder:text-faint"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm text-muted">Your name on the supporter wall (optional)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 40))}
                  placeholder="Demo Judge"
                  autoComplete="off"
                  className="input mt-2"
                />
              </label>

              <div className="mt-8 border-t border-line pt-6">
                <p className="font-medium text-ink">Where does my money go?</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  100% of contributions support Utah gymnasts through Who Rocks the House and their participation in
                  charitable, civic, educational, and community-focused activities.
                </p>
              </div>
            </section>

            {/* Sticky thumb-zone CTA */}
            <div className="fixed inset-x-0 bottom-0 z-40">
              <div className="mx-auto max-w-md border-t border-line bg-paper/95 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
                <NoPaymentNotice className="mb-3 justify-center" />
                <button onClick={onGive} disabled={phase === "sending"} className="btn btn-red h-14 w-full text-[17px]">
                  {phase === "sending" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                      Sending your support…
                    </>
                  ) : (
                    <>Give {usd(finalAmount)} demo</>
                  )}
                </button>
                {phase === "error" && (
                  <p role="alert" className="mt-2 text-center text-sm text-red-lit">
                    That didn’t go through. Tap again to retry.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="px-5"
          >
            <section className="pt-8 text-center" aria-live="polite">
              <p className="text-sm font-semibold text-red-lit">Thank you, {supporter}</p>
              <h1 className="mt-3 font-display text-[46px] text-ink">You rocked <em>the routine.</em></h1>
              <p className="mt-3 text-muted">
                Your {usd(finalAmount)} just joined {campaign.supporters.toLocaleString()} supporters behind {athlete.firstName}.
              </p>
            </section>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 24, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 18 }}
            >
              <RockedCard athlete={athlete} amount={finalAmount} supporter={supporter} number={supporterNo} />
            </motion.div>

            <section className="card mt-8 p-5">
              <p className="flex items-center justify-between text-sm text-muted">
                {campaign.name} <LiveDot label="Updated" />
              </p>
              <div className="mt-3">
                <CampaignProgress campaign={campaign} compact />
              </div>
            </section>

            <section className="mt-6 border-l-2 border-red pl-5">
              <p className="text-sm text-muted">A note from {athlete.firstName}</p>
              <p className="mt-2 text-[17px] leading-relaxed text-ink">“{athlete.thankYou}”</p>
              <p className="mt-3 text-xs text-faint">Thank-you pack sent · story video unlocked</p>
            </section>

            <div className="mt-8 grid gap-2">
              <ShareButton name={athlete.firstName} />
              <Link href={`/athletes/${athlete.slug}`} className="btn btn-line w-full">
                Watch {athlete.firstName}’s story
              </Link>
              <button
                onClick={() => {
                  setPhase("choose");
                  setCustom("");
                }}
                className="py-3 text-sm text-muted hover:text-ink"
              >
                Give again
              </button>
            </div>
            <NoPaymentNotice className="mt-2 justify-center pb-8" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const data = { title: "Rock the Routine", text: `I just backed ${name} on Rock the Routine.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }
  return (
    <button onClick={share} className="btn btn-red w-full">
      {copied ? "Link copied" : "Share the campaign"}
    </button>
  );
}
