"use client";

import { useState } from "react";
import { parseSections } from "@/hooks/useTextStream";

/** Renders "## Heading" sections from streamed AI text: headline, list (with optional copy), or paragraph. */
export function AiSections({ text, streaming, headline, wide = [], copyable = [] }: {
  text: string;
  streaming: boolean;
  headline?: string;
  wide?: string[];
  copyable?: string[];
}) {
  const sections = parseSections(text);
  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
      {sections.map((s, i) => (
        <Section
          key={s.title}
          title={s.title}
          body={s.body}
          headline={s.title === headline}
          wide={s.title === headline || wide.includes(s.title)}
          copyable={copyable.includes(s.title)}
          cursor={streaming && i === sections.length - 1}
        />
      ))}
    </div>
  );
}

function Section({ title, body, headline, wide, copyable, cursor }: {
  title: string;
  body: string;
  headline: boolean;
  wide: boolean;
  copyable: boolean;
  cursor: boolean;
}) {
  const lines = body.split("\n").filter((l) => l.trim() !== "");
  const isList = lines.length > 0 && lines.every((l) => l.trim().startsWith("- "));
  return (
    <div className={wide ? "lg:col-span-2" : ""}>
      <h3 className="text-sm text-muted">{title}</h3>
      {headline ? (
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
              {copyable && <CopyButton text={l.trim().slice(2)} />}
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

export function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" />
    </svg>
  );
}

export function SourceTag({ source }: { source: "live" | "sample" | null }) {
  if (source === "live") return <span className="tag">Written live by Claude</span>;
  if (source === "sample") return <span className="tag">Offline sample (no API key set)</span>;
  return null;
}
