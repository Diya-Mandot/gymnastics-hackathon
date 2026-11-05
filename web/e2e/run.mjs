// Runs the demo checks in order. Usage: npm run test:e2e  (E2E_BASE_URL defaults to http://localhost:3000)
import { BASE, launch } from "./lib.mjs";
import * as suites from "./suites.mjs";

const order = ["setup", "fanToAdmin", "matching", "ai", "teamWorkspace", "audiences", "pages", "teardown"];
const only = process.argv.slice(2);
const selected = only.length ? order.filter((n) => n === "setup" || n === "teardown" || only.includes(n)) : order;

console.log(`Rock the Routine demo checks against ${BASE}\n`);
const browser = await launch();
const failed = [];
for (const name of selected) {
  console.log(`▸ ${name}`);
  try {
    await suites[name](browser);
  } catch (e) {
    failed.push(name);
    console.log(`    ✗ ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
console.log(failed.length ? `\n✗ ${failed.length} failed: ${failed.join(", ")}` : `\n✓ All ${selected.length} suites passed`);
process.exit(failed.length ? 1 : 0);
