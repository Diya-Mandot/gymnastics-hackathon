// Revenue model checks, including the master plan's worked examples. Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { computeFinance, scenarios } from "../src/lib/finance.ts";

const base = scenarios.base;
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);

test("existing supporter baseline matches the plan's estimates", () => {
  close(computeFinance({ ...base, existingSupporters: 475, existingPct25: 0.5 }).existingAnnualized, 99_750);
  close(computeFinance({ ...base, existingSupporters: 450, existingPct25: 0 }).existingAnnualized, 54_000);
  close(computeFinance({ ...base, existingSupporters: 500, existingPct25: 1 }).existingAnnualized, 150_000);
});

test("break-even example: $45K fixed at 10% variable needs $50K", () => {
  close(computeFinance({ ...base, buildCost: 25_000, annualOperatingCost: 20_000, variableCostRate: 0.1 }).breakEven, 50_000);
});

test("sponsor funnel keeps pipeline, signed and collected separate", () => {
  const o = computeFinance(base);
  close(o.qualified, 48);
  close(o.proposals, 24);
  close(o.signedDeals, 7.2);
  close(o.signedValue, 108_000);
  close(o.sponsorCollected, 91_800);
  close(o.pipelineValue, 360_000);
});

test("existing revenue is never counted as new", () => {
  const o = computeFinance(base);
  close(o.newCollected, o.fanIncremental + o.sponsorCollected);
  close(o.totalWithExisting - o.newCollected, o.existingAnnualized);
  close(o.netIncremental, o.newCollected * (1 - base.variableCostRate) - (base.buildCost + base.annualOperatingCost));
});

test("conservative scenario can lose money (the model is not rigged)", () => {
  assert.ok(computeFinance(scenarios.conservative).netIncremental < 0);
});
