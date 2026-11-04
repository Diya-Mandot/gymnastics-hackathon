"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BRIEF_SECTIONS } from "@/lib/ai/brief";
import type { Athlete, SponsorPackage } from "@/lib/types";

type Status = "idle" | "streaming" | "done" | "error";

function parseSections(text: string) {
  const out: { title: string; body: string }[] = [];
  for (const chunk of text.split(/^## /m)) {
    const nl = chunk.indexOf("\n");
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    if (!title) continue;
    out.push({ title, body: nl === -1 ? "" : chunk.slice(nl + 1).trim() });
  }
  return out;
}

export function AiBriefPanel({ athlete, pkg, autoStart = false }: { athlete: Athlete; pkg: SponsorPackage; autoStart?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [source, setSource] = useState<"live" | "sample" | null>(null);
  const abort = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setText("");
    setStatus("streaming");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteSlug: athlete.slug, packageId: pkg.id }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      setSource(res.headers.get("X-Brief-Source") === "live" ? "live" : "sample");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setText((t) => t + decoder.decode(value, { stream: true }));
      }
      setStatus("done");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setStatus("error");
    }
  }, [athlete.slug, pkg.id]);

  // Reset when the athlete or package changes. autoStart only fires on arrival, not on later switches.
  const autoStartKey = useRef(autoStart ? `${athlete.slug}:${pkg.id}` : null);
  useEffect(() => {
    abort.current?.abort();
    setText("");
    setStatus("idle");
    setSource(null);
    if (autoStartKey.current === `${athlete.slug}:${pkg.id}`) generate();
    return () => abort.current?.abort();
  }, [athlete.slug, pkg.id, generate]);

  const sections = parseSections(text);
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

      {sections.length > 0 && (
        <div className="p-6 sm:px-8" aria-live="polite" aria-busy={streaming}>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="tag !bg-red-soft !text-red-dark">Draft · {athlete.firstName} approves before anything is published</span>
            {source === "live" && <span className="tag">Written live by Claude</span>}
            {source === "sample" && <span className="tag">Offline sample (no API key set)</span>}
          </div>
          <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
            {sections.map((s, i) => (
              <BriefSection key={s.title} title={s.title} body={s.body} wide={s.title === "Draft sponsor email" || i === 0} cursor={streaming && i === sections.length - 1} />
            ))}
          </div>
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

function BriefSection({ title, body, wide, cursor }: { title: string; body: string; wide: boolean; cursor: boolean }) {
  const isTitle = title === "Campaign title";
  const lines = body.split("\n").filter((l) => l.trim() !== "");
  const isList = lines.length > 0 && lines.every((l) => l.trim().startsWith("- "));
  return (
    <div className={wide ? "lg:col-span-2" : ""}>
      <h3 className="text-sm text-muted">{title}</h3>
      {isTitle ? (
        <p className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          {body}
          {cursor && <Cursor />}
        </p>
      ) : isList ? (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {lines.map((l, i) => (
            <li key={i} className="flex items-start justify-between gap-4 py-3 text-[15px] leading-relaxed text-ink">
              <span>
                {l.trim().slice(2)}
                {cursor && i === lines.length - 1 && <Cursor />}
              </span>
              {title === "Social captions" && <CopyButton text={l.trim().slice(2)} />}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">
          {body}
          {cursor && <Cursor />}
        </p>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {}
      }}
      className="shrink-0 text-xs text-muted hover:text-ink"
    >
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function Cursor() {
  return <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-live bg-red" aria-hidden="true" />;
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" />
    </svg>
  );
}
