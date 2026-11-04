# Rock the Routine

A Red Rocks NIL revenue platform for the 2026 Adobe Red Rocks AI Innovation Challenge. It connects fan engagement, athlete intelligence and business sponsorship in one app, so Who Rocks the House (WRTH) can turn existing fan attention, athlete stories and local business relationships into a more systematic NIL revenue process.

**Live site:** https://rock-the-routine.vercel.app (deploys automatically on every push to `main`)
**Demo runbook:** [docs/DEMO.md](docs/DEMO.md)

## What's in it

| Audience | Pages |
| --- | --- |
| **Fans** | `/` home · `/athletes` explore · `/athletes/[slug]` profiles · `/cards` digital trading cards · `/support` and `/support/[slug]` (the phone QR $10 demo) |
| **Businesses** | `/match` Get Matched · `/routines` Impact Routines with the AI campaign brief |
| **WRTH team** | `/portal/[slug]` Athlete Portal (Brand Studio, Sponsor Fit, Deals, Operations Copilot, Approvals) · `/sponsors` Sponsor Engine (Scout, reverse match, package builder, CRM, performance) · `/admin` live campaign · `/admin/revenue` Revenue Intelligence |
| **Presenter** | `/demo` QR hub · `/demo/admin` full-screen reveal · `/demo/athlete/avery` |

The public site and the team workspace have separate navigation; the team area is labelled "WRTH team" and links back to the public site.

## Repository layout

```
web/        Next.js app (the whole product)
  src/app/     pages and API routes (AI: /api/brief, /api/media-kit, /api/copilot; /api/demo/reset)
  src/lib/     data and logic: seed, sponsors, deals (shared pipeline), match, finance, ai, live (mock/Supabase)
  e2e/         end-to-end demo checks (npm run test:e2e)
  tests/       unit tests for the revenue model (npm test)
supabase/   database migrations, seed data and the backend contract
docs/
  challenge/   rules, judging criteria, About Red Rocks, SWOT, Adobe kickoff deck
  planning/    Final Plan, Revised Plan (master spec), business case, task split, team work plan
  DEMO.md      step-by-step judge demo
Red rocks digital assets.zip   original photo/video pack (Git LFS); web-sized copies live in web/public/images
```

## Run it locally

```bash
cd web
npm install
cp .env.example .env.local   # then fill in values (see below)
npm run dev                  # http://localhost:3000
```

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Real-time phone → laptop sync. Without them the app uses an in-browser mock that only syncs tabs in one browser. |
| `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_RESET_SECRET` | Server-only; lets the admin "Reset demo" button restore seeded numbers (asks for the passcode). |
| `ANTHROPIC_API_KEY` | Live Claude for the campaign brief, Brand Studio and Operations Copilot. Without it each shows a clearly labelled offline sample. |
| `NEXT_PUBLIC_SITE_URL` | Optional origin for the `/demo` QR code; defaults to the current site. |

Never commit `.env.local`; it is git-ignored. On Vercel, set the same variables under Project → Settings → Environment Variables.

## Tests

```bash
cd web
npm test                                          # revenue model math, including the master plan's worked examples
E2E_BASE_URL=http://localhost:3000 npm run test:e2e   # full demo journey in your installed Chrome
```

The end-to-end run resets the shared demo before and after (using `DEMO_RESET_SECRET` from `web/.env.local`), so it leaves Supabase at the seeded $8,240 / 186 supporters. Point `E2E_BASE_URL` at the live site to check production.

## Ground rules

- Athlete names, stories, quotes and stats are demo content. Athlete photos are real Red Rocks images supplied by the organizers and are labelled as such.
- Sponsors, supporters and campaign results are fictional or illustrative.
- No real payments, outreach, agreement signing or compliance clearance happen. Every AI output is a draft the athlete approves.
- Financial figures are labelled hypotheticals; existing supporter revenue is never counted as new.
