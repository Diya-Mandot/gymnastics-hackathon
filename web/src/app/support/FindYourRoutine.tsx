"use client";

import Link from "next/link";
import { useState } from "react";
import { AthletePortrait } from "@/components/AthletePortrait";
import { causeLabels, lower, sentenceTail } from "@/lib/labels";
import { athletes } from "@/lib/seed";
import type { Cause } from "@/lib/types";

const questions = [
  {
    key: "cause",
    q: "What matters most to you?",
    options: [
      ["youth-confidence", "Kids’ confidence"],
      ["inclusion", "Everyone belonging"],
      ["education-stem", "Learning & STEM"],
      ["wellness", "Health & family"],
    ],
  },
  {
    key: "how",
    q: "How do you want to get involved?",
    options: [
      ["watch", "Watch stories"],
      ["give", "Give or subscribe"],
      ["share", "Share a message"],
      ["meet", "Show up at a meet"],
    ],
  },
  {
    key: "who",
    q: "Who are you here for?",
    options: [
      ["me", "Myself"],
      ["kids", "My kids"],
      ["alum", "I’m a Ute alum"],
      ["new", "New to Red Rocks"],
    ],
  },
] as const;

const firstAction: Record<string, (name: string) => string> = {
  watch: (n) => `Watch ${n}’s story`,
  give: (n) => `Back ${n} with $10`,
  share: () => "Share a confidence note",
  meet: () => "Get meet-night QR offers",
};

export function FindYourRoutine() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const step = questions.findIndex((q) => !answers[q.key]);
  const done = step === -1;

  const cause = answers.cause as Cause | undefined;
  const athlete = (cause && athletes.find((a) => a.causes[0] === cause)) || athletes[0];

  return (
    <div className="card p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-red-lit">Find your routine</p>
        {!done && (
          <span className="text-sm tabular-nums text-muted">
            {step + 1}/{questions.length}
          </span>
        )}
      </div>
      {!done ? (
        <>
          <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">{questions[step].q}</h2>
          <div className="mt-8 grid gap-2.5 sm:grid-cols-4">
            {questions[step].options.map(([v, label]) => (
              <button
                key={v}
                onClick={() => setAnswers((a) => ({ ...a, [questions[step].key]: v }))}
                className="rounded-[16px] border border-line bg-paper px-5 py-5 text-left font-semibold text-ink transition-colors hover:border-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 grid items-center gap-8 md:grid-cols-[220px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-[18px]">
            <AthletePortrait athlete={athlete} className="absolute inset-0" />
          </div>
          <div>
            <h2 className="font-display text-4xl text-ink sm:text-5xl">Meet {athlete.firstName}.</h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              You care about {lower(causeLabels[athlete.causes[0]])}. {athlete.firstName} {sentenceTail(athlete.tagline)}{" "}
              {athlete.slug === "avery" && "She’s leading Confidence Starts Here with Girls on the Run Utah."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={answers.how === "watch" ? `/athletes/${athlete.slug}` : `/support/${athlete.slug}`} className="btn btn-red">
                {firstAction[answers.how](athlete.firstName)}
              </Link>
              <Link href={`/athletes/${athlete.slug}`} className="btn btn-line">See her profile</Link>
              <button onClick={() => setAnswers({})} className="px-3 text-sm text-muted hover:text-ink">Start over</button>
            </div>
            <p className="mt-4 text-xs text-faint">Demo profile with a real Red Rocks photo. Name, story and stats are demo content.</p>
          </div>
        </div>
      )}
    </div>
  );
}
