"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AthletePortrait } from "@/components/AthletePortrait";
import { FeatureBadge } from "@/components/Badges";
import { ChalkArc } from "@/components/ChalkArc";
import { MatchRing, ScoreBreakdown } from "@/components/ScoreBreakdown";
import { audienceLabels, availabilityLabel, campaignTypeLabels, causeLabels, compact, lower, usd } from "@/lib/labels";
import { topMatches, type MatchResult, type SponsorBrief } from "@/lib/match";
import type { Athlete, Audience, CampaignType, Cause } from "@/lib/types";

type Step = {
  key: keyof SponsorBrief;
  question: string;
  options: { value: string | number; label: string; hint?: string }[];
};

const steps: Step[] = [
  {
    key: "goal",
    question: "What do you want your business to achieve?",
    options: [
      { value: "Reach Utah families and build local trust", label: "Reach Utah families", hint: "Build local trust" },
      { value: "Launch something new in Utah", label: "Launch something new", hint: "Product or location" },
      { value: "Drive visits and sign-ups", label: "Drive visits & sign-ups", hint: "Measurable leads" },
      { value: "Show up for the community", label: "Community goodwill", hint: "Values-led brand" },
    ],
  },
  {
    key: "audience",
    question: "Who do you want to reach?",
    options: (["utah-families", "young-athletes", "students", "parents", "young-professionals", "alumni"] as Audience[]).map((a) => ({ value: a, label: audienceLabels[a] })),
  },
  {
    key: "cause",
    question: "What cause matters to your brand?",
    options: (["youth-confidence", "mentorship", "inclusion", "education-stem", "wellness", "mental-health"] as Cause[]).map((c) => ({ value: c, label: causeLabels[c] })),
  },
  {
    key: "format",
    question: "What campaign format do you want?",
    options: (["community-event", "video", "social", "meet-night"] as CampaignType[]).map((t) => ({ value: t, label: campaignTypeLabels[t] })),
  },
  {
    key: "budget",
    question: "What is your budget?",
    options: [
      { value: 5000, label: "$5,000", hint: "Community Spark" },
      { value: 15000, label: "$15,000", hint: "Impact Routine" },
      { value: 50000, label: "$50,000", hint: "Red Rocks Partner" },
      { value: 200000, label: "$200,000", hint: "Strategic Partner" },
    ],
  },
  {
    key: "scope",
    question: "One athlete, a group, or the whole team?",
    options: [
      { value: "one", label: "One athlete", hint: "A focused story" },
      { value: "group", label: "A group of athletes", hint: "2–4 athletes, shared cause" },
      { value: "team", label: "Team-wide campaign", hint: "The full roster" },
    ],
  },
];

export function MatchWizard({ athletes }: { athletes: Athlete[] }) {
  const [i, setI] = useState(0);
  const [brief, setBrief] = useState<Partial<SponsorBrief>>({});
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  const step = steps[i];

  function choose(value: string | number) {
    const next = { ...brief, [step.key]: value };
    setBrief(next);
    if (i < steps.length - 1) setI(i + 1);
    else {
      setResults(topMatches(athletes, next as SponsorBrief));
      setCompare([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (results) {
    const b = brief as SponsorBrief;
    return (
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-8">
        <p className="text-sm font-semibold text-red-lit">Your best matches</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl text-ink sm:text-7xl">Three athletes whose stories <em>fit yours.</em></h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">
          Based on your goal to <span className="text-ink">{lower(b.goal)}</span>, reaching{" "}
          <span className="text-ink">{lower(audienceLabels[b.audience])}</span>, and supporting{" "}
          <span className="text-ink">{lower(causeLabels[b.cause])}</span>. Scored on cause, audience, format, budget, and
          availability, not follower count.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {results.map((r, rank) => (
            <ResultCard
              key={r.athlete.slug}
              r={r}
              rank={rank + 1}
              comparing={compare.includes(r.athlete.slug)}
              onCompare={() =>
                setCompare((c) => (c.includes(r.athlete.slug) ? c.filter((s) => s !== r.athlete.slug) : [...c, r.athlete.slug]))
              }
            />
          ))}
        </div>

        <AnimatePresence>
          {compare.length >= 2 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card mt-8 overflow-x-auto p-6"
              aria-label="Compare athletes"
            >
              <h2 className="font-display text-3xl text-ink">Side by side</h2>
              <CompareTable rows={results.filter((r) => compare.includes(r.athlete.slug))} />
            </motion.section>
          )}
        </AnimatePresence>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setResults(null);
              setI(0);
            }}
            className="btn btn-line"
          >
            Edit my brief
          </button>
          <Link href="/athletes" className="btn btn-line">Browse everyone instead</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34%] xl:block">
        <Image src="/images/arena-scoreboard.jpg" alt="" fill sizes="34vw" className="object-cover object-[30%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0f0e0d_0%,rgb(15_14_13/0.4)_45%,rgb(15_14_13/0.2)_100%)]" />
        <ChalkArc className="absolute -left-24 top-24 h-[320px] w-[90%] text-red-lit/50" dashed />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 pb-28 pt-14 sm:px-8 xl:ml-[max(2rem,calc((100vw-80rem)/2+2rem))] xl:mr-0">
        <p className="text-sm font-semibold text-red-lit">Get matched · for businesses</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {steps.map((_, k) => (
              <span key={k} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${k <= i ? "bg-red" : "bg-sand"}`} />
            ))}
          </div>
          <span className="text-sm tabular-nums text-muted">
            {i + 1}/{steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.fieldset
            key={step.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="mt-10"
          >
            <legend className="font-display text-5xl text-ink sm:text-6xl">{step.question}</legend>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {step.options.map((o) => {
                const selected = brief[step.key] === o.value;
                return (
                  <button
                    key={String(o.value)}
                    onClick={() => choose(o.value)}
                    className={`group flex min-h-[80px] items-center justify-between gap-4 rounded-[18px] border px-6 py-4 text-left transition-colors ${
                      selected ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink hover:border-ink"
                    }`}
                  >
                    <span>
                      <span className="block text-[17px] font-semibold">{o.label}</span>
                      {o.hint && <span className={`text-sm ${selected ? "text-paper/60" : "text-muted"}`}>{o.hint}</span>}
                    </span>
                    <span className={`transition-transform group-hover:translate-x-1 ${selected ? "text-paper" : "text-red-lit"}`}>→</span>
                  </button>
                );
              })}
            </div>
          </motion.fieldset>
        </AnimatePresence>

        {i > 0 && (
          <button onClick={() => setI(i - 1)} className="mt-8 text-sm text-muted hover:text-ink">
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function ResultCard({ r, rank, comparing, onCompare }: { r: MatchResult; rank: number; comparing: boolean; onCompare: () => void }) {
  const a = r.athlete;
  const [open, setOpen] = useState(rank === 1);
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 1) * 0.1, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      className={`card flex flex-col p-3 ${rank === 1 ? "!border-ink" : ""}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]">
        <AthletePortrait athlete={a} className="absolute inset-0" />
        <span className="tag absolute left-3 top-3 !bg-surface">#{rank} match</span>
        <div className="absolute bottom-3 left-3">
          <FeatureBadge type={a.featureType} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-ink">{a.name}</h2>
            <p className="mt-1 text-sm text-muted">{a.specialty} · {a.hometown}</p>
            <p className="text-xs text-faint">Demo profile · real Red Rocks photo</p>
          </div>
          <MatchRing score={r.score} size={76} />
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-ink">{r.explanation}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-5 text-sm">
          <Fact label="Causes" value={a.causes.map((c) => causeLabels[c]).join(", ")} />
          <Fact label="Audience" value={a.audiences.slice(0, 2).map((x) => audienceLabels[x]).join(", ")} />
          <Fact label="Availability" value={availabilityLabel(a.daysUntilAvailable)} />
          <Fact label="Reach · engagement" value={`${compact(a.reach)} · ${a.engagementRate}%`} />
        </dl>

        <div className="mt-5 rounded-[14px] bg-paper p-4">
          <p className="text-xs text-muted">Recommended Impact Routine</p>
          <p className="mt-1 font-semibold text-ink">
            {r.recommended.name} · {r.recommended.priceLabel}
          </p>
          <p className="mt-1 text-sm text-muted">{r.recommended.perks.slice(0, 3).join(" · ")}</p>
        </div>

        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-5 self-start text-sm text-muted link">
          {open ? "Hide" : "Show"} score breakdown
        </button>
        {open && (
          <div className="mt-4">
            <ScoreBreakdown breakdown={r.breakdown} />
          </div>
        )}

        <Link
          href={`/routines?athlete=${a.slug}&package=${r.recommended.id}&ai=1#ai-brief`}
          className="mt-6 flex items-center justify-between rounded-[14px] border border-red/40 bg-red-soft px-4 py-3 text-sm font-semibold text-red-dark transition-colors hover:border-red"
        >
          ✦ Draft {a.firstName}’s campaign with AI
          <span aria-hidden="true">→</span>
        </Link>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <button onClick={onCompare} aria-pressed={comparing} className={`btn !px-3 text-sm ${comparing ? "btn-ink" : "btn-line"}`}>
            {comparing ? "✓ Comparing" : "Compare"}
          </button>
          <Link href={`/routines?athlete=${a.slug}&package=${r.recommended.id}`} className="btn btn-red !px-3 text-sm">
            Build campaign
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

function CompareTable({ rows }: { rows: MatchResult[] }) {
  const fields: [string, (r: MatchResult) => string][] = [
    ["Match", (r) => `${r.score}%`],
    ["Primary cause", (r) => causeLabels[r.athlete.causes[0]]],
    ["Top audience", (r) => audienceLabels[r.athlete.audiences[0]]],
    ["Reach", (r) => compact(r.athlete.reach)],
    ["Engagement", (r) => `${r.athlete.engagementRate}%`],
    ["Utah audience", (r) => `${r.athlete.localAudiencePct}%`],
    ["Starting budget", (r) => usd(r.athlete.budgetMin)],
    ["Availability", (r) => availabilityLabel(r.athlete.daysUntilAvailable)],
  ];
  return (
    <table className="mt-5 w-full min-w-[520px] text-left text-sm">
      <thead>
        <tr className="border-b border-line">
          <th className="py-3 pr-4 font-normal" scope="col">
            <span className="sr-only">Field</span>
          </th>
          {rows.map((r) => (
            <th key={r.athlete.slug} scope="col" className="py-3 pr-4 font-display text-xl font-medium text-ink">{r.athlete.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {fields.map(([label, fn]) => (
          <tr key={label} className="border-b border-line last:border-0">
            <th scope="row" className="py-3 pr-4 font-normal text-muted">{label}</th>
            {rows.map((r) => (
              <td key={r.athlete.slug} className="py-3 pr-4 text-ink">{fn(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
