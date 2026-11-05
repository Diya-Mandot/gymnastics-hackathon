// Shared helpers for the end-to-end demo checks. Uses your installed Chrome via playwright-core.
import { mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

export const BASE = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const OUT = fileURLToPath(new URL("./.output/", import.meta.url));
mkdirSync(OUT, { recursive: true });

export const launch = () => chromium.launch({ channel: process.env.E2E_BROWSER_CHANNEL ?? "chrome" });

export function check(condition, message) {
  if (!condition) throw new Error(`Check failed: ${message}`);
  console.log(`    ✓ ${message}`);
}

/**
 * A browser context signed in with a real Supabase account of the audience's role, through the /join page.
 * Accounts come from env: E2E_FAN_EMAIL / E2E_FAN_PASSWORD, and the same for BUSINESS, ATHLETE and STAFF.
 */
const roleFor = { supporter: "FAN", business: "BUSINESS", athlete: "ATHLETE", team: "STAFF" };
export async function signedIn(browser, options, audience) {
  const role = roleFor[audience.group];
  const email = process.env[`E2E_${role}_EMAIL`];
  const password = process.env[`E2E_${role}_PASSWORD`];
  if (!email || !password) throw new Error(`No test account for ${role.toLowerCase()}: set E2E_${role}_EMAIL and E2E_${role}_PASSWORD (a confirmed Supabase account with that role).`);
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/join?mode=login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).last().click();
  await page.waitForURL((url) => !url.pathname.startsWith("/join"), { timeout: 20000 });
  await page.close();
  return ctx;
}
export const TEAM = { group: "team", name: "Demo presenter" };

/** Collects uncaught page errors so a suite can assert there were none. */
export function watch(page, errors, label = "") {
  page.on("pageerror", (e) => errors.push(`${label}${page.url()}: ${e.message}`));
  return page;
}

/** Demo reset code: E2E_RESET_CODE, else DEMO_RESET_SECRET from web/.env.local (never printed). */
export function resetCode() {
  if (process.env.E2E_RESET_CODE) return process.env.E2E_RESET_CODE;
  try {
    const env = readFileSync(fileURLToPath(new URL("../.env.local", import.meta.url)), "utf8");
    return env.match(/^DEMO_RESET_SECRET=(.*)$/m)?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

/** True when the deployment runs on the in-browser mock instead of Supabase. */
export async function isMock(page) {
  await page.goto(`${BASE}/demo/admin`);
  await page.waitForTimeout(1500);
  return (await page.getByText("Mock data").count()) > 0;
}

export const kpis = async (page) => (await page.locator('[aria-label="Campaign metrics"] p.font-display').allTextContents()).slice(0, 2);

/** Uses the admin screen's own reset, entering the passcode when Supabase asks for one. */
export async function adminReset(page) {
  await page.goto(`${BASE}/admin`);
  await page.getByRole("button", { name: "Reset demo" }).click();
  const code = page.getByLabel("Demo reset code");
  if (await code.count()) await code.fill(resetCode());
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByText("$8,240").first().waitFor({ timeout: 15000 });
}

export async function answerMatchWizard(page) {
  await page.goto(`${BASE}/match`);
  for (const label of ["Reach Utah families", "Utah families", "Youth confidence", "Community event", "$15,000", "One athlete"]) {
    await page.getByRole("button", { name: new RegExp(`^${label.replace("$", "\\$")}`) }).first().click();
    await page.waitForTimeout(300);
  }
  await page.getByText("Three athletes whose stories").waitFor();
}
