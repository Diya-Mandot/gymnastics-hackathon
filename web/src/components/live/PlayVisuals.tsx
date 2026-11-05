"use client";

import Image from "next/image";
import type { Athlete } from "@/lib/types";

// Visual pieces for the meet-night Play page: event tracker, apparatus art, crowd meter,
// confetti, a fanned hand of trading cards and the prize ladder. Pure presentation.

export const ROTATIONS = [
  { id: "vault", label: "Vault", photo: "/images/gymnast-leap.jpg", focus: "50% 35%" },
  { id: "beam", label: "Beam", photo: "/images/gymnast-beam.jpg", focus: "50% 30%" },
  { id: "bars", label: "Bars", photo: "/images/team-huddle.jpg", focus: "50% 40%" },
  { id: "floor", label: "Floor", photo: "/images/gymnast-floor-2.jpg", focus: "50% 30%" },
] as const;

/** Simple line drawings of each apparatus. */
export function ApparatusIcon({ id, className = "h-8 w-8" }: { id: string; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {id === "vault" && (<><path {...common} d="M10 22c4-6 24-6 28 0v4H10z" /><path {...common} d="M16 26l-3 16M32 26l3 16M14 34h20" /></>)}
      {id === "beam" && (<><path {...common} d="M4 22h40v4H4z" /><path {...common} d="M12 26l-2 16M36 26l2 16M8 42h6M34 42h6" /><circle cx="24" cy="12" r="3" fill="currentColor" /></>)}
      {id === "bars" && (<><path {...common} d="M10 14h18M20 24h20" /><path {...common} d="M12 14v28M26 14v28M22 24v18M38 24v18" /></>)}
      {id === "floor" && (<><path {...common} d="M6 36l10-6h16l10 6-10 6H16z" /><path {...common} d="M24 8c-6 6-6 12 0 18" /><circle cx="24" cy="8" r="2.5" fill="currentColor" /></>)}
    </svg>
  );
}

/** Four-event tracker: done events get a check, the live one pulses. */
export function RotationTracker({ rotation, missions }: { rotation: number; missions: string[] }) {
  return (
    <ol className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Meet rotations">
      {ROTATIONS.map((r, i) => {
        const n = i + 1;
        const live = n === rotation;
        const done = missions.includes(r.id) || n < rotation;
        return (
          <li
            key={r.id}
            aria-current={live ? "step" : undefined}
            className={`relative flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-colors ${
              live ? "border-red bg-red text-white shadow-[0_10px_30px_-10px_rgb(204_0_0/0.8)]" : done ? "border-green/40 bg-green/10 text-green" : "border-line bg-surface text-muted"
            }`}
          >
            {live && <span className="absolute -top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red">Live</span>}
            <ApparatusIcon id={r.id} className="h-8 w-8 sm:h-10 sm:w-10" />
            <span className="text-xs font-semibold sm:text-sm">{r.label}</span>
            <span className={`text-[10px] ${live ? "text-white/80" : ""}`}>{done && !live ? "✓ Done" : `Rotation ${n}`}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Bouncing equalizer bars: the "noise" in the arena. Taller when the crowd is closer to the goal. */
export function NoiseMeter({ level }: { level: number }) {
  const bars = 14;
  return (
    <div className="flex h-14 items-end gap-1" aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => {
        const lit = i / bars < level;
        return (
          <span
            key={i}
            className={`w-full origin-bottom rounded-t-sm ${lit ? "animate-meter" : ""}`}
            style={{
              height: `${30 + ((i * 37) % 70)}%`,
              animationDelay: `${(i % 5) * 0.12}s`,
              background: lit ? (i / bars > 0.75 ? "var(--color-gold)" : "var(--color-red)") : "var(--color-line)",
            }}
          />
        );
      })}
    </div>
  );
}

const confettiColors = ["var(--color-red)", "var(--color-gold)", "var(--color-sky)", "#ffffff", "var(--color-green)"];

/** One-shot confetti burst. Re-mount with a new `key` to fire again. Respects reduced motion via CSS. */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          style={{
            left: `${(i * 37) % 100}%`,
            background: confettiColors[i % confettiColors.length],
            animationDelay: `${(i % 7) * 0.05}s`,
            ["--drift" as string]: `${((i * 53) % 120) - 60}px`,
            ["--spin" as string]: `${(i % 2 ? 1 : -1) * (360 + i * 20)}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** A fanned hand of trading cards; collected ones are in colour. */
export function CardFan({ athletes, collected }: { athletes: Athlete[]; collected: string[] }) {
  const mid = (athletes.length - 1) / 2;
  return (
    <div className="relative flex h-40 items-end justify-center" aria-hidden="true">
      {athletes.map((a, i) => {
        const has = collected.includes(a.slug);
        const angle = (i - mid) * 9;
        return (
          <div
            key={a.slug}
            className="group/card relative -mx-4 h-36 w-24 origin-bottom overflow-hidden rounded-xl border-2 border-white bg-white shadow-xl transition-transform duration-300 hover:-translate-y-3"
            style={{ transform: `rotate(${angle}deg) translateY(${Math.abs(i - mid) * 6}px)`, zIndex: i }}
          >
            {a.photo && <Image src={a.photo} alt="" fill sizes="96px" className={`object-cover object-[50%_18%] ${has ? "" : "grayscale opacity-70"}`} />}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0f0e0d] to-transparent px-1.5 pb-1.5 pt-6">
              <p className="text-[10px] font-semibold leading-tight text-white">{a.firstName}</p>
            </div>
            {!has && <span className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-[10px] text-white">🔒</span>}
          </div>
        );
      })}
    </div>
  );
}

// Prize ladder from the WRTH brief (sample prizes).
export const PRIZES = [
  { at: 200, emoji: "🃏", label: "Digital trading card" },
  { at: 500, emoji: "✨", label: "Sticker pack" },
  { at: 1000, emoji: "✍️", label: "Signed trading card" },
  { at: 2000, emoji: "👕", label: "Full Roster tee" },
];

export function PrizeLadder({ points }: { points: number }) {
  const next = PRIZES.find((p) => points < p.at);
  const max = PRIZES[PRIZES.length - 1].at;
  return (
    <div>
      <div className="relative mt-4 h-2.5 rounded-full bg-line">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-red),var(--color-gold))] transition-all duration-700" style={{ width: `${Math.min(100, (points / max) * 100)}%` }} />
        {PRIZES.map((p) => (
          <span
            key={p.at}
            className={`absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-sm ${points >= p.at ? "border-gold bg-gold-soft" : "border-line bg-surface"}`}
            style={{ left: `${(p.at / max) * 100}%` }}
            title={`${p.at} points: ${p.label}`}
          >
            <span aria-hidden="true">{p.emoji}</span>
          </span>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted">
        {next ? <>
          <b className="text-ink">{(next.at - points).toLocaleString()} points</b> to your {next.label.toLowerCase()} {next.emoji}
        </> : "You’ve unlocked every prize 🎉"}
      </p>
      <p className="mt-1 text-[11px] text-faint">Sample prizes for the demo.</p>
    </div>
  );
}
