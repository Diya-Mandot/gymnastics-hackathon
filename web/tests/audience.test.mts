// Who can open which area. Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { canView, homeFor, navFor } from "../src/lib/audience.ts";

test("shared pages and the QR support flow are open to everyone, signed in or not", () => {
  for (const path of ["/", "/athletes", "/athletes/avery", "/cards", "/support", "/support/avery", "/demo", "/signin"]) {
    assert.ok(canView(null, path), path);
    assert.ok(canView({ group: "business" }, path), path);
  }
});

test("Impact Routines and Get Matched are for businesses (and the team)", () => {
  assert.ok(canView({ group: "business" }, "/routines"));
  assert.ok(canView({ group: "team" }, "/match"));
  assert.ok(!canView({ group: "supporter", supporterType: "parent" }, "/routines"));
  assert.ok(!canView(null, "/match"));
});

test("team areas are team-only; athletes see only their own portal", () => {
  for (const path of ["/sponsors", "/admin", "/admin/revenue"]) {
    assert.ok(canView({ group: "team" }, path));
    assert.ok(!canView({ group: "athlete", athleteSlug: "avery" }, path));
    assert.ok(!canView({ group: "business" }, path));
  }
  assert.ok(canView({ group: "athlete", athleteSlug: "camie" }, "/portal/camie"));
  assert.ok(!canView({ group: "athlete", athleteSlug: "camie" }, "/portal/avery"));
  assert.ok(canView({ group: "team" }, "/portal/avery"));
});

test("each group lands on its own home and nav", () => {
  assert.equal(homeFor({ group: "athlete", athleteSlug: "clara" }), "/portal/clara");
  assert.equal(homeFor({ group: "business" }), "/match");
  assert.ok(navFor({ group: "business" }).some((l) => l.href === "/routines"));
  assert.ok(!navFor({ group: "supporter", supporterType: "fan" }).some((l) => l.href === "/routines"));
});

