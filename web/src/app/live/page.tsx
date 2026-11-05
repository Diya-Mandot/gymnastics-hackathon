"use client";
/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { useEffect, useState } from "react";
import { athletes, seedCampaign } from "@/lib/seed";
import { useArena } from "@/lib/arena";
import { authClient, authConfigured } from "@/lib/auth";
import { demoBaseline, type ArenaEventType, type SpotlightType } from "@/lib/arena-model";

const routineQuestions = [
  {
    id: "routine-vault",
    rotation: 1,
    apparatus: "Vault",
    question: "In a vault, when does the gymnast leave the springboard?",
    options: ["Before the run begins", "After the approach and hurdle", "After landing"],
    correct: "After the approach and hurdle",
    explanation: "The gymnast runs, hurdles onto the springboard, and then pushes off the vault table.",
    card: "jordan",
  },
  {
    id: "routine-beam",
    rotation: 2,
    apparatus: "Balance Beam",
    question: "Which apparatus is approximately 10 centimeters wide?",
    options: ["Vault", "Balance Beam", "Floor Exercise"],
    correct: "Balance Beam",
    explanation: "The balance beam is approximately 10 centimeters wide.",
    card: "avery",
    sponsored: true,
  },
  {
    id: "routine-bars",
    rotation: 3,
    apparatus: "Uneven Bars",
    question: "Which event uses two horizontal bars at different heights?",
    options: ["Uneven Bars", "Vault", "Balance Beam"],
    correct: "Uneven Bars",
    explanation: "Uneven bars routines move between a high bar and a low bar.",
    card: "mia",
  },
  {
    id: "routine-floor",
    rotation: 4,
    apparatus: "Floor Exercise",
    question: "Which routine combines music, dance, and tumbling?",
    options: ["Floor Exercise", "Balance Beam", "Vault"],
    correct: "Floor Exercise",
    explanation: "Floor exercise combines tumbling passes with choreography and performance.",
    card: "sofia",
  },
];

const athleteChoices = ["Avery Davis", "Mia Torres", "Sofia Patel"];
export default function Live() {
  const arena = useArena();
  const { state } = arena;
  const [guessStarted, setGuessStarted] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [rewardPrompt, setRewardPrompt] = useState<string | null>(null);
  const question = routineQuestions.find((item) => item.rotation === state.rotation) ?? routineQuestions[0];
  const attempt = state.personalAttempts[question.id];
  const started = (state.startedChallenges[state.fanId] ?? []).includes(question.id);
  const athleteGuess = state.rotation === 3;
  const mission = [
    { id: "vault", title: "Vault: try a quick Routine IQ question.", source: "Complete the vault question." },
    { id: "beam", title: "Beam: answer a gymnastics knowledge question.", source: "Complete the beam question." },
    { id: "bars", title: "Bars: discover an athlete's story.", source: "Open the athlete story in the spotlight." },
    { id: "floor", title: "Floor: join the collective fan challenge.", source: "Complete the floor question." },
  ][state.rotation - 1] ?? { id: "vault", title: "Complete a rotation mission.", source: "Choose an eligible challenge." };
  const missionDone = state.missions.includes(mission.id);
  const crowdAttempt = state.personalAttempts["crowd-cheer"];

  useEffect(() => {
    if (arena.isReady && question.sponsored) arena.track("sponsor_challenge_impression", question.id, { once: true });
  }, [arena.isReady, question.id, question.sponsored]);

  useEffect(() => {
    if (!authConfigured) return;
    authClient().auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const submitRoutineAnswer = (answer: string) => {
    arena.startChallenge(question.id, question.sponsored);
    const result = arena.answer(question.id, answer, question.correct, question.card, question.sponsored);
    if (result?.correct && !signedIn) setRewardPrompt(`${question.card} card`);
  };

  function chooseAthlete(name: string) {
    arena.startChallenge("guess-athlete");
    const result = arena.answer("guess-athlete", name, "Avery Davis", "avery");
    setGuessStarted(true);
    setGuessFeedback(result?.correct ? "That's Avery! Her mentoring story and card are now in your collection." : "Not quite. The clue describes Avery Davis, who mentors younger gymnasts.");
    if (result?.correct && !signedIn) setRewardPrompt("Avery Davis card");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-7 sm:px-8">
      {rewardPrompt && <RewardClaim name={rewardPrompt} close={() => setRewardPrompt(null)} />}
      {arena.error && <div role="alert" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red/30 bg-red-soft p-4 text-sm text-ink"><p>{arena.error}</p><button className="font-semibold text-red-lit" onClick={arena.clearError}>Dismiss</button></div>}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label text-red-lit">ROCK THE ARENA · Red Rocks Meet Night</p>
          <h1 className="mt-2 font-display text-[clamp(44px,6vw,76px)] text-ink">Every rotation. <em>Every fan.</em></h1>
          <p className="mt-3 text-sm text-muted">
            Current rotation: {state.rotation} of 4 · {question.apparatus} · Status: {state.status.toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-faint">Demo simulation · no live scoring connection · free gameplay</p>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-surface">
          <Metric value={state.points} label="Points" />
          <Metric value={state.completed.length} label="Challenges" />
          <Metric value={`${state.cards.length}/5`} label="Cards" />
        </dl>
      </header>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1.7fr_0.8fr]">
        <section className="space-y-5">
          <section className="card p-6" aria-labelledby="routine-title">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="label">Current challenge · Routine IQ</p>
              <span className="tag">{question.sponsored ? "Sponsored by BrightPath · demo" : "+100 points for a correct answer"}</span>
            </div>
            <h2 id="routine-title" className="mt-3 font-display text-4xl text-ink">{question.question}</h2>
            <p className="mt-2 text-sm text-muted">One answer per challenge. No purchase or donation is needed; incorrect answers earn zero points.</p>
            {state.status !== "live" || !state.active ? (
              <p className="mt-5 rounded-xl bg-sand p-4 text-sm text-muted">The meet or challenge is not currently active. Staff controls the approved rotation schedule.</p>
            ) : !started && !attempt ? (
              <button onClick={() => arena.startChallenge(question.id, question.sponsored)} className="btn btn-red mt-5 w-full sm:w-auto">Start Routine IQ</button>
            ) : (
              <>
                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => (
                    <button
                      disabled={Boolean(attempt)}
                      key={option}
                      onClick={() => submitRoutineAnswer(option)}
                      className={`rounded-xl border px-5 py-4 text-left transition-colors ${
                        attempt?.submittedAnswer === option
                          ? attempt.correct ? "border-green bg-green/10" : "border-red bg-red-soft"
                          : "border-line bg-surface hover:border-red"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {attempt && (
                  <div className="mt-5 rounded-xl bg-sand p-4 text-sm text-ink" role="status">
                    <p className="font-semibold">{attempt.correct ? `Correct · ${attempt.pointsAwarded} points` : "Challenge complete · 0 points"}</p>
                    <p className="mt-1">{question.explanation}</p>
                    {attempt.correct && <Link href="/live/cards" className="mt-2 inline-block font-semibold text-red-lit">View unlocked card →</Link>}
                  </div>
                )}
              </>
            )}
          </section>

          {athleteGuess && (
            <section className="card p-6" aria-labelledby="guess-title">
              <p className="label">Game 4 · Guess the athlete</p>
              <h2 id="guess-title" className="mt-2 font-display text-3xl text-ink">Who enjoys mentoring younger athletes?</h2>
              <p className="mt-2 text-sm text-muted">Clue: this gymnast promotes youth confidence. Choose an athlete to reveal her story.</p>
              {state.personalAttempts["guess-athlete"] ? (
                <div className="mt-4 rounded-xl bg-sand p-4 text-sm text-ink">
                  <p>{state.personalAttempts["guess-athlete"].correct ? "Correct — Avery Davis." : "The answer is Avery Davis."} This prototype uses fictional athlete stories.</p>
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
            <section className="card p-5">
              <p className="label">Rotation mission · {question.apparatus}</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{mission.title}</h2>
              <p className="mt-2 text-sm text-muted">{mission.source} Complete all four meet missions to earn a free Meet Night Champion badge.</p>
              {mission.id === "bars" && <Link onClick={() => arena.track("athlete_story_view", "avery")} href="/athletes/avery" className="mt-4 inline-block text-sm font-semibold text-red-lit">Watch Avery's story →</Link>}
              <div>
                <button disabled={missionDone} onClick={() => arena.completeMission(mission.id, state.rotation)} className="btn btn-line mt-4 disabled:opacity-50">{missionDone ? "Mission complete" : "Complete rotation mission"}</button>
              </div>
            </section>
            <section className="card p-5">
              <p className="label">Collective fan challenge</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Raise the roof</h2>
              <p className="mt-2 text-sm text-muted">A shared participation target—not a prediction about athlete performance.</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand" role="progressbar" aria-label="Eligible fan challenges completed" aria-valuenow={Math.min(state.crowd, state.milestoneTarget)} aria-valuemin={0} aria-valuemax={state.milestoneTarget}>
                <div className="h-full bg-red" style={{ width: `${Math.min(100, state.crowd / state.milestoneTarget * 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{state.crowd.toLocaleString()} / {state.milestoneTarget.toLocaleString()} eligible challenges complete</p>
              <p className="mt-2 text-xs text-faint">{state.milestoneCompleted ? "Pre-approved demo thank-you story unlocked." : "Reward: pre-approved athlete thank-you story."} Starting point is simulated demo activity.</p>
              {!crowdAttempt ? <button onClick={() => { const result = arena.joinCrowdChallenge(); if (result && !result.alreadyAnswered && !signedIn) setRewardPrompt("Crowd Builder participation badge"); }} className="btn btn-line mt-4">Add my free cheer · +25 pts</button> : <p className="mt-4 rounded-xl bg-sand p-3 text-sm text-ink">Your cheer is counted · {crowdAttempt.pointsAwarded} participation points earned.</p>}
              {state.milestoneCompleted && <Link href="/live/meet" className="mt-3 inline-block text-sm font-semibold text-red-lit">View the reward →</Link>}
            </section>
          </div>

          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="label">Collect the roster</p><h2 className="mt-2 font-display text-3xl text-ink">{state.cards.length} of 5 collectible cards</h2></div>
              <Link href="/live/cards" className="btn btn-line">View cards</Link>
            </div>
            <p className="mt-2 text-sm text-muted">Cards are free, earned through participation, and never ranked by follower count.</p>
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
          <section className="card p-5">
            <p className="label">Meet-night progress</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{question.apparatus}</h2>
            <p className="mt-2 text-sm text-muted">Rotation {state.rotation} of 4 · {state.status.toUpperCase()}</p>
            <Link href="/live/meet" className="btn btn-line mt-4 w-full">Meet schedule & reward</Link>
          </section>
          <section className="card p-5">
            <p className="label">Your free rewards</p>
            <p className="mt-2 font-display text-4xl text-ink">{state.points} points</p>
            <p className="mt-2 text-sm text-muted">{state.completed.length} unique challenges · {state.cards.length} cards</p>
            <Link href="/live/rewards" className="btn btn-line mt-4 w-full">See progress & badges</Link>
          </section>
          <section className="card p-5">
            <p className="label">Meet-Night Partner</p>
            <h2 className="mt-2 font-display text-3xl text-ink">$5,000 proposed package</h2>
            <p className="mt-2 text-sm text-muted">Illustrative price only. Athlete NIL compensation, production, activation, and servicing are accounted for separately.</p>
            <Link href="/business" className="mt-4 inline-block text-sm font-semibold text-red-lit">See partner options →</Link>
          </section>
        </aside>
      </div>

      <nav aria-label="Meet-night navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-2 py-2 backdrop-blur">
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

function Metric({ value, label }: { value: string | number; label: string }) {
  return <div className="px-3 py-3 text-center"><p className="font-display text-2xl text-ink">{value}</p><p className="text-[10px] uppercase tracking-wide text-muted">{label}</p></div>;
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
    return <><p className="label">Athlete Spotlight · Behind the Routine</p><h2 className="mt-3 font-display text-4xl text-ink">Meet {athlete.name}.</h2><p className="mt-3 text-sm leading-relaxed text-muted">{athlete.tagline} {athlete.quote}</p><Link href="/athletes/avery" onClick={() => onAction("athlete_story_view")} className="btn btn-line mt-5 w-full">Watch Avery's story</Link><Link href="/athletes/avery" onClick={() => onAction("athlete_profile_view")} className="mt-3 block text-center text-sm font-semibold text-red-lit">View athlete profile</Link></>;
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
      <button onClick={close} className="mt-4 w-full text-sm text-muted">Keep playing without saving</button>
    </section>
  </div>;
}
