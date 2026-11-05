import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateArenaMetrics,
  completeRotationMission,
  createInitialArenaData,
  submitChallengeAnswer,
  toArenaView,
} from "../src/lib/arena-model.ts";

const submit = (
  data: ReturnType<typeof createInitialArenaData>,
  fanId: string,
  challengeId: string,
  answer: string,
  correctAnswer: string,
  ids: string[],
) =>
  submitChallengeAnswer(data, {
    fanId,
    challengeId,
    answer,
    correctAnswer,
    cardSlug: "avery",
    eventIds: ids,
    timestamp: "2026-11-05T12:00:00.000Z",
  });

test("a challenge attempt awards points and an eligible card only once", () => {
  const first = submit(createInitialArenaData(), "fan-1", "routine-beam", "Balance Beam", "Balance Beam", ["1", "2", "3", "4", "5", "6"]);
  const duplicate = submit(first.data, "fan-1", "routine-beam", "Vault", "Balance Beam", ["7", "8", "9", "10", "11", "12"]);

  assert.equal(first.attempt.pointsAwarded, 100);
  assert.equal(duplicate.alreadyAnswered, true);
  assert.equal(duplicate.data.events.filter((event) => event.type === "challenge_completed").length, 1);
  assert.deepEqual(toArenaView(duplicate.data, "fan-1").cards, ["avery"]);
});

test("incorrect answers complete an attempt without points or an unlock", () => {
  const result = submit(createInitialArenaData(), "fan-1", "routine-beam", "Vault", "Balance Beam", ["1", "2", "3", "4", "5", "6"]);
  const view = toArenaView(result.data, "fan-1");

  assert.equal(view.completed.length, 1);
  assert.equal(view.points, 0);
  assert.deepEqual(view.cards, []);
  assert.equal(view.crowd, 651);
});

test("three distinct challenges earn one participation bonus without donations", () => {
  let data = createInitialArenaData();
  for (const [index, challengeId] of ["routine-vault", "routine-beam", "routine-bars"].entries()) {
    data = submit(data, "fan-1", challengeId, "correct", "correct", [`${index}-1`, `${index}-2`, `${index}-3`, `${index}-4`, `${index}-5`, `${index}-6`]).data;
  }

  const view = toArenaView(data, "fan-1");
  assert.equal(view.points, 325);
  assert.equal(data.events.filter((event) => event.type === "participation_bonus").length, 1);
});

test("analytics include each event once and keep fan contributions distinct", () => {
  const initial = createInitialArenaData();
  const data = {
    ...initial,
    events: [
      { id: "1", fanId: "fan-1", type: "fan_contribution" as const, entityId: "support", timestamp: "2026-11-05T12:00:00Z", simulated: true as const, amount: 10 },
      { id: "2", fanId: "fan-1", type: "supporter_cta_click" as const, entityId: "support", timestamp: "2026-11-05T12:01:00Z", simulated: true as const },
    ],
  };
  const metrics = calculateArenaMetrics(data);

  assert.equal(metrics.newFanContributions, 150);
  assert.equal(metrics.simulatedContributions, 15);
  assert.equal(metrics.supporterClicks, 127);
  assert.equal(metrics.participants, 1843);
});

test("rotation missions require their source action and all four award one champion card", () => {
  let data = createInitialArenaData();
  const blocked = completeRotationMission(data, {
    fanId: "fan-1",
    missionId: "beam",
    rotation: 2,
    eventId: "mission-blocked",
    timestamp: "2026-11-05T12:00:00Z",
  });
  assert.match(blocked.error ?? "", /challenge/);

  data = submit(data, "fan-1", "routine-vault", "correct", "correct", ["1", "2", "3", "4", "5", "6"]).data;
  data = { ...data, rotation: 1 };
  data = completeRotationMission(data, { fanId: "fan-1", missionId: "vault", rotation: 1, eventId: "mission-1", timestamp: "2026-11-05T12:01:00Z" }).data;
  data = submit(data, "fan-1", "routine-beam", "correct", "correct", ["7", "8", "9", "10", "11", "12"]).data;
  data = { ...data, rotation: 2 };
  data = completeRotationMission(data, { fanId: "fan-1", missionId: "beam", rotation: 2, eventId: "mission-2", timestamp: "2026-11-05T12:02:00Z" }).data;
  data = { ...data, rotation: 3, events: [...data.events, { id: "story", fanId: "fan-1", type: "athlete_story_view", entityId: "avery", timestamp: "2026-11-05T12:03:00Z", simulated: true }] };
  data = completeRotationMission(data, { fanId: "fan-1", missionId: "bars", rotation: 3, eventId: "mission-3", timestamp: "2026-11-05T12:04:00Z" }).data;
  data = submit(data, "fan-1", "routine-floor", "correct", "correct", ["13", "14", "15", "16", "17", "18"]).data;
  data = { ...data, rotation: 4 };
  data = completeRotationMission(data, { fanId: "fan-1", missionId: "floor", rotation: 4, eventId: "mission-4", timestamp: "2026-11-05T12:05:00Z" }).data;

  assert.ok(toArenaView(data, "fan-1").cards.includes("meet-night-champion"));
});
