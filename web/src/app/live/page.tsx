"use client";
/* eslint-disable react/no-unescaped-entities */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { athletes, seedCampaign } from "@/lib/seed";
import { useArena } from "@/lib/arena";
import { authClient, authConfigured } from "@/lib/auth";
import { SocialShare } from "@/components/live/SocialShare";
import { ApparatusIcon, CardFan, Confetti, NoiseMeter, PrizeLadder, ROTATIONS, RotationTracker } from "@/components/live/PlayVisuals";
import { demoBaseline, type ArenaEventType, type SpotlightType } from "@/lib/arena-model";
import { routineQuestions } from "@/lib/routineQuestions";


const athleteChoices = ["Avery Neff", "Camie Winger", "Clara Raposo"];
export default function Live() {
  const arena = useArena();
  const { state } = arena;
  const [guessStarted, setGuessStarted] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [rewardPrompt, setRewardPrompt] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ where: "quiz" | "crowd"; n: number } | null>(null);
  const celebrate = (where: "quiz" | "crowd") => setBurst((b) => ({ where, n: (b?.n ?? 0) + 1 }));
  const question = routineQuestions.find((item) => item.rotation === state.rotation) ?? routineQuestions[0];
  const attempt = state.personalAttempts[question.id];
  const athleteGuess = state.rotation === 3;
  const mission = [
    { id: "vault", title: "Vault: try a quick Routine IQ question.", source: "Complete the vault question." },
    { id: "beam", title: "Beam: answer a gymnastics knowledge question.", source: "Complete the beam question." },
    { id: "bars", title: "Bars: discover an athlete's story.", source: "Open the athlete story in the spotlight." },
    { id: "floor", title: "Floor: join the collective fan challenge.", source: "Complete the floor question." },
  ][state.rotation - 1] ?? { id: "vault", title: "Complete a rotation mission.", source: "Choose an eligible challenge." };
  const missionDone = state.missions.includes(mission.id);
  const rotationArt = ROTATIONS[(state.rotation - 1 + ROTATIONS.length) % ROTATIONS.length];
  const crowdAttempt = state.personalAttempts["crowd-cheer"];

  useEffect(() => {
    if (arena.isReady && question.sponsored) arena.track("sponsor_challenge_impression", question.id, { once: true });
  }, [arena.isReady, question.id, question.sponsored]);

  useEffect(() => {
    if (!authConfigured) return;
    authClient().auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);


  function chooseAthlete(name: string) {
    arena.startChallenge("guess-athlete");
    const result = arena.answer("guess-athlete", name, "Avery Neff", "avery");
    setGuessStarted(true);
    setGuessFeedback(result?.correct ? "That's Avery! Her card is now in your collection." : "Not quite. Avery Neff was the 2026 Big 12 Gymnast of the Year.");
    if (result?.correct && !signedIn) setRewardPrompt("Avery Neff card");
  }

  return (
    <main className="pb-28 lg:pb-16">
      {rewardPrompt && <RewardClaim name={rewardPrompt} close={() => setRewardPrompt(null)} />}
      {arena.error && <div role="alert" className="mx-auto mb-5 mt-4 flex max-w-7xl items-start justify-between gap-4 rounded-xl border border-red/30 bg-red-soft p-4 text-sm text-ink"><p>{arena.error}</p><button className="font-semibold text-red-lit" onClick={arena.clearError}>Dismiss</button></div>}
      <header className="on-photo relative overflow-hidden">
        <Image src="/images/arena-fireworks.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_14_13/0.92)_0%,rgb(15_14_13/0.7)_55%,rgb(120_0_0/0.35)_100%),linear-gradient(180deg,transparent_60%,#0f0e0d_100%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 pb-10 pt-10 sm:px-8 sm:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">
              <span className="h-2 w-2 animate-live rounded-full bg-white" aria-hidden="true" />
              {state.status === "live" ? "Live now" : state.status.toUpperCase()} · Rotation {state.rotation} of 4 · {question.apparatus}
            </span>
            <h1 className="mt-4 font-display text-[clamp(44px,6vw,84px)] leading-[0.95] text-white">Every rotation. <em className="text-red-lit">Every fan.</em></h1>
            <p className="mt-3 max-w-lg text-[15px] text-white/80">Free games during the meet. Answer, cheer and collect cards for points and prizes.</p>
            <p className="mt-2 text-xs text-white/55">Demo simulation · no live scoring connection · free gameplay</p>
          </div>
          <Image
            src="/images/fan-emoji.jpg"
            alt=""
            width={120}
            height={120}
            className="pointer-events-none absolute right-8 top-6 hidden h-24 w-24 animate-float rounded-[28px] border-4 border-white object-cover shadow-2xl md:block lg:right-10 lg:top-8 lg:h-28 lg:w-28"
          />
          <dl className="grid grid-cols-3 gap-2">
            <Metric value={state.points} label="Points" tone="gold" />
            <Metric value={state.completed.length} label="Challenges" tone="sky" />
            <Metric value={`${state.cards.length}/5`} label="Cards" tone="red" />
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <RotationTracker rotation={state.rotation} missions={state.missions} />
      </div>

      <div className="mx-auto mt-5 grid max-w-7xl gap-5 px-4 sm:px-8 lg:grid-cols-[1.7fr_0.8fr]">
        <section className="space-y-5">
          <section className="card relative grid overflow-hidden !border-red/40 bg-[linear-gradient(135deg,rgb(204_0_0/0.16),transparent_55%)] !p-0 md:grid-cols-[1fr_220px]" aria-labelledby="routine-title">
            {burst?.where === "quiz" && <Confetti key={burst.n} />}
            <div className="relative h-40 md:order-2 md:h-auto">
              <Image src={rotationArt.photo} alt={`A Red Rocks gymnast on ${rotationArt.label.toLowerCase()}`} fill sizes="(max-width: 768px) 100vw, 220px" className="object-cover" style={{ objectPosition: rotationArt.focus }} />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(15_14_13/0.7),transparent_60%)] md:bg-[linear-gradient(90deg,rgb(15_14_13/0.55),transparent_50%)]" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{rotationArt.label} · Rotation {state.rotation}</span>
            </div>
            <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label !text-red-lit">Current challenge · Routine IQ</p>
              <span className="tag">{question.sponsored ? "Sponsored by BrightPath · demo" : "+100 points for a correct answer"}</span>
            </div>
            <h2 id="routine-title" className="mt-3 font-display text-4xl text-ink">{question.question}</h2>
            <p className="mt-2 text-sm text-muted">One answer per challenge. No purchase or donation is needed; incorrect answers earn zero points.</p>
            {attempt ? (
              <div className="mt-5 rounded-xl bg-sand p-4 text-sm text-ink" role="status">
                <p className="font-semibold">{attempt.correct ? `Correct · ${attempt.pointsAwarded} points 🎉` : "You played this one · 0 points"}</p>
                <p className="mt-1">{question.explanation}</p>
                <Link href="/live/iq" className="mt-2 inline-block font-semibold text-red-lit">See your reward →</Link>
              </div>
            ) : (
              <Link href="/live/iq" className="btn btn-red mt-5 w-full sm:w-auto">Play Routine IQ →</Link>
            )}
            </div>
          </section>

          {athleteGuess && (
            <section className="card p-6" aria-labelledby="guess-title">
              <p className="label">Game 4 · Guess the athlete</p>
              <h2 id="guess-title" className="mt-2 font-display text-3xl text-ink">Who was the 2026 Big 12 Gymnast of the Year?</h2>
              <p className="mt-2 text-sm text-muted">Clue: she’s a junior from South Jordan, Utah, and a 2026 team captain. Pick the right athlete to collect her card.</p>
              {state.personalAttempts["guess-athlete"] ? (
                <div className="mt-4 rounded-xl bg-sand p-4 text-sm text-ink">
                  <p>{state.personalAttempts["guess-athlete"].correct ? "Correct — Avery Neff." : "The answer is Avery Neff."} Athlete stories here are sample content.</p>
                  <Link onClick={() => arena.track("athlete_story_view", "avery")} href="/athletes/avery" className="mt-3 inline-block font-semibold text-red-lit">Explore Avery's profile →</Link>
                </div>
              ) : (
                <>
                  {!guessStarted && <button onClick={() => { arena.startChallenge("guess-athlete"); setGuessStarted(true); }} className="btn btn-line mt-4">Start athlete clue</button>}
                  {guessStarted && <div className="mt-4 grid gap-2 sm:grid-cols-3">{athleteChoices.map((name) => <button key={name} onClick={() => chooseAthlete(name)} className="rounded-xl border border-line bg-surface p-3 text-left hover:border-red">{name}</button>)}</div>}
                  {guessFeedback && <p className="mt-4 rounded-xl bg-sand p-4 text-sm text-ink" role="status">{guessFeedback}</p>}
                </>
              )}
            </section>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <section className="card border-t-4 !border-t-sky p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="label !text-sky">Rotation mission · {question.apparatus}</p>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky"><ApparatusIcon id={rotationArt.id} className="h-8 w-8" /></span>
              </div>
              <h2 className="mt-2 font-display text-3xl text-ink">{mission.title}</h2>
              <p className="mt-2 text-sm text-muted">{mission.source} Complete all four meet missions to earn a free Meet Night Champion badge.</p>
              {mission.id === "bars" && <Link onClick={() => arena.track("athlete_story_view", "avery")} href="/athletes/avery" className="mt-4 inline-block text-sm font-semibold text-red-lit">Watch Avery's story →</Link>}
              <div>
                <button disabled={missionDone} onClick={() => arena.completeMission(mission.id, state.rotation)} className="btn btn-line mt-4 disabled:opacity-50">{missionDone ? "Mission complete" : "Complete rotation mission"}</button>
              </div>
            </section>
            <section className="card relative overflow-hidden border-t-4 !border-t-gold !p-0">
              {burst?.where === "crowd" && <Confetti key={burst.n} pieces={36} />}
              <div className="on-photo relative h-32 overflow-hidden">
                <Image src="/images/fan-signs.jpg" alt="Fans holding Red Rocks signs in the stands" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover object-[center_35%]" />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-surface),rgb(15_14_13/0.2)_70%)]" />
                <span className="absolute left-4 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-black">📣 Crowd challenge</span>
              </div>
              <div className="p-5 pt-1">
              <p className="label !text-gold">Collective fan challenge</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Raise the roof</h2>
              <div className="mt-3"><NoiseMeter level={Math.min(1, state.crowd / state.milestoneTarget)} /></div>
              <p className="mt-2 text-sm text-muted">A shared participation target—not a prediction about athlete performance.</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand" role="progressbar" aria-label="Eligible fan challenges completed" aria-valuenow={Math.min(state.crowd, state.milestoneTarget)} aria-valuemin={0} aria-valuemax={state.milestoneTarget}>
                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-red),var(--color-gold))]" style={{ width: `${Math.min(100, state.crowd / state.milestoneTarget * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{state.crowd.toLocaleString()} / {state.milestoneTarget.toLocaleString()} eligible challenges complete</p>
              <p className="mt-2 text-xs text-faint">{state.milestoneCompleted ? "Pre-approved demo thank-you story unlocked." : "Reward: pre-approved athlete thank-you story."} Starting point is simulated demo activity.</p>
              {!crowdAttempt ? <button onClick={() => { const result = arena.joinCrowdChallenge(); if (result && !result.alreadyAnswered) celebrate("crowd"); if (result && !result.alreadyAnswered && !signedIn) setRewardPrompt("Crowd Builder participation badge"); }} className="btn mt-4 bg-gold font-semibold text-black hover:brightness-110">📣 Add my free cheer · +25 pts</button> : <p className="mt-4 rounded-xl bg-sand p-3 text-sm text-ink">Your cheer is counted · {crowdAttempt.pointsAwarded} participation points earned.</p>}
              {state.milestoneCompleted && <Link href="/live/meet" className="mt-3 inline-block text-sm font-semibold text-red-lit">View the reward →</Link>}
              </div>
            </section>
          </div>

          <section className="card grid items-center gap-4 overflow-hidden bg-[radial-gradient(circle_at_80%_50%,rgb(204_0_0/0.18),transparent_60%)] p-5 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="label">Collect the roster</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{state.cards.length} of 5 collectible cards</h2>
              <p className="mt-2 text-sm text-muted">Cards are free, earned through participation, and never ranked by follower count.</p>
              <Link href="/live/cards" className="btn btn-red mt-4">View my cards</Link>
            </div>
            <div className="px-6 sm:pr-10"><CardFan athletes={athletes} collected={state.cards} /></div>
          </section>
          <Spotlight
            type={state.spotlight}
            dismissed={state.dismissed}
            approved={state.approvedSpotlights.includes(state.spotlight)}
            featuredAthleteSlug={state.featuredAthleteSlug}
            sponsorPlacementActive={state.sponsorPlacementActive}
            fundraisingGoal={state.fundraisingGoal}
            currentFundraising={seedCampaign.raised + state.metrics.newFanContributions - demoBaseline.newFanContributions}
            onDismiss={arena.dismissSpotlight}
            onNext={arena.nextSpotlight}
            onAction={(event) => arena.track(event, state.spotlight, { once: event.endsWith("impression") })}
          />
        </section>
        <aside className="space-y-5">
          <section className="card border-l-4 !border-l-sky p-5">
            <p className="label !text-sky">Meet-night progress</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{question.apparatus}</h2>
            <p className="mt-2 text-sm text-muted">Rotation {state.rotation} of 4 · {state.status.toUpperCase()}</p>
            <Link href="/live/meet" className="btn btn-line mt-4 w-full">Meet schedule & reward</Link>
          </section>
          <section className="card bg-[linear-gradient(160deg,var(--color-gold-soft),var(--color-surface)_70%)] p-5">
            <p className="label !text-gold">Your free rewards</p>
            <p className="mt-2 font-display text-5xl text-gold">{state.points} <span className="text-2xl text-ink">points</span></p>
            <p className="mt-2 text-sm text-muted">{state.completed.length} unique challenges · {state.cards.length} cards</p>
            <PrizeLadder points={state.points} />
            <Link href="/live/rewards" className="btn btn-line mt-4 w-full">See progress & badges</Link>
          </section>
          <section className="card border-l-4 !border-l-red p-5">
            <p className="label !text-red-lit">Meet-Night Partner</p>
            <h2 className="mt-2 font-display text-3xl text-ink">$5,000 proposed package</h2>
            <p className="mt-2 text-sm text-muted">Illustrative price only. Athlete NIL compensation, production, activation, and servicing are accounted for separately.</p>
            <Link href="/business" className="mt-4 inline-block text-sm font-semibold text-red-lit">See partner options →</Link>
          </section>
        </aside>
      </div>

      <nav aria-label="Meet-night navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl justify-between gap-1">
          <Bottom href="/live" label="Play" />
          <Bottom href="/live/cards" label="Cards" />
          <Bottom href="/live/meet" label="Meet" />
          <Bottom href="/live/rewards" label="Rewards" />
          <Bottom href="/live/leaderboard" label="Leaderboard" />
          <Bottom href="/support/avery" label="Support" />
        </div>
      </nav>
    </main>
  );
}

const toneClass = { gold: "text-gold", sky: "text-sky", red: "text-red-lit" } as const;

function Metric({ value, label, tone }: { value: string | number; label: string; tone: keyof typeof toneClass }) {
  return (
    <div className="min-w-[92px] rounded-2xl border border-white/15 bg-black/45 px-4 py-3 text-center backdrop-blur">
      <dd className={`font-display text-3xl ${toneClass[tone]}`}>{value}</dd>
      <dt className="mt-0.5 text-[10px] uppercase tracking-wide text-white/70">{label}</dt>
    </div>
  );
}

function Bottom({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-lg px-1.5 py-2 text-center text-[11px] font-semibold text-muted hover:bg-surface hover:text-ink sm:px-2 sm:text-xs">{label}</Link>;
}

function Spotlight({
  type,
  dismissed,
  approved,
  featuredAthleteSlug,
  sponsorPlacementActive,
  fundraisingGoal,
  currentFundraising,
  onDismiss,
  onNext,
  onAction,
}: {
  type: SpotlightType;
  dismissed: boolean;
  approved: boolean;
  featuredAthleteSlug: string;
  sponsorPlacementActive: boolean;
  fundraisingGoal: number;
  currentFundraising: number;
  onDismiss: () => void;
  onNext: () => void;
  onAction: (event: ArenaEventType) => void;
}) {
  const athlete = athletes.find((item) => item.slug === featuredAthleteSlug) ?? athletes[0];
  useEffect(() => {
    if (approved && sponsorPlacementActive && type === "sponsor") onAction("sponsor_spotlight_view");
    if (approved && (type === "support" || type === "fundraising")) onAction("supporter_cta_impression");
  }, [type]);

  if (dismissed) return <aside className="card p-5"><p className="text-sm text-muted">Spotlight dismissed.</p><button onClick={onNext} className="btn btn-line mt-3">Show next spotlight</button></aside>;
  if (!approved) return <aside className="card p-5"><p className="label">Spotlight paused</p><p className="mt-2 text-sm text-muted">This content is hidden until authorized staff approves it.</p><button onClick={onNext} className="btn btn-line mt-3">Show next spotlight</button></aside>;
  if (type === "sponsor" && !sponsorPlacementActive) return <aside className="card p-5"><p className="label">Sponsor placement paused</p><p className="mt-2 text-sm text-muted">Authorized staff has temporarily paused this sponsored content.</p><button onClick={onNext} className="btn btn-line mt-3">Show next spotlight</button></aside>;

  const render = () => {
    if (type === "sponsor") return <><p className="label">Sponsored Spotlight · BrightPath Family Wellness (demo)</p><h2 className="mt-3 font-display text-4xl text-ink">Built for the Moment.</h2><p className="mt-3 text-sm leading-relaxed text-muted">An illustrative campaign featuring athlete-approved stories about healthy routines. Sponsorship is clearly labeled; gameplay never requires a purchase or sponsor-site visit.</p><Link href="/routines" onClick={() => onAction("sponsor_cta_click")} className="btn btn-line mt-5 w-full">Explore the illustrative campaign</Link><button onClick={() => onAction("sponsor_cta_click")} className="mt-3 w-full text-sm text-red-lit">Track sponsor interest</button></>;
    if (type === "support") return <><p className="label">WRTH Support · optional</p><h2 className="mt-3 font-display text-4xl text-ink">Back the routine.</h2><p className="mt-3 text-sm leading-relaxed text-muted">Help create more opportunities for Red Rocks gymnasts. A $10 demo contribution is simulated; gameplay and rewards never depend on giving.</p><Link href="/support/avery" onClick={() => onAction("supporter_cta_click")} className="btn btn-red mt-5 w-full">Explore optional support</Link></>;
    if (type === "fundraising") return <><p className="label">Simulated fundraising progress</p><h2 className="mt-3 font-display text-4xl text-ink">{seedCampaign.name}</h2><p className="mt-3 text-sm text-muted">Demo campaign total: ${currentFundraising.toLocaleString()} of ${fundraisingGoal.toLocaleString()} · sample supporters. This is not a verified live fundraising goal.</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-sand"><div className="h-full bg-red" style={{width:`${Math.min(100,currentFundraising/fundraisingGoal*100)}%`}}/></div><Link href="/support/avery" onClick={() => onAction("supporter_cta_click")} className="btn btn-line mt-5 w-full">Learn about supporting Avery</Link></>;
    if (type === "milestone") return <><p className="label">Meet Milestone</p><h2 className="mt-3 font-display text-4xl text-ink">{stateMilestoneTitle}</h2><p className="mt-3 text-sm text-muted">Fans collectively unlock pre-approved content through eligible participation. The demo target is simulated and does not influence competition.</p><Link href="/live/meet" className="btn btn-line mt-5 w-full">See the fan milestone</Link></>;
    return (
      <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr]">
        <div className="relative mx-auto aspect-[4/5] w-[150px] overflow-hidden rounded-2xl border border-line bg-white">
          {athlete.photo && <Image src={athlete.photo} alt={`${athlete.name}, Utah Red Rocks gymnast`} fill sizes="150px" className="object-cover object-[50%_20%]" />}
        </div>
        <div>
          <p className="label !text-red-lit">Athlete Spotlight · Behind the Routine</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Meet {athlete.name}.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{athlete.tagline} <span className="text-ink/85">“{athlete.quote}”</span></p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/athletes/${athlete.slug}`} onClick={() => onAction("athlete_story_view")} className="btn btn-red !py-2.5 text-sm">Watch {athlete.firstName}’s story</Link>
            <Link href={`/athletes/${athlete.slug}`} onClick={() => onAction("athlete_profile_view")} className="btn btn-line !py-2.5 text-sm">View profile</Link>
          </div>
        </div>
      </div>
    );
  };

  return <aside className="card h-fit p-6">
    {render()}
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
      <p className="text-xs text-faint">No video autoplay · promotions can be dismissed · return to the game anytime.</p>
      <button onClick={onDismiss} className="shrink-0 text-xs font-semibold text-muted hover:text-ink">Dismiss</button>
    </div>
    <button onClick={onNext} className="mt-3 text-xs font-semibold text-red-lit">Show next spotlight</button>
    <p className="mt-2 text-[10px] text-faint">Demo content mix guide: 40% athlete stories · 25% sponsor · 20% support · 15% milestones. Not an optimized or validated ratio.</p>
  </aside>;
}

const stateMilestoneTitle = "Complete together";

function RewardClaim({ name, close }: { name: string; close: () => void }) {
  return <div className="fixed inset-0 z-[100] grid place-items-end bg-black/60 p-4 sm:place-items-center" role="dialog" aria-modal="true" aria-label="Claim your reward">
    <section className="card max-w-md p-7">
      <p className="label text-red-lit">Reward unlocked</p>
      <h2 className="mt-3 font-display text-5xl text-ink">Claim your <em>{name}.</em></h2>
      <p className="mt-4 text-muted">Create a free profile to save this meet-night reward, build your collection, and receive approved WRTH updates. Free gameplay stays open either way.</p>
      <Link href="/join" onClick={() => localStorage.setItem("rtr:pending-reward", name)} className="btn btn-red mt-6 w-full">Sign up to claim</Link>
      <Link href="/join" onClick={() => localStorage.setItem("rtr:pending-reward", name)} className="mt-4 block w-full text-center text-sm font-semibold text-red-lit">Log in instead</Link>
      <div className="mt-4"><SocialShare title={`I unlocked ${name}`} detail="Can you unlock yours at Rock the Arena?" entityId={`reward-${name}`} /></div>
      <button onClick={close} className="mt-4 w-full text-sm text-muted">Keep playing without saving</button>
    </section>
  </div>;
}
