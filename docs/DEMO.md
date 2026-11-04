# Demo runbook

The judge journey from the Revised Plan (section 14), mapped to the live app. Live site: https://rock-the-routine.vercel.app

## Before you present (10 minutes)

- [ ] Open https://rock-the-routine.vercel.app/demo/admin. The header must say **Live** with **no "Mock data" label** (if you see it, the Supabase variables are missing on Vercel).
- [ ] Click **Reset demo**, enter the passcode, confirm it shows **$8,240 raised · 186 supporters**.
- [ ] Scan the printed QR from a phone; it should open `/support/avery`. Don't tap Give yet.
- [ ] Open these tabs on the presenter laptop, in order: `/demo`, `/athletes/avery`, `/portal/avery?tab=studio`, `/sponsors`, `/demo/admin`, `/admin/revenue`.
- [ ] If the AI panels say **"Offline sample"**, the Anthropic key isn't set; the demo still works, just say it's a prepared draft.
- [ ] Optional: from `web/`, run `E2E_BASE_URL=https://rock-the-routine.vercel.app npm run test:e2e` to check every step (it resets the demo afterwards).
- [ ] Backup: have the 90-second screen recording ready.

## The journey

| # | Step | Where | What to do / say |
| --- | --- | --- | --- |
| 1 | **Discover** | Printed card QR → phone | Judge scans the table-tent QR. "Every card and poster becomes a measurable way in." |
| 2 | **Engage** | `/athletes/avery`, `/cards` | Show Avery's story, quote and stats; collect her card. "Fan Favorites and Rising Routines get the same spotlight." |
| 3 | **Convert** | Phone `/support/avery` → laptop `/demo/admin` | Judge taps **Give $10 demo**. The laptop shows **"Demo Judge backed Avery Davis with $10."** and the totals tick up. No payment is processed. |
| 4 | **Build the athlete brand** | `/portal/avery?tab=studio` (Athlete role) | Generate the media kit from her Story Seed, then **Approve**. "AI drafts, the athlete decides." |
| 5 | **Find a sponsor** | `/sponsors` → Sponsor Scout, Reverse Match | Pick BrightPath Family Wellness; show the ranked athletes and why. Reverse Match shows who should want Mia or Sofia. |
| 6 | **Build the proposal** | `/sponsors` → Package Builder (or `/routines` → Draft with AI) | $15K Impact Routine: audience, timeline, activation, deliverables, measurement. |
| 7 | **Move the deal** | `/sponsors` → CRM, then `/portal/avery?tab=deals` (WRTH manager) | Move a stage, then record a payment. "Signed is a commitment, collected is cash. We never blur them." |
| 8 | **Prove value** | `/sponsors` → Performance | Campaign results and the renewal recommendation. |
| 9 | **Reveal the revenue system** | `/admin/revenue` | Base scenario, the live demo records (the judge's $10 is there), then flip to **Conservative**: it can lose money. "The model isn't rigged." |
| 10 | **Close** | `/` | "Every routine ends. Its impact should not." |

## After

- Reset the demo from `/admin` so the next run starts at $8,240.
- Anything odd: the admin "Mock data" label means no Supabase keys; "Offline sample" means no Anthropic key; reset asks for `DEMO_RESET_SECRET`.
