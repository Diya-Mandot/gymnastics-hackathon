# Rock the Routine — web

Project overview, environment variables, tests and the demo runbook live in the [root README](../README.md) and [docs/DEMO.md](../docs/DEMO.md). This file covers the app internals.

Next.js 15 (App Router) + Tailwind v4 + Motion. Frontend for the Red Rocks AI Innovation Challenge MVP.

```bash
cd web
npm install
cp .env.example .env.local   # optional; mock mode works with no env
npm run dev                  # http://localhost:3000
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home: hero, four audience paths, live Confidence Starts Here campaign, Fan Favorites + Rising Routines |
| `/match` | Get Matched: 6-question sponsor brief → top 3 with score breakdown, compare, Build Campaign |
| `/athletes` | Explore: search, 9 filters, 8 sorts, grouped Fan Favorites / Rising Routines |
| `/athletes/[slug]` | Athlete profile with story, metrics, sponsor fit, packages, tiers, Your Impact |
| `/routines` | Build an Impact Routine (`?athlete=&package=`) + campaign workspace tabs |
| `/support` | Fan/supporter landing with Find Your Routine |
| `/support/[slug]` | **Phone QR flow**: pick amount → Give $10 Demo → thank-you + I Rocked the Routine card |
| `/admin` | WRTH admin dashboard with the live transaction reveal and reset |
| `/admin/revenue` | Revenue Intelligence (the one revenue dashboard; `/insights` redirects here): scenario simulator (conservative/base/stretch + sliders), funding mix, sponsor funnel, attribution, $2M comparison, live demo records, member-intelligence sample, cost stages, phased rollout |
| `/portal/[slug]` | Athlete Intelligence: dashboard, AI Brand Studio (media kit + approval), Sponsor Fit reverse matching, deal workspace. Simulated athlete / WRTH manager / creative reviewer roles; Operations Copilot and Approvals tabs |
| `/cards` | Device-local digital trading-card collection and profile pathway |
| `/sponsors` | Sponsor Engine: Scout, reverse matching, package builder, CRM and renewal report. Its CRM is the shared pipeline in `src/lib/deals.ts`, the same records the portal, admin and revenue pages use |
| `/demo` | Presenter hub with the QR code |
| `/demo/admin`, `/demo/athlete/avery` | Chrome-free presenter views |

## AI campaign brief

`/routines` has a "Draft with AI" panel (also reachable from each Get Matched result). `POST /api/brief` sends the athlete's profile, Story Seed transcript, sponsor brief and package to Claude Opus 5.5 (low effort, streaming, server-side refusal fallback) and streams back a campaign title, fit rationale, three captions, content plan, task list and sponsor email. Everything is labelled as a draft the athlete approves; nothing is posted or emailed.

Set `ANTHROPIC_API_KEY` (locally in `.env.local`, and in the Vercel project settings) for live generation. Without a key, or if the API call fails to start, the route streams a deterministic sample and the panel labels it "Offline sample".

## Revenue model

`src/lib/finance.ts` holds the year-one model. Existing supporter revenue (450–500 supporters at $10/$25) is shown but never counted as new; pipeline, signed and collected sponsor money are separate; net incremental benefit = new collected − variable costs − build and operating costs; break-even = fixed ÷ (1 − variable rate). Every input is a labelled hypothetical. Whether the $2M goal is annual or cumulative is still to be confirmed with WRTH.

Sample sponsor opportunities live in `src/lib/deals.ts` (localStorage, shared by the portal, admin and revenue pages). "Reset demo" on `/admin` restores the campaign, deals, media-kit and portal approvals.

## Revised-plan scope

This branch implements the public fan experience, Athlete Intelligence and Management Portal, and Sponsorship Revenue Engine as a fictional competition MVP. Sponsor targets, campaign results, financial metrics, cards, CRM records, athlete profiles, approvals, and brand-kit outputs are demo data. No external research, email, payment, agreement signing, or automated compliance decision occurs.

## Live data

All live state goes through `src/lib/live` (`LiveSource`):

- **mock** (default): localStorage + BroadcastChannel. Two tabs in the same browser sync instantly. It does **not** sync phone → laptop.
- **supabase**: used automatically when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the older `..._ANON_KEY`) are set. `NEXT_PUBLIC_DATA_SOURCE=mock` forces the mock.

### Backend contract (for Prachi)

The Supabase adapter (`src/lib/live/supabase.ts`) is aligned with the migrations in the repository's root `supabase/` folder. Apply those migrations and `supabase/seed.sql`, then set the Supabase URL, publishable key, service-role key and `DEMO_RESET_SECRET` in `.env.local`.

- `campaigns` table: `id, slug, name, goal, current_raised, supporter_count, business_funding, fan_contributions` plus its linked athlete.
- `donations` table: `id, created_at, supporter_name, campaign_id, athlete_id, amount, support_type, thank_you_pack_sent`.
- `rpc create_demo_donation(p_campaign_slug, p_supporter_name, p_amount)`: inserts a mock donation and bumps campaign totals atomically. **It never calls a payment provider.**
- `rpc reset_confidence_starts_here_demo()`: restores seeded metrics; it is server/service-role only. The admin UI calls `/api/demo/reset`, which requires `DEMO_RESET_SECRET`.
- Realtime enabled on both tables (the client listens to `INSERT` on `donations` and `UPDATE` on `campaigns`).

Athletes, tiers, packages, tasks and prospects are static in `src/lib/seed.ts` for now. The sponsor matcher (`src/lib/match.ts`) runs client-side with the plan's weights (cause 35, audience 25, format 20, budget 10, availability 10). The default brief returns Avery 94%, Mia 89%, Sofia 85%.

## Assets

`public/images` holds web-sized copies (about 10 MB) from `Red rocks digital assets.zip`. Videos are not included.
At the organizers' request, the four demo profiles use real Red Rocks photos (`athlete.photo` / `photoFocus` in `src/lib/seed.ts`). Every profile photo carries a visible "Real Red Rocks photo · name, story & stats are demo content" credit, and those four shots are kept out of the photo strip and banners so no face appears under two captions. Athletes without a photo fall back to an initials square.
