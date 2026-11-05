import { adminReset, answerMatchWizard, BASE, check, isMock, kpis, OUT, signedIn, TEAM, watch } from "./lib.mjs";

const desktop = { viewport: { width: 1440, height: 900 } };
const phoneSize = { viewport: { width: 390, height: 844 } };

/** Start from seeded numbers so every run is comparable. */
export async function setup(browser) {
  const page = await (await signedIn(browser, desktop, TEAM)).newPage();
  await adminReset(page);
  check((await kpis(page))[0] === "$8,240", "demo starts at $8,240 raised");
}

/** The judge journey: phone gives $10, the laptop admin shows it live. */
export async function fanToAdmin(browser) {
  const errors = [];
  const laptopCtx = await browser.newContext(desktop);
  const laptop = watch(await laptopCtx.newPage(), errors, "laptop ");
  const mock = await isMock(laptop);
  console.log(`    · data source: ${mock ? "in-browser mock (same browser)" : "Supabase (isolated sessions, like two devices)"}`);
  // The mock only syncs within one browser, so share a context there; Supabase must work across devices.
  const phoneCtx = mock ? laptopCtx : await browser.newContext(phoneSize);
  const phone = watch(await phoneCtx.newPage(), errors, "phone ");
  if (mock) await phone.setViewportSize(phoneSize.viewport);

  await laptop.goto(`${BASE}/demo/admin`);
  await laptop.getByText("$8,240").first().waitFor();
  await laptop.waitForTimeout(3000); // let the realtime connection open, as it would while a judge scans
  const t0 = Date.now();
  await phone.goto(`${BASE}/support/avery`);
  await phone.getByRole("button", { name: /Give \$10 demo/i }).click();
  await phone.getByText("You rocked").waitFor({ timeout: 15000 });
  check(Date.now() - t0 < 20000, `phone flow under 20 seconds (${Date.now() - t0} ms)`);
  await laptop.getByText(/Demo Judge backed Avery Neff with \$10\./).waitFor({ timeout: 20000 });
  await laptop.getByText("New gift: $10").waitFor({ timeout: 10000 });
  check(await laptop.getByText(/Milestone: \$8,250 raised/).count() === 1, "admin gets a gift alert and an every-$50 milestone alert");
  await laptop.waitForTimeout(1500);
  const [raised, supporters] = await kpis(laptop);
  check(raised === "$8,250" && supporters === "187", "admin totals moved to $8,250 and 187 supporters");
  await laptop.screenshot({ path: `${OUT}admin-reveal.png` });
  check(errors.length === 0, `no page errors (${errors.join("; ")})`);
}

/** Matching is explainable and stable: 94 / 89 / 85 for the default brief. */
export async function matching(browser) {
  const errors = [];
  const page = watch(await (await signedIn(browser, desktop, TEAM)).newPage(), errors);
  await answerMatchWizard(page);
  const names = await page.locator("article h2").allTextContents();
  const scores = await page.locator('[role="img"][aria-label$="match"]').evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  check(names.slice(0, 3).join(",") === "Avery Neff,Camie Winger,Clara Raposo", "top three are Avery, Camie, Clara");
  check(scores.join(",") === "94% match,89% match,85% match", "scores are 94 / 89 / 85");
  await page.goto(`${BASE}/athletes`);
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByLabel("Cause").selectOption("inclusion");
  check((await page.locator("article h3").allTextContents()).join(",") === "Camie Winger", "cause filter narrows to Camie");
  check(errors.length === 0, "no page errors");
}

/** All three AI features stream a full draft (live with a key, labelled sample without). */
export async function ai(browser) {
  const errors = [];
  const page = watch(await (await signedIn(browser, desktop, TEAM)).newPage(), errors);
  await answerMatchWizard(page);
  await page.getByRole("link", { name: /Draft Avery’s campaign with AI/ }).click();
  await page.getByRole("button", { name: /Send to Avery for approval/ }).waitFor({ timeout: 60000 });
  const source = (await page.getByText("Written live by Claude").count()) ? "live" : "offline sample";
  check((await page.locator('[aria-label="AI campaign brief"] h3').count()) === 6, `campaign brief has all six sections (${source})`);

  await page.goto(`${BASE}/portal/avery?tab=studio`);
  await page.getByRole("radio", { name: "Athlete" }).click();
  await page.getByRole("button", { name: /Generate media kit|Regenerate media kit/ }).click();
  await page.getByRole("button", { name: "Approve media kit" }).waitFor({ timeout: 60000 });
  check((await page.locator('[aria-label="Generated media kit"] h3').count()) === 6, "Brand Studio media kit has six sections");

  await page.getByRole("button", { name: "Generate Adobe assets" }).click();
  await page.locator('[aria-label="Adobe asset generator"] img').nth(3).waitFor({ timeout: 60000 });
  check((await page.locator('[aria-label="Adobe asset generator"] img').count()) === 4, "Adobe asset generator renders four design files");

  await page.goto(`${BASE}/portal/avery?tab=copilot`);
  await page.getByRole("button", { name: /Run copilot/ }).click();
  await page.getByRole("button", { name: /Run again/ }).waitFor({ timeout: 60000 });
  check((await page.locator("section[aria-busy] h3").count()) === 5, "Operations Copilot has five sections");
  check(errors.length === 0, "no page errors");
}

/** Team workspace: roles, approvals, pipeline, payments, and one consistent set of numbers. */
export async function teamWorkspace(browser) {
  const errors = [];
  const ctx = await signedIn(browser, desktop, TEAM);
  const page = watch(await ctx.newPage(), errors);

  await page.goto(`${BASE}/portal`);
  await page.waitForURL(/\/portal\/avery/);
  check(true, "/portal opens Avery’s portal");

  await page.goto(`${BASE}/portal/avery?tab=approvals`);
  await page.getByRole("radio", { name: "Creative reviewer" }).click();
  check((await page.getByRole("button", { name: "Approve" }).count()) === 0, "a creative reviewer cannot approve");
  await page.getByRole("radio", { name: "Athlete" }).click();
  await page.getByRole("button", { name: "Approve" }).first().waitFor();
  check((await page.getByRole("button", { name: "Approve" }).count()) > 0, "the athlete can approve");

  await page.goto(`${BASE}/portal/avery?tab=fit`);
  const screened = await page.locator('[aria-label="Screened out"]').textContent();
  check(screened.includes("STEM learning") && screened.includes("below Avery’s $8,000 minimum"), "sponsors below Avery’s minimum are screened out, not ranked");
  check((await page.locator("ol h3", { hasText: "STEM learning" }).count()) === 0, "screened-out sponsors get no rank");
  await page.getByRole("button", { name: "Add to pipeline" }).first().click();
  await page.getByRole("button", { name: "✓ In pipeline" }).first().waitFor();
  check(true, "Sponsor Fit adds a qualified opportunity");

  await page.goto(`${BASE}/portal/avery?tab=deals`);
  await page.getByRole("radio", { name: "WRTH manager" }).click();
  await page.getByRole("button", { name: /BrightPath/ }).click();
  await page.getByPlaceholder("7500").fill("2500");
  await page.getByRole("button", { name: "Record" }).click();
  await page.getByText("$10,000").first().waitFor();
  check(true, "a manager records a payment: collected $7,500 → $10,000");

  // The same records everywhere.
  await page.goto(`${BASE}/admin`);
  await page.getByRole("heading", { name: "Sponsor pipeline" }).waitFor();
  const adminSponsors = await page.locator('section:has(h2:text("Sponsor pipeline")) li p.font-medium').allTextContents();
  await page.goto(`${BASE}/sponsors`);
  await page.getByRole("tab", { name: "CRM" }).click();
  const crmSponsors = await page.locator("tbody tr td:first-child p.font-semibold").allTextContents();
  check(adminSponsors.join("|") === crmSponsors.join("|"), "admin pipeline and Sponsor Engine CRM show the same deals");

  await page.goto(`${BASE}/admin/revenue`);
  await page.getByRole("heading", { name: "Live demo records" }).waitFor();
  await page.waitForTimeout(1200);
  const live = await page.locator('[aria-label="Live demo records"] dd').allTextContents();
  check(live.includes("$10,000"), "revenue dashboard shows the recorded payment as collected");
  const heroes = await page.locator('[aria-label="Year-one results"] p.font-display').allTextContents();
  check(heroes.join(",") === "$137.5K,$78.8K,$50K,$99.8K", "base scenario: $137.5K new, $78.8K net, $50K break-even, $99.8K existing");
  check(errors.length === 0, "no page errors");
}

/** Each group sees its own view; areas for other groups explain who they're for. */
export async function audiences(browser) {
  const errors = [];
  const visit = async (audience, path) => {
    const ctx = audience ? await signedIn(browser, desktop, audience) : await browser.newContext(desktop);
    const page = watch(await ctx.newPage(), errors);
    await page.goto(`${BASE}${path}`);
    await page.waitForTimeout(800);
    return page;
  };
  const gated = async (page) => (await page.getByText("This area isn’t part of your view.").count()) > 0;

  let page = await visit(null, "/sponsors");
  check(await gated(page), "signed out: Sponsor Engine asks who you are");
  page = await visit(null, "/support/avery");
  check(!(await gated(page)) && (await page.getByRole("button", { name: /Give \$10 demo/i }).count()) === 1, "signed out: the phone QR flow stays open");

  page = await visit({ group: "supporter", supporterType: "alumni", name: "Jamie" }, "/support");
  check((await page.getByTestId("supporter-welcome").textContent()).includes("Alumni"), "alumni supporter gets a tailored welcome");
  check((await page.locator("#activities article").count()) === 4, "supporters see four community activities");
  page = await visit({ group: "supporter", supporterType: "fan" }, "/routines");
  check(await gated(page), "supporters don't see business Impact Routines");

  page = await visit({ group: "business", name: "BrightPath" }, "/routines");
  check(!(await gated(page)) && (await page.getByRole("link", { name: "Impact Routines" }).count()) > 0, "businesses see Impact Routines in their nav");
  page = await visit({ group: "business" }, "/admin/revenue");
  check(await gated(page), "businesses can't open team revenue");

  page = await visit({ group: "athlete", athleteSlug: "camie" }, "/portal/camie");
  check(!(await gated(page)) && (await page.getByRole("radiogroup", { name: "Viewing as" }).count()) === 0, "Camie sees her own portal without role switching");
  page = await visit({ group: "athlete", athleteSlug: "camie" }, "/portal/avery");
  check(await gated(page), "Camie can't open Avery's portal");

  page = await visit(null, "/sponsors");
  await page.getByRole("button", { name: /Continue as wrth team/i }).click();
  await page.getByRole("tab", { name: "CRM" }).waitFor();
  check(true, "one click from the gate opens the area as that group");
  check(errors.length === 0, `no page errors (${errors.join("; ")})`);
}

/** Every page loads, has no errors, and never scrolls sideways on desktop or phone. */
export async function pages(browser) {
  const routes = ["/", "/signin", "/athletes", "/athletes/avery", "/athletes/camie", "/cards", "/support", "/support/avery", "/match", "/routines", "/portal/avery", "/sponsors", "/admin", "/admin/revenue", "/demo"];
  for (const size of [desktop, phoneSize]) {
    const ctx = await browser.newContext(size);
    for (const route of routes) {
      const errors = [];
      const page = watch(await ctx.newPage(), errors);
      const res = await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (!res?.ok() || overflow > 0 || errors.length) throw new Error(`${route} @${size.viewport.width}: status ${res?.status()}, overflow ${overflow}px, errors ${errors.join("; ")}`);
      await page.close();
    }
    check(true, `${routes.length} pages clean at ${size.viewport.width}px`);
  }
  const page = await (await browser.newContext(desktop)).newPage();
  await page.goto(`${BASE}/insights`);
  check(page.url().endsWith("/admin/revenue"), "/insights redirects to /admin/revenue");
}

/** Leave the shared demo exactly as seeded for the next person. */
export async function teardown(browser) {
  const page = await (await signedIn(browser, desktop, TEAM)).newPage();
  await adminReset(page);
  check((await kpis(page)).join(",") === "$8,240,186", "demo reset to $8,240 and 186 supporters");
}
