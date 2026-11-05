"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAudience } from "@/components/AudienceProvider";
import { Confetti, ROTATIONS } from "@/components/live/PlayVisuals";
import { useArena } from "@/lib/arena";
import { claimPendingEntry, markPendingEntry, RAFFLE } from "@/lib/raffle";
import { routineQuestions } from "@/lib/routineQuestions";
import { athletes } from "@/lib/seed";

// The in-arena QR code opens this page: one Routine IQ question, then sign up to collect
// the reward and enter tonight's raffle. People already signed in are never asked again.

const letterTone = ["bg-red text-white", "bg-sky text-white", "bg-gold text-black", "bg-green text-black"];

export default function RoutineIQPage() {
  const arena = useArena();
  const { state } = arena;
  const { profile, ready } = useAudience();
  const [burst, setBurst] = useState(0);

  const question = routineQuestions.find((q) => q.rotation === state.rotation) ?? routineQuestions[0];
  const art = ROTATIONS[(state.rotation - 1 + ROTATIONS.length) % ROTATIONS.length];
  const attempt = state.personalAttempts[question.id];
  const cardAthlete = athletes.find((a) => a.slug === question.card);
  const rewardName = `${cardAthlete?.name ?? "Red Rocks"} card`;
  const isFan = profile?.role === "fan";
  const live = state.status === "live" && state.active;

  function choose(option: string) {
    arena.startChallenge(question.id, question.sponsored);
    const result = arena.answer(question.id, option, question.correct, question.card, question.sponsored);
    if (result?.correct) setBurst((n) => n + 1);
    // Playing from the QR code earns a raffle entry once the person has an account.
    markPendingEntry();
    if (result?.correct) try { localStorage.setItem("rtr:pending-reward", rewardName); } catch {}
    if (profile && isFan) claimPendingEntry(profile.id);
  }

  return (
    <main className="pb-16">
      <header className="on-photo relative overflow-hidden">
        <Image src={art.photo} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: art.focus }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_14_13/0.45),#0f0e0d_92%)]" />
        <div className="relative mx-auto max-w-2xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">
            <span className="h-2 w-2 animate-live rounded-full bg-white" aria-hidden="true" />
            {live ? "Live now" : "Meet night"} · Rotation {state.rotation} · {question.apparatus}
          </span>
          <h1 className="mt-4 font-display text-[clamp(48px,12vw,84px)] leading-[0.92] text-white">Routine <em className="text-red-lit">IQ.</em></h1>
          <p className="mt-3 text-white/80">One question. Answer it, then collect your reward and a raffle ticket for tonight.</p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <section className="card relative overflow-hidden p-6" aria-labelledby="iq-question">
          {burst > 0 && <Confetti key={burst} pieces={40} />}
          {question.sponsored && <span className="tag">Sponsored by BrightPath · demo</span>}
          <h2 id="iq-question" className="mt-3 font-display text-4xl leading-tight text-ink">{question.question}</h2>
          <p className="mt-2 text-sm text-muted">Free to play. One answer per question.</p>

          <div className="mt-6 grid gap-3">
            {question.options.map((option, i) => {
              const picked = attempt?.submittedAnswer === option;
              const isRight = attempt && option === question.correct;
              return (
                <button
                  key={option}
                  disabled={Boolean(attempt) || !live}
                  onClick={() => choose(option)}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-[17px] transition-all ${
                    isRight ? "border-green bg-green/10" : picked ? "border-red bg-red-soft" : "border-line bg-surface hover:-translate-y-0.5 hover:border-red disabled:hover:translate-y-0"
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-xl ${letterTone[i % 4]}`} aria-hidden="true">{"ABCD"[i]}</span>
                  <span className="text-ink">{option}</span>
                  {isRight && <span className="ml-auto text-xl" aria-label="Correct answer">✓</span>}
                  {picked && !attempt?.correct && <span className="ml-auto text-xl" aria-label="Your answer">✕</span>}
                </button>
              );
            })}
          </div>
          {!live && <p className="mt-4 rounded-xl bg-sand p-4 text-sm text-muted">The game opens when the meet is live. Check back during the next rotation.</p>}

          {attempt && (
            <div className="mt-6 rounded-2xl bg-sand p-5" role="status">
              <p className="font-display text-3xl text-ink">{attempt.correct ? `Correct! +${attempt.pointsAwarded} points 🎉` : "Nice try!"}</p>
              <p className="mt-2 text-sm text-ink/85">{question.explanation}</p>
            </div>
          )}
        </section>

        {attempt && ready && (
          <section className="card mt-5 overflow-hidden border-t-4 !border-t-gold p-6" aria-label="Your reward">
            <div className="flex flex-wrap gap-2">
              {attempt.correct && <span className="rounded-full bg-gold-soft px-3 py-1.5 text-sm font-semibold text-gold">🃏 {rewardName}</span>}
              <span className="rounded-full bg-red-soft px-3 py-1.5 text-sm font-semibold text-red-dark">🎟️ Tonight’s raffle</span>
            </div>

            {isFan ? (
              <>
                <h2 className="mt-4 font-display text-4xl text-ink">You’re in, {profile.firstName || "fan"}!</h2>
                <p className="mt-2 text-muted">
                  {attempt.correct ? "Your card is in your collection and " : ""}you’ve got a ticket for tonight’s raffle: {RAFFLE.prize}.
                </p>
                <Link href="/fan" className="btn btn-red mt-5 w-full sm:w-auto">Open Fan HQ</Link>
              </>
            ) : profile ? (
              <>
                <h2 className="mt-4 font-display text-4xl text-ink">Rewards are for fan accounts.</h2>
                <p className="mt-2 text-muted">You’re signed in with a {profile.role} account. Fans collect cards and enter the raffle.</p>
              </>
            ) : (
              <>
                <h2 className="mt-4 font-display text-4xl text-ink">Collect it with a free fan account.</h2>
                <p className="mt-2 text-muted">
                  Sign up to save {attempt.correct ? "your card and " : ""}get a ticket for tonight’s raffle: {RAFFLE.prize}.
                  The raffle is only for fans with an account.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/join?from=qr&role=fan&next=/fan" className="btn btn-red">Sign up &amp; collect</Link>
                  <Link href="/join?from=qr&mode=login&next=/fan" className="btn btn-line">I have an account</Link>
                </div>
                <Link href="/live" className="mt-4 inline-block text-sm text-muted underline-offset-4 hover:underline">Keep playing without saving</Link>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
