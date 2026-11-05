export type SpotlightType = "athlete" | "sponsor" | "support" | "fundraising" | "milestone";
export type MeetStatus = "upcoming" | "live" | "completed";
export type ArenaEventType =
  | "challenge_started"
  | "challenge_completed"
  | "participation_bonus"
  | "card_unlocked"
  | "athlete_story_view"
  | "athlete_profile_view"
  | "supporter_cta_impression"
  | "supporter_cta_click"
  | "fan_contribution"
  | "fan_opt_in"
  | "sponsor_challenge_impression"
  | "sponsor_challenge_started"
  | "sponsor_challenge_completed"
  | "sponsor_spotlight_view"
  | "sponsor_cta_click"
  | "sponsor_offer_claim"
  | "meet_started"
  | "meet_config_changed"
  | "rotation_advanced"
  | "challenge_activated"
  | "challenge_deactivated"
  | "spotlight_changed"
  | "spotlight_approval_changed"
  | "sponsor_placement_changed"
  | "fundraising_goal_changed"
  | "spotlight_dismissed"
  | "crowd_milestone_completed"
  | "mission_completed";

export type ArenaEvent = {
  id: string;
  fanId: string | null;
  type: ArenaEventType;
  entityId: string;
  timestamp: string;
  simulated: true;
  amount?: number;
};

export type ArenaAttempt = {
  submittedAnswer: string;
  correct: boolean;
  pointsAwarded: number;
  timestamp: string;
};

export type ArenaData = {
  status: MeetStatus;
  rotation: number;
  active: boolean;
  activeChallengeId: string;
  meetTitle: string;
  spotlight: SpotlightType;
  approvedSpotlights: SpotlightType[];
  featuredAthleteSlug: string;
  sponsorPlacementActive: boolean;
  milestoneTarget: number;
  fundraisingGoal: number;
  events: ArenaEvent[];
  attempts: Record<string, Record<string, ArenaAttempt>>;
  startedChallenges: Record<string, string[]>;
  completedMissions: Record<string, string[]>;
  leaderboardOptIns: string[];
  dismissedSpotlights: Record<string, SpotlightType[]>;
};

export type ArenaMetrics = {
  participants: number;
  challengeStarts: number;
  challengeCompletions: number;
  averageCompletedChallenges: number;
  cardsCollected: number;
  athleteProfileVisits: number;
  repeatParticipants: number;
  supporterImpressions: number;
  supporterClicks: number;
  simulatedContributions: number;
  newFanContributions: number;
  newOptIns: number;
  conversionRate: number;
  sponsoredChallengeImpressions: number;
  sponsoredChallengeStarts: number;
  sponsoredChallengeCompletions: number;
  sponsorSpotlightViews: number;
  sponsorLinkClicks: number;
  offerClaims: number;
  attributableOutcomes: number;
};

export type ArenaView = ArenaData & {
  fanId: string;
  points: number;
  completed: string[];
  cards: string[];
  crowd: number;
  personalAttempts: Record<string, ArenaAttempt>;
  missions: string[];
  leaderboard: Array<{ fanId: string; points: number; completed: number }>;
  optedIn: boolean;
  dismissed: boolean;
  metrics: ArenaMetrics;
  milestoneCompleted: boolean;
};

export const demoBaseline = {
  participants: 1842,
  challengeStarts: 790,
  challengeCompletions: 650,
  cardsCollected: 493,
  athleteProfileVisits: 680,
  repeatParticipants: 290,
  supporterImpressions: 380,
  supporterClicks: 126,
  simulatedContributions: 14,
  newFanContributions: 140,
  newOptIns: 68,
  sponsoredChallengeImpressions: 520,
  sponsoredChallengeStarts: 410,
  sponsoredChallengeCompletions: 390,
  sponsorSpotlightViews: 1105,
  sponsorLinkClicks: 235,
  offerClaims: 78,
  attributableOutcomes: 0,
} as const;

export function createInitialArenaData(): ArenaData {
  return {
    status: "live",
    rotation: 2,
    active: true,
    activeChallengeId: "routine-beam",
    meetTitle: "Red Rocks Meet Night",
    spotlight: "athlete",
    approvedSpotlights: ["athlete", "sponsor", "support", "fundraising", "milestone"],
    featuredAthleteSlug: "avery",
    sponsorPlacementActive: true,
    milestoneTarget: 1000,
    fundraisingGoal: 15000,
    events: [],
    attempts: {},
    startedChallenges: {},
    completedMissions: {},
    leaderboardOptIns: [],
    dismissedSpotlights: {},
  };
}

export function appendArenaEvent(
  data: ArenaData,
  event: Omit<ArenaEvent, "simulated">,
): ArenaData {
  if (data.events.some((existing) => existing.id === event.id)) return data;
  return { ...data, events: [...data.events, { ...event, simulated: true }] };
}

export function startChallenge(
  data: ArenaData,
  fanId: string,
  challengeId: string,
  eventId: string,
  timestamp: string,
): ArenaData {
  if (data.status !== "live" || !data.active) return data;
  const started = data.startedChallenges[fanId] ?? [];
  if (started.includes(challengeId)) return data;
  const next = {
    ...data,
    startedChallenges: { ...data.startedChallenges, [fanId]: [...started, challengeId] },
  };
  return appendArenaEvent(next, {
    id: eventId,
    fanId,
    type: "challenge_started",
    entityId: challengeId,
    timestamp,
  });
}

export function submitChallengeAnswer(
  data: ArenaData,
  input: {
    fanId: string;
    challengeId: string;
    answer: string;
    correctAnswer: string;
    cardSlug?: string;
    pointsAvailable?: number;
    sponsored?: boolean;
    eventIds: string[];
    timestamp: string;
  },
): { data: ArenaData; attempt: ArenaAttempt; alreadyAnswered: boolean } {
  const existing = data.attempts[input.fanId]?.[input.challengeId];
  if (existing) return { data, attempt: existing, alreadyAnswered: true };

  const correct = input.answer === input.correctAnswer;
  const pointsAwarded = correct ? (input.pointsAvailable ?? 100) : 0;
  const attempt: ArenaAttempt = {
    submittedAnswer: input.answer,
    correct,
    pointsAwarded,
    timestamp: input.timestamp,
  };
  const startedData = startChallenge(
    data,
    input.fanId,
    input.challengeId,
    input.eventIds[0],
    input.timestamp,
  );
  const attempts = {
    ...startedData.attempts,
    [input.fanId]: {
      ...(startedData.attempts[input.fanId] ?? {}),
      [input.challengeId]: attempt,
    },
  };
  let next = appendArenaEvent(
    { ...startedData, attempts },
    {
      id: input.eventIds[1],
      fanId: input.fanId,
      type: "challenge_completed",
      entityId: input.challengeId,
      timestamp: input.timestamp,
    },
  );

  if (input.sponsored) {
    next = appendArenaEvent(next, {
      id: input.eventIds[2],
      fanId: input.fanId,
      type: "sponsor_challenge_completed",
      entityId: input.challengeId,
      timestamp: input.timestamp,
    });
  }

  if (correct && input.cardSlug) {
    const alreadyUnlocked = next.events.some(
      (event) => event.fanId === input.fanId && event.type === "card_unlocked" && event.entityId === input.cardSlug,
    );
    if (!alreadyUnlocked) {
      next = appendArenaEvent(next, {
        id: input.eventIds[3],
        fanId: input.fanId,
        type: "card_unlocked",
        entityId: input.cardSlug,
        timestamp: input.timestamp,
      });
    }
  }

  const fanAttempts = Object.keys(next.attempts[input.fanId] ?? {}).length;
  const receivedParticipationBonus = next.events.some(
    (event) => event.fanId === input.fanId && event.type === "participation_bonus",
  );
  if (fanAttempts === 3 && !receivedParticipationBonus) {
    next = appendArenaEvent(next, {
      id: input.eventIds[4],
      fanId: input.fanId,
      type: "participation_bonus",
      entityId: "three-challenge-streak",
      timestamp: input.timestamp,
      amount: 25,
    });
  }

  const previousCrowd = getCrowdProgress(data);
  if (previousCrowd < data.milestoneTarget && getCrowdProgress(next) >= data.milestoneTarget) {
    next = appendArenaEvent(next, {
      id: input.eventIds[5],
      fanId: input.fanId,
      type: "crowd_milestone_completed",
      entityId: "meet-night-thank-you",
      timestamp: input.timestamp,
    });
  }

  return { data: next, attempt, alreadyAnswered: false };
}

export function getCrowdProgress(data: ArenaData): number {
  return demoBaseline.challengeCompletions +
    data.events.filter((event) => event.type === "challenge_completed").length;
}

export function completeRotationMission(
  data: ArenaData,
  input: {
    fanId: string;
    missionId: string;
    rotation: number;
    eventId: string;
    timestamp: string;
  },
): { data: ArenaData; error?: string } {
  if (input.rotation !== data.rotation) return { data, error: "Play the current rotation's mission first." };
  const completed = data.completedMissions[input.fanId] ?? [];
  if (completed.includes(input.missionId)) return { data };
  const requiredChallenge: Record<string, string> = {
    vault: "routine-vault",
    beam: "routine-beam",
    bars: "guess-athlete",
    floor: "routine-floor",
  };
  const hasCompletedChallenge = Boolean(
    requiredChallenge[input.missionId] && data.attempts[input.fanId]?.[requiredChallenge[input.missionId]],
  );
  const hasViewedStory = data.events.some(
    (event) => event.fanId === input.fanId && event.type === "athlete_story_view",
  );
  if (input.missionId === "bars" ? !hasViewedStory : !hasCompletedChallenge) {
    return {
      data,
      error: input.missionId === "bars" ? "Open an athlete story before completing this mission." : "Complete the rotation challenge first.",
    };
  }

  const next = appendArenaEvent(
    {
      ...data,
      completedMissions: {
        ...data.completedMissions,
        [input.fanId]: [...completed, input.missionId],
      },
    },
    {
      id: input.eventId,
      fanId: input.fanId,
      type: "mission_completed",
      entityId: input.missionId,
      timestamp: input.timestamp,
    },
  );
  const allMissionsComplete = ["vault", "beam", "bars", "floor"].every((mission) =>
    (next.completedMissions[input.fanId] ?? []).includes(mission),
  );
  if (allMissionsComplete && !next.events.some((event) => event.fanId === input.fanId && event.entityId === "meet-night-champion")) {
    return {
      data: appendArenaEvent(next, {
        id: `${input.eventId}-champion`,
        fanId: input.fanId,
        type: "card_unlocked",
        entityId: "meet-night-champion",
        timestamp: input.timestamp,
      }),
    };
  }
  return { data: next };
}

function countEvents(data: ArenaData, type: ArenaEventType): number {
  return data.events.filter((event) => event.type === type).length;
}

export function calculateArenaMetrics(data: ArenaData): ArenaMetrics {
  const activeFans = new Set(data.events.filter((event) => event.fanId).map((event) => event.fanId as string));
  const completionCounts = new Map<string, number>();
  const completedEvents = data.events.filter((event) => event.type === "challenge_completed");
  for (const event of completedEvents) {
    if (event.fanId) completionCounts.set(event.fanId, (completionCounts.get(event.fanId) ?? 0) + 1);
  }
  const repeatParticipants = [...completionCounts.values()].filter((count) => count > 1).length;
  const completions = demoBaseline.challengeCompletions + completedEvents.length;
  const participants = demoBaseline.participants + activeFans.size;
  const contributionEvents = data.events.filter((event) => event.type === "fan_contribution");
  const contributionAmount = contributionEvents.reduce((total, event) => total + (event.amount ?? 0), 0);
  const uniqueOptIns = new Set(data.events.filter((event) => event.type === "fan_opt_in").map((event) => event.fanId)).size;
  const supporterImpressions = demoBaseline.supporterImpressions + countEvents(data, "supporter_cta_impression");
  const supporterClicks = demoBaseline.supporterClicks + countEvents(data, "supporter_cta_click");

  return {
    participants,
    challengeStarts: demoBaseline.challengeStarts + countEvents(data, "challenge_started"),
    challengeCompletions: completions,
    averageCompletedChallenges: participants ? Number((completions / participants).toFixed(2)) : 0,
    cardsCollected: demoBaseline.cardsCollected + countEvents(data, "card_unlocked"),
    athleteProfileVisits: demoBaseline.athleteProfileVisits + countEvents(data, "athlete_profile_view"),
    repeatParticipants: demoBaseline.repeatParticipants + repeatParticipants,
    supporterImpressions,
    supporterClicks,
    simulatedContributions: demoBaseline.simulatedContributions + contributionEvents.length,
    newFanContributions: demoBaseline.newFanContributions + contributionAmount,
    newOptIns: demoBaseline.newOptIns + uniqueOptIns,
    conversionRate: supporterImpressions
      ? Number((supporterClicks / supporterImpressions * 100).toFixed(1))
      : 0,
    sponsoredChallengeImpressions:
      demoBaseline.sponsoredChallengeImpressions + countEvents(data, "sponsor_challenge_impression"),
    sponsoredChallengeStarts: demoBaseline.sponsoredChallengeStarts + countEvents(data, "sponsor_challenge_started"),
    sponsoredChallengeCompletions:
      demoBaseline.sponsoredChallengeCompletions + countEvents(data, "sponsor_challenge_completed"),
    sponsorSpotlightViews: demoBaseline.sponsorSpotlightViews + countEvents(data, "sponsor_spotlight_view"),
    sponsorLinkClicks: demoBaseline.sponsorLinkClicks + countEvents(data, "sponsor_cta_click"),
    offerClaims: demoBaseline.offerClaims + countEvents(data, "sponsor_offer_claim"),
    attributableOutcomes: demoBaseline.attributableOutcomes,
  };
}

export function toArenaView(data: ArenaData, fanId: string): ArenaView {
  const personalAttempts = data.attempts[fanId] ?? {};
  const fanEvents = data.events.filter((event) => event.fanId === fanId);
  const points =
    Object.values(personalAttempts).reduce((total, attempt) => total + attempt.pointsAwarded, 0) +
    fanEvents.filter((event) => event.type === "participation_bonus").reduce((total, event) => total + (event.amount ?? 0), 0);
  const cards = [...new Set(fanEvents.filter((event) => event.type === "card_unlocked").map((event) => event.entityId))];
  const leaderboardPoints = new Map<string, { points: number; completed: number }>();
  for (const event of data.events) {
    if (!event.fanId || !data.leaderboardOptIns.includes(event.fanId)) continue;
    const row = leaderboardPoints.get(event.fanId) ?? { points: 0, completed: 0 };
    if (event.type === "challenge_completed") row.completed += 1;
    if (event.type === "participation_bonus") row.points += event.amount ?? 0;
    leaderboardPoints.set(event.fanId, row);
  }
  for (const [participantId, attempts] of Object.entries(data.attempts)) {
    if (!data.leaderboardOptIns.includes(participantId)) continue;
    const row = leaderboardPoints.get(participantId) ?? { points: 0, completed: 0 };
    row.points += Object.values(attempts).reduce((total, attempt) => total + attempt.pointsAwarded, 0);
    leaderboardPoints.set(participantId, row);
  }
  const dismissedTypes = data.dismissedSpotlights[fanId] ?? [];

  return {
    ...data,
    fanId,
    points,
    completed: Object.keys(personalAttempts),
    cards,
    crowd: getCrowdProgress(data),
    personalAttempts,
    missions: data.completedMissions[fanId] ?? [],
    leaderboard: [...leaderboardPoints.entries()]
      .map(([participantId, row]) => ({ fanId: participantId, ...row }))
      .sort((a, b) => b.points - a.points || b.completed - a.completed)
      .slice(0, 20),
    optedIn: data.leaderboardOptIns.includes(fanId),
    dismissed: dismissedTypes.includes(data.spotlight),
    metrics: calculateArenaMetrics(data),
    milestoneCompleted: getCrowdProgress(data) >= data.milestoneTarget,
  };
}
