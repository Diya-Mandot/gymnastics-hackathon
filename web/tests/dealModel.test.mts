import assert from "node:assert/strict";
import { test } from "node:test";
import { dealTotals, fromDealRow, seedDeals, toDealRow } from "../src/lib/dealModel.ts";

test("deal rows round-trip between the app and Supabase shapes", () => {
  seedDeals.forEach((deal, i) => {
    const row = toDealRow(deal, i);
    assert.equal(row.sort_order, i);
    assert.deepEqual(fromDealRow(row), deal);
  });
});

test("numeric columns come back from Postgres as strings and are coerced", () => {
  const row = { ...toDealRow(seedDeals[0], 0), amount: "15000.00", collected: "7500.00" };
  const deal = fromDealRow(row);
  assert.equal(deal.amount, 15000);
  assert.equal(deal.collected, 7500);
});

test("seed deals never collect more than they are worth (matches the DB check)", () => {
  for (const d of seedDeals) assert.ok(d.collected <= d.amount, d.id);
  assert.equal(dealTotals(seedDeals).collected, 7500);
});
