"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAudience } from "@/components/AudienceProvider";
import { canView, groups, homeFor, supporterTypes, type Audience, type Group, type SupporterType } from "@/lib/audience";
import { athletes } from "@/lib/seed";

const order: Group[] = ["supporter", "business", "athlete", "team"];

export function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const { audience, signIn } = useAudience();
  const initial = (params.get("as") as Group) || audience?.group || null;
  const [group, setGroup] = useState<Group | null>(order.includes(initial as Group) ? initial : null);
  const [supporterType, setSupporterType] = useState<SupporterType>(audience?.supporterType ?? "fan");
  const [athleteSlug, setAthleteSlug] = useState(audience?.athleteSlug ?? "avery");
  const [name, setName] = useState(audience?.name ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!group) return;
    const a: Audience = {
      group,
      name: name.trim() || undefined,
      ...(group === "supporter" ? { supporterType } : {}),
      ...(group === "athlete" ? { athleteSlug } : {}),
    };
    signIn(a);
    const next = params.get("next");
    router.push(next && next.startsWith("/") && canView(a, next) ? next : homeFor(a));
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-8">
      <p className="label">Sign in</p>
      <h1 className="mt-3 font-display text-6xl text-ink sm:text-7xl">Who’s joining <em>the routine?</em></h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Pick how you take part. You’ll see the tools for your group; athlete profiles, cards and the support page stay the same for everyone.
      </p>

      <form onSubmit={submit} className="mt-10">
        <fieldset>
          <legend className="sr-only">I am a…</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {order.map((g) => (
              <label
                key={g}
                className={`card cursor-pointer p-6 transition-colors ${group === g ? "!border-red" : "hover:border-ink/30"}`}
              >
                <input type="radio" name="group" value={g} checked={group === g} onChange={() => setGroup(g)} className="sr-only" />
                <span className="flex items-center justify-between">
                  <span className="font-display text-3xl text-ink">{groups[g].label}</span>
                  <span className={`h-4 w-4 rounded-full border-2 ${group === g ? "border-red bg-red" : "border-line"}`} aria-hidden="true" />
                </span>
                <span className="mt-2 block text-[15px] text-muted">{groups[g].blurb}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {group === "supporter" && (
          <fieldset className="mt-8">
            <legend className="label">I’m supporting as</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(supporterTypes) as SupporterType[]).map((t) => (
                <label key={t} className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${supporterType === t ? "border-ink bg-ink text-paper" : "border-line text-muted hover:text-ink"}`}>
                  <input type="radio" name="supporterType" value={t} checked={supporterType === t} onChange={() => setSupporterType(t)} className="sr-only" />
                  {supporterTypes[t].label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {group === "athlete" && (
          <label className="mt-8 block max-w-sm">
            <span className="label">Which athlete are you?</span>
            <select value={athleteSlug} onChange={(e) => setAthleteSlug(e.target.value)} className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink">
              {athletes.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          </label>
        )}

        {group && group !== "athlete" && (
          <label className="mt-8 block max-w-sm">
            <span className="label">{group === "business" ? "Business name (optional)" : "Your name (optional)"}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={group === "business" ? "BrightPath Family Wellness" : "Jamie"}
              className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-faint"
            />
          </label>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={!group} className="btn btn-red disabled:opacity-40">Continue</button>
          <p className="text-xs text-faint">Demo sign-in: no password, remembered on this device only. Real accounts would come from WRTH’s login system.</p>
        </div>
      </form>
    </section>
  );
}
