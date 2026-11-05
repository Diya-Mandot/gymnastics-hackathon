// The team's Year 1 NIL plan, deal split and sponsor break-even. Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { allocation, breakEvenCustomers, planTotals, reporting, splitDeal, sponsorReturn } from "../src/lib/nilModel.ts";

test("Year 1 plan: $446K new + $200K baseline = $646K total NIL activity", () => {
  const t = planTotals();
  assert.equal(t.newActivity, 446_000);
  assert.equal(t.total, 646_000);
  assert.equal(t.sponsorActivity, 370_000);
  assert.equal(t.fanActivity, 76_000);
  assert.equal(t.multiple.toFixed(2), "3.23");
  assert.equal(Math.round(t.increasePct), 223);
});

test("deal split is 65/12/10/8/5 and always adds up to the deal", () => {
  assert.equal(allocation.reduce((s, a) => s + a.pct, 0).toFixed(10), (1).toFixed(10));
  assert.deepEqual(splitDeal(15_000), { athlete: 9_750, creative: 1_800, activation: 1_500, community: 1_200, platform: 750 });
  for (const amount of [5_000, 30_000, 12_345, 7]) {
    assert.equal(Object.values(splitDeal(amount)).reduce((s, v) => s + v, 0), amount);
  }
});

test("sponsor break-even table matches the plan", () => {
  assert.deepEqual([25, 100, 250].map((c) => breakEvenCustomers(5_000, c)), [200, 50, 20]);
  assert.deepEqual([25, 100, 250].map((c) => breakEvenCustomers(15_000, c)), [600, 150, 60]);
  assert.deepEqual([25, 100, 250].map((c) => breakEvenCustomers(30_000, c)), [1_200, 300, 120]);
});

test("worked example: $15K routine, $100 per customer, 200 customers = $5K net, 33.3% ROI", () => {
  const r = sponsorReturn(15_000, 100, 200);
  assert.equal(r.contribution, 20_000);
  assert.equal(r.net, 5_000);
  assert.equal(r.roiPct.toFixed(1), "33.3");
});

test("reporting keeps gross activity, athlete pay and platform revenue separate", () => {
  const r = reporting();
  assert.equal(r.grossNilActivity, 646_000);
  assert.equal(r.athleteFromSponsorships, 240_500);
  assert.equal(r.platformRevenue, 18_500);
  assert.equal(r.campaignCosts, 111_000);
});
