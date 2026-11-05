"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  appendArenaEvent,
  completeRotationMission,
  createInitialArenaData,
  startChallenge as startChallengeModel,
  submitChallengeAnswer,
  transferArenaProgress,
  toArenaView,
  type ArenaData,
  type ArenaEventType,
  type ArenaView,
  type MeetStatus,
  type SpotlightType,
} from "./arena-model";

const STORAGE_KEY = "rtr:arena:v3";
const LEGACY_KEY = "rtr:arena:v2";
const CHANNEL_NAME = "rtr-arena-v3";
const rotationChallenge: Record<number, string> = {
  1: "routine-vault",
  2: "routine-beam",
  3: "routine-bars",
  4: "routine-floor",
};
const spotlightSequence: SpotlightType[] = [
  "athlete", "sponsor", "athlete", "support", "athlete", "milestone", "athlete", "sponsor",
  "athlete", "support", "athlete", "sponsor", "athlete", "milestone", "athlete", "support",
  "sponsor", "athlete", "milestone", "sponsor",
];

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getAnonymousFanId(): string {
  const saved = localStorage.getItem("rtr:arena:fan-id");
  if (saved) return saved;
  const created = randomId();
  localStorage.setItem("rtr:arena:fan-id", created);
  return created;
}

function readData(): ArenaData {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) {
    const parsed: unknown = JSON.parse(current);
    if (!parsed || typeof parsed !== "object" || !("events" in parsed) || !Array.isArray(parsed.events)) {
      throw new Error("Saved Arena demo data is invalid. Use the staff Reset Demo control to start a fresh session.");
    }
    return { ...createInitialArenaData(), ...(parsed as Partial<ArenaData>) };
  }

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    const parsed: unknown = JSON.parse(legacy);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Saved Arena demo data is invalid. Use the staff Reset Demo control to start a fresh session.");
    }
    const old = parsed as { status?: MeetStatus; rotation?: number; active?: boolean; spotlight?: SpotlightType };
    const migrated = {
      ...createInitialArenaData(),
      status: old.status ?? "live",
      rotation: old.rotation ?? 2,
      active: old.active ?? true,
      activeChallengeId: rotationChallenge[old.rotation ?? 2] ?? "routine-beam",
      spotlight: old.spotlight ?? "athlete",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  }

  const initial = createInitialArenaData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function persist(data: ArenaData, channel: BroadcastChannel | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  channel?.postMessage(data);
}

export function useArena(): {
  state: ArenaView;
  isReady: boolean;
  error: string | null;
  clearError: () => void;
  track: (type: ArenaEventType, entityId: string, options?: { amount?: number; once?: boolean }) => void;
  startChallenge: (challengeId: string, sponsored?: boolean) => void;
  answer: (challengeId: string, answer: string, correctAnswer: string, cardSlug?: string, sponsored?: boolean) => { correct: boolean; pointsAwarded: number; alreadyAnswered: boolean } | null;
  joinCrowdChallenge: () => { pointsAwarded: number; alreadyAnswered: boolean } | null;
  completeMission: (missionId: string, rotation: number) => void;
  setLeaderboardOptIn: (enabled: boolean) => void;
  dismissSpotlight: () => void;
  nextSpotlight: () => void;
  startDemoMeet: () => void;
  advanceRotation: () => void;
  activateChallenge: () => void;
  setMeetStatus: (status: MeetStatus) => void;
  setRotation: (rotation: number) => void;
  setChallengeActive: (enabled: boolean) => void;
  setMeetTitle: (title: string) => void;
  setSpotlight: (spotlight: SpotlightType) => void;
  setSpotlightApproval: (spotlight: SpotlightType, approved: boolean) => void;
  setFeaturedAthlete: (slug: string) => void;
  setSponsorPlacement: (enabled: boolean) => void;
  setMilestoneTarget: (target: number) => void;
  setFundraisingGoal: (target: number) => void;
  reset: () => void;
} {
  const [data, setData] = useState<ArenaData>(() => createInitialArenaData());
  const [fanId, setFanId] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const fanIdRef = useRef(fanId);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    try {
      const loaded = readData();
      const anonymousId = getAnonymousFanId();
      dataRef.current = loaded;
      setData(loaded);
      setFanId(anonymousId);
      fanIdRef.current = anonymousId;
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;
        channel.addEventListener("message", (event: MessageEvent<unknown>) => {
          const next = event.data as ArenaData;
          if (next && Array.isArray(next.events)) {
            dataRef.current = next;
            setData(next);
          }
        });
      }
      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY || !event.newValue) return;
        try {
          const next = JSON.parse(event.newValue) as ArenaData;
          if (Array.isArray(next.events)) {
            dataRef.current = next;
            setData(next);
          }
        } catch {
          setError("Arena data changed in another tab but could not be read. Use Reset Demo to recover.");
        }
      };
      window.addEventListener("storage", onStorage);
      // Signed in on this device? Keep this person's meet-night progress under their id.
      try {
        const signedInId = (JSON.parse(localStorage.getItem("rtr:audience:v2") ?? "null") as { id?: string } | null)?.id;
        if (signedInId && signedInId !== fanIdRef.current) {
          const migrated = transferArenaProgress(dataRef.current, fanIdRef.current, signedInId);
          if (migrated !== dataRef.current) {
            persist(migrated, channelRef.current);
            dataRef.current = migrated;
            setData(migrated);
          }
          setFanId(signedInId);
          fanIdRef.current = signedInId;
        }
      } catch {}
      setIsReady(true);
      return () => {
        window.removeEventListener("storage", onStorage);
        channelRef.current?.close();
        channelRef.current = null;
      };
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load Arena demo data.");
      setIsReady(true);
      return () => {
        channelRef.current?.close();
      };
    }
  }, []);

  const state = useMemo(
    () => toArenaView(data, fanId || "anonymous-loading"),
    [data, fanId],
  );

  function update(change: (current: ArenaData) => ArenaData): boolean {
    try {
      const next = change(dataRef.current);
      if (next === dataRef.current) return false;
      persist(next, channelRef.current);
      dataRef.current = next;
      setData(next);
      setError(null);
      return true;
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not save this Arena action.");
      return false;
    }
  }

  function track(
    type: ArenaEventType,
    entityId: string,
    options: { amount?: number; once?: boolean } = {},
  ) {
    const participantId = fanIdRef.current;
    if (!participantId) return;
    update((current) => {
      if (options.once && current.events.some(
        (event) => event.fanId === participantId && event.type === type && event.entityId === entityId,
      )) return current;
      let next = appendArenaEvent(current, {
        id: randomId(),
        fanId: participantId,
        type,
        entityId,
        timestamp: new Date().toISOString(),
        ...(options.amount === undefined ? {} : { amount: options.amount }),
      });
      if (type === "fan_opt_in" && !next.leaderboardOptIns.includes(participantId)) {
        next = { ...next, leaderboardOptIns: [...next.leaderboardOptIns, participantId] };
      }
      if (type === "spotlight_dismissed") {
        const dismissed = next.dismissedSpotlights[participantId] ?? [];
        next = {
          ...next,
          dismissedSpotlights: {
            ...next.dismissedSpotlights,
            [participantId]: [...new Set([...dismissed, current.spotlight])],
          },
        };
      }
      return next;
    });
  }

  function startChallenge(challengeId: string, sponsored = false) {
    const participantId = fanIdRef.current;
    if (!participantId) return;
    update((current) => {
      if (current.status !== "live" || !current.active) {
        setError("The meet or current challenge is not active.");
        return current;
      }
      if (current.startedChallenges[participantId]?.includes(challengeId)) return current;
      let next = startChallengeModel(current, participantId, challengeId, randomId(), new Date().toISOString());
      if (sponsored) {
        next = appendArenaEvent(next, {
          id: randomId(),
          fanId: participantId,
          type: "sponsor_challenge_started",
          entityId: challengeId,
          timestamp: new Date().toISOString(),
        });
      }
      return next;
    });
  }

  function answer(
    challengeId: string,
    answerText: string,
    correctAnswer: string,
    cardSlug?: string,
    sponsored = false,
  ) {
    const participantId = fanIdRef.current;
    if (!participantId) return null;
    let result: ReturnType<typeof submitChallengeAnswer> | null = null;
    update((current) => {
      if (current.status !== "live" || !current.active) {
        setError("The meet or current challenge is not active.");
        return current;
      }
      result = submitChallengeAnswer(current, {
        fanId: participantId,
        challengeId,
        answer: answerText,
        correctAnswer,
        ...(cardSlug ? { cardSlug } : {}),
        pointsAvailable: 100,
        sponsored,
        eventIds: Array.from({ length: 6 }, () => randomId()),
        timestamp: new Date().toISOString(),
      });
      return result.data;
    });
    const submitted = result as ReturnType<typeof submitChallengeAnswer> | null;
    if (!submitted) return null;
    return {
      correct: submitted.attempt.correct,
      pointsAwarded: submitted.attempt.pointsAwarded,
      alreadyAnswered: submitted.alreadyAnswered,
    };
  }

  function completeMission(missionId: string, rotation: number) {
    const participantId = fanIdRef.current;
    if (!participantId) return;
    let missionError: string | undefined;
    update((current) => {
      const result = completeRotationMission(current, {
        fanId: participantId,
        missionId,
        rotation,
        eventId: randomId(),
        timestamp: new Date().toISOString(),
      });
      missionError = result.error;
      return result.data;
    });
    if (missionError) setError(missionError);
  }

  function joinCrowdChallenge() {
    const participantId = fanIdRef.current;
    if (!participantId) return null;
    let result: ReturnType<typeof submitChallengeAnswer> | null = null;
    update((current) => {
      if (current.status !== "live" || !current.active) {
        setError("The meet or current challenge is not active.");
        return current;
      }
      result = submitChallengeAnswer(current, {
        fanId: participantId,
        challengeId: "crowd-cheer",
        answer: "joined",
        correctAnswer: "joined",
        pointsAvailable: 25,
        eventIds: Array.from({ length: 6 }, () => randomId()),
        timestamp: new Date().toISOString(),
      });
      return result.data;
    });
    const submitted = result as ReturnType<typeof submitChallengeAnswer> | null;
    if (!submitted) return null;
    return { pointsAwarded: submitted.attempt.pointsAwarded, alreadyAnswered: submitted.alreadyAnswered };
  }

  function setLeaderboardOptIn(enabled: boolean) {
    const participantId = fanIdRef.current;
    if (!participantId) return;
    if (enabled) {
      track("fan_opt_in", "leaderboard");
    } else {
      update((current) => ({
        ...current,
        leaderboardOptIns: current.leaderboardOptIns.filter((id) => id !== participantId),
      }));
    }
  }

  function setSpotlight(spotlight: SpotlightType) {
    update((current) => {
      if (current.spotlight === spotlight) return current;
      const participantId = fanIdRef.current || null;
      const next = { ...current, spotlight };
      return appendArenaEvent(next, {
        id: randomId(),
        fanId: participantId,
        type: "spotlight_changed",
        entityId: spotlight,
        timestamp: new Date().toISOString(),
      });
    });
  }

  return {
    state,
    isReady,
    error,
    clearError: () => setError(null),
    track,
    startChallenge,
    answer,
    joinCrowdChallenge,
    completeMission,
    setLeaderboardOptIn,
    dismissSpotlight: () => track("spotlight_dismissed", state.spotlight),
    nextSpotlight: () => {
      const currentIndex = spotlightSequence.indexOf(state.spotlight);
      setSpotlight(spotlightSequence[(currentIndex + 1) % spotlightSequence.length]);
    },
    startDemoMeet: () => update((current) => {
      const next = {
        ...current,
        status: "live" as const,
        rotation: 1,
        active: true,
        activeChallengeId: rotationChallenge[1],
      };
      return appendArenaEvent(next, {
        id: randomId(),
        fanId: null,
        type: "meet_started",
        entityId: "red-rocks-demo-meet",
        timestamp: new Date().toISOString(),
      });
    }),
    advanceRotation: () => update((current) => {
      if (current.rotation >= 4) return { ...current, status: "completed", active: false };
      const rotation = current.rotation + 1;
      let next = {
        ...current,
        rotation,
        active: true,
        activeChallengeId: rotationChallenge[rotation],
      };
      next = appendArenaEvent(next, {
        id: randomId(),
        fanId: null,
        type: "rotation_advanced",
        entityId: String(rotation),
        timestamp: new Date().toISOString(),
      });
      return next;
    }),
    activateChallenge: () => update((current) => {
      const challengeId = rotationChallenge[current.rotation] ?? rotationChallenge[1];
      let next = { ...current, active: true, activeChallengeId: challengeId };
      next = appendArenaEvent(next, {
        id: randomId(),
        fanId: null,
        type: "challenge_activated",
        entityId: challengeId,
        timestamp: new Date().toISOString(),
      });
      return next;
    }),
    setMeetStatus: (status: MeetStatus) => update((current) => ({ ...current, status, active: status === "live" && current.active })),
    setRotation: (rotation: number) => {
      if (!Number.isInteger(rotation) || rotation < 1 || rotation > 4) {
        setError("Choose a rotation from 1 through 4.");
        return;
      }
      update((current) => appendArenaEvent(
        {
          ...current,
          rotation,
          activeChallengeId: rotationChallenge[rotation],
          active: current.status === "live",
        },
        {
          id: randomId(),
          fanId: null,
          type: "rotation_advanced",
          entityId: String(rotation),
          timestamp: new Date().toISOString(),
        },
      ));
    },
    setChallengeActive: (enabled: boolean) => update((current) => appendArenaEvent(
      { ...current, active: enabled && current.status === "live" },
      {
        id: randomId(),
        fanId: null,
        type: enabled ? "challenge_activated" : "challenge_deactivated",
        entityId: current.activeChallengeId,
        timestamp: new Date().toISOString(),
      },
    )),
    setMeetTitle: (title: string) => {
      const cleanTitle = title.trim().slice(0, 100);
      if (!cleanTitle) {
        setError("Enter a meet title before saving.");
        return;
      }
      update((current) => appendArenaEvent(
        { ...current, meetTitle: cleanTitle },
        {
          id: randomId(),
          fanId: null,
          type: "meet_config_changed",
          entityId: "meet-title",
          timestamp: new Date().toISOString(),
        },
      ));
    },
    setSpotlight,
    setSpotlightApproval: (spotlight: SpotlightType, approved: boolean) => update((current) => appendArenaEvent(
      {
        ...current,
        approvedSpotlights: approved
          ? [...new Set([...current.approvedSpotlights, spotlight])]
          : current.approvedSpotlights.filter((item) => item !== spotlight),
      },
      {
        id: randomId(),
        fanId: null,
        type: "spotlight_approval_changed",
        entityId: `${spotlight}:${approved ? "approved" : "paused"}`,
        timestamp: new Date().toISOString(),
      },
    )),
    setFeaturedAthlete: (slug: string) => {
      if (!["avery", "camie", "clara", "ella"].includes(slug)) {
        setError("Choose an athlete from the existing roster.");
        return;
      }
      update((current) => ({ ...current, featuredAthleteSlug: slug }));
    },
    setSponsorPlacement: (enabled: boolean) => update((current) => appendArenaEvent(
      { ...current, sponsorPlacementActive: enabled },
      {
        id: randomId(),
        fanId: null,
        type: "sponsor_placement_changed",
        entityId: enabled ? "enabled" : "paused",
        timestamp: new Date().toISOString(),
      },
    )),
    setMilestoneTarget: (target: number) => {
      if (!Number.isInteger(target) || target < 1) {
        setError("The crowd milestone target must be a positive whole number.");
        return;
      }
      update((current) => ({ ...current, milestoneTarget: target }));
    },
    setFundraisingGoal: (target: number) => {
      if (!Number.isInteger(target) || target < 1 || target > 1_000_000) {
        setError("Enter a simulated fundraising goal from $1 to $1,000,000.");
        return;
      }
      update((current) => appendArenaEvent(
        { ...current, fundraisingGoal: target },
        {
          id: randomId(),
          fanId: null,
          type: "fundraising_goal_changed",
          entityId: String(target),
          timestamp: new Date().toISOString(),
          amount: target,
        },
      ));
    },
    reset: () => {
      const initial = createInitialArenaData();
      update(() => ({
        ...initial,
        events: [{
          id: randomId(),
          fanId: null,
          type: "meet_started",
          entityId: "demo-reset",
          timestamp: new Date().toISOString(),
          simulated: true,
        }],
      }));
    },
  };
}
