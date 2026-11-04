"use client";

import { useMemo, useState } from "react";
import { AthleteCard } from "@/components/AthleteCard";
import { audienceLabels, campaignTypeLabels, causeLabels, featureTypeLabels, platformLabels } from "@/lib/labels";
import { defaultBrief, scoreAthlete } from "@/lib/match";
import type { Athlete, Audience, CampaignType, Cause, FeatureType, Platform } from "@/lib/types";

type Filters = {
  q: string;
  cause: Cause | "";
  audience: Audience | "";
  campaignType: CampaignType | "";
  budget: number | 0;
  availability: 0 | 14 | 30 | 60;
  platform: Platform | "";
  engagement: "" | "high" | "medium";
  inPerson: boolean;
  featureType: FeatureType | "";
};

const empty: Filters = {
  q: "",
  cause: "",
  audience: "",
  campaignType: "",
  budget: 0,
  availability: 0,
  platform: "",
  engagement: "",
  inPerson: false,
  featureType: "",
};

const sorts = {
  "best-match": { label: "Best match", fn: (a: Athlete, b: Athlete) => scoreAthlete(b, defaultBrief).score - scoreAthlete(a, defaultBrief).score },
  engagement: { label: "Highest engagement", fn: (a: Athlete, b: Athlete) => b.engagementRate - a.engagementRate },
  community: { label: "Best community fit", fn: (a: Athlete, b: Athlete) => b.communityScore - a.communityScore },
  soonest: { label: "Available soonest", fn: (a: Athlete, b: Athlete) => a.daysUntilAvailable - b.daysUntilAvailable },
  budget: { label: "Lowest campaign budget", fn: (a: Athlete, b: Athlete) => a.budgetMin - b.budgetMin },
  local: { label: "Most local audience fit", fn: (a: Athlete, b: Athlete) => b.localAudiencePct - a.localAudiencePct },
  favorites: { label: "Fan Favorites first", fn: (a: Athlete, b: Athlete) => +(b.featureType === "fan-favorite") - +(a.featureType === "fan-favorite") },
  rising: { label: "Rising Routines first", fn: (a: Athlete, b: Athlete) => +(b.featureType === "rising-routine") - +(a.featureType === "rising-routine") },
} as const;

type SortKey = keyof typeof sorts;

export function Explore({ athletes }: { athletes: Athlete[] }) {
  const [f, setF] = useState<Filters>(empty);
  const [sort, setSort] = useState<SortKey>("best-match");
  const [panelOpen, setPanelOpen] = useState(false);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));

  const activeCount = (Object.keys(empty) as Array<keyof Filters>).filter((k) => k !== "q" && f[k] !== empty[k]).length;

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return athletes
      .filter((a) => {
        if (q) {
          const hay = [a.name, a.specialty, a.tagline, a.hometown, ...a.causes.map((c) => causeLabels[c])].join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (f.cause && !a.causes.includes(f.cause)) return false;
        if (f.audience && !a.audiences.includes(f.audience)) return false;
        if (f.campaignType && !a.campaignTypes.includes(f.campaignType)) return false;
        if (f.budget && a.budgetMin > f.budget) return false;
        if (f.availability && a.daysUntilAvailable > f.availability) return false;
        if (f.platform && !a.platforms.includes(f.platform)) return false;
        if (f.engagement === "high" && a.engagementRate < 7) return false;
        if (f.engagement === "medium" && (a.engagementRate < 4 || a.engagementRate >= 7)) return false;
        if (f.inPerson && !a.inPerson) return false;
        if (f.featureType && a.featureType !== f.featureType) return false;
        return true;
      })
      .sort(sorts[sort].fn);
  }, [athletes, f, sort]);

  const showGrouped = sort !== "favorites" && sort !== "rising" && !f.featureType;
  const favorites = results.filter((a) => a.featureType === "fan-favorite");
  const rising = results.filter((a) => a.featureType === "rising-routine");

  return (
    <div className="mt-10">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search athletes</span>
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={f.q}
              onChange={(e) => set("q", e.target.value)}
              placeholder="Search by name, cause, hometown…"
              className="input !pl-11"
            />
          </label>
          <button
            onClick={() => setPanelOpen((o) => !o)}
            aria-expanded={panelOpen}
            aria-controls="filter-panel"
            className="btn btn-line h-[50px] !py-0"
          >
            Filters{activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red px-1.5 text-xs text-white">{activeCount}</span>}
          </button>
          <label className="relative">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input appearance-none !w-auto !pr-10 text-sm"
            >
              {Object.entries(sorts).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted">▾</span>
          </label>
        </div>

        {panelOpen && (
          <div id="filter-panel" className="card mt-3 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select label="Cause" value={f.cause} onChange={(v) => set("cause", v as Cause | "")} options={causeLabels} />
            <Select label="Audience" value={f.audience} onChange={(v) => set("audience", v as Audience | "")} options={audienceLabels} />
            <Select label="Campaign type" value={f.campaignType} onChange={(v) => set("campaignType", v as CampaignType | "")} options={campaignTypeLabels} />
            <Select
              label="Budget"
              value={String(f.budget || "")}
              onChange={(v) => set("budget", Number(v) || 0)}
              options={{ "5000": "Up to $5K", "10000": "Up to $10K", "15000": "Up to $15K", "30000": "Up to $30K" }}
            />
            <Select
              label="Availability"
              value={String(f.availability || "")}
              onChange={(v) => set("availability", (Number(v) || 0) as Filters["availability"])}
              options={{ "14": "Within 2 weeks", "30": "Within a month", "60": "Within 2 months" }}
            />
            <Select label="Social platform" value={f.platform} onChange={(v) => set("platform", v as Platform | "")} options={platformLabels} />
            <Select
              label="Engagement"
              value={f.engagement}
              onChange={(v) => set("engagement", v as Filters["engagement"])}
              options={{ high: "High (7%+)", medium: "Medium (4–7%)" }}
            />
            <Select label="Group" value={f.featureType} onChange={(v) => set("featureType", v as FeatureType | "")} options={featureTypeLabels} />
            <label className="flex h-full min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-line bg-paper px-4 text-sm text-ink">
              <input type="checkbox" checked={f.inPerson} onChange={(e) => set("inPerson", e.target.checked)} className="h-4 w-4 accent-[#cc0000]" />
              In-person appearances
            </label>
            <button onClick={() => setF({ ...empty, q: f.q })} className="min-h-12 rounded-2xl text-sm text-muted hover:text-ink">
              Clear filters
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "athlete" : "athletes"} · sorted by {sorts[sort].label.toLowerCase()}
      </p>

      {results.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-display text-3xl text-ink">No athletes match those filters.</p>
          <p className="mt-2 text-muted">Try widening your budget or availability.</p>
          <button onClick={() => setF(empty)} className="btn btn-red mt-6">Clear all</button>
        </div>
      ) : showGrouped ? (
        <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-8">
          <Group title="Fan Favorites" sub="Bigger reach and name recognition. Best for broad awareness." list={favorites} />
          <Group title="Rising Routines" sub="Strong stories, high engagement, room to grow. Best for community-first campaigns." list={rising} />
        </div>
      ) : (
        <Grid list={results} />
      )}
    </div>
  );
}

function Group({ title, sub, list }: { title: string; sub: string; list: Athlete[] }) {
  if (!list.length) return null;
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
        <h2 className="font-display text-3xl text-ink">{title}</h2>
        <p className="text-sm text-muted">{sub}</p>
      </div>
      <Grid list={list} cols="" />
    </section>
  );
}

function Grid({ list, cols = "lg:grid-cols-3 xl:grid-cols-4" }: { list: Athlete[]; cols?: string }) {
  return (
    <div className={`mt-2 grid gap-5 sm:grid-cols-2 ${cols}`}>
      {list.map((a) => (
        <AthleteCard key={a.slug} athlete={a} />
      ))}
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-ink"
      >
        <option value="">Any</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </label>
  );
}
