"use client";

import { useEffect, useRef } from "react";
import { useTextStream } from "@/hooks/useTextStream";
import { BRIEF_SECTIONS } from "@/lib/ai/brief";
import type { Athlete, SponsorPackage } from "@/lib/types";
import { AiSections, SourceTag, Sparkle } from "./AiSections";

export function AiBriefPanel({ athlete, pkg, autoStart = false }: { athlete: Athlete; pkg: SponsorPackage; autoStart?: boolean }) {
  const { status, text, source, start, reset } = useTextStream("/api/brief");
  const generate = () => start({ athleteSlug: athlete.slug, packageId: pkg.id });

  // Reset when the athlete or package changes. autoStart only fires on arrival, not on later switches.
  const autoStartKey = useRef(autoStart ? `${athlete.slug}:${pkg.id}` : null);
  useEffect(() => {
    reset();
    if (autoStartKey.current === `${athlete.slug}:${pkg.id}`) start({ athleteSlug: athlete.slug, packageId: pkg.id });
  }, [athlete.slug, pkg.id, reset, start]);

  const streaming = status === "streaming";

  return (
    <section className="card mt-6 overflow-hidden" aria-label="AI campaign brief">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-6 sm:px-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-red-lit">
            <Sparkle /> AI campaign brief
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Draft {athlete.firstName}’s campaign <em>in seconds.</em>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Claude reads {athlete.firstName}’s Story Seed transcript, profile and this sponsor brief, then drafts the campaign,
            captions, plan, tasks and outreach email.
          </p>
        </div>
        <button onClick={generate} disabled={streaming} className="btn btn-red">
          {streaming ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Drafting…
            </>
          ) : status === "idle" ? (
            <>
              <Sparkle /> Draft with AI
            </>
          ) : (
            "Draft again"
          )}
        </button>
      </header>

      {status === "idle" && (
        <div className="grid gap-3 p-6 sm:grid-cols-3 sm:px-8">
          {BRIEF_SECTIONS.map((s) => (
            <div key={s} className="rounded-[14px] border border-dashed border-line px-4 py-3 text-sm text-faint">
              {s}
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="p-6 text-sm text-red-lit sm:px-8">
          Couldn’t reach the drafting service. Try again in a moment.
        </p>
      )}

      {text && (
        <div className="p-6 sm:px-8" aria-live="polite" aria-busy={streaming}>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="tag !bg-red-soft !text-red-dark">Draft · {athlete.firstName} approves before anything is published</span>
            <SourceTag source={source} />
          </div>
          <AiSections
            text={text}
            streaming={streaming}
            headline="Campaign title"
            wide={["Draft sponsor email"]}
            copyable={["Social captions"]}
          />
          {status === "done" && (
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
              <button className="btn btn-ink" onClick={() => alert(`Demo: sent to ${athlete.firstName} for approval. Nothing is published or emailed automatically.`)}>
                Send to {athlete.firstName} for approval
              </button>
              <p className="text-xs text-faint">Nothing is posted or emailed automatically.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
