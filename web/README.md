# Rock the Routine — web

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
| `/cards` | Device-local digital trading-card collection and profile pathway |
| `/sponsors` | Sponsor Scout, reverse matching, proposal builder, editable CRM, and renewal report |
| `/insights` | Member-intelligence sample, revenue scenario simulator, break-even, costs, and deployment roadmap |
| `/demo` | Presenter hub with the QR code |
| `/demo/admin`, `/demo/athlete/avery` | Chrome-free presenter views |

## AI campaign brief

`/routines` has a "Draft with AI" panel (also reachable from each Get Matched result). `POST /api/brief` sends the athlete's profile, Story Seed transcript, sponsor brief and package to Claude Opus 5.5 (low effort, streaming, server-side refusal fallback) and streams back a campaign title, fit rationale, three captions, content plan, task list and sponsor email. Everything is labelled as a draft the athlete approves; nothing is posted or emailed.

Set `ANTHROPIC_API_KEY` (locally in `.env.local`, and in the Vercel project settings) for live generation. Without a key, or if the API call fails to start, the route streams a deterministic sample and the panel labels it "Offline sample".

## Revised-plan scope

This branch implements the public fan experience, Athlete Intelligence and Management Portal, and Sponsorship Revenue Engine as a fictional competition MVP. Sponsor targets, campaign results, financial metrics, cards, CRM records, athlete profiles, approvals, and brand-kit outputs are demo data. No external research, email, payment, agreement signing, or automated compliance decision occurs.

## Live data

All live state goes through `src/lib/live` (`LiveSource`):

- **mock** (default): localStorage + BroadcastChannel. Two tabs in the same browser sync instantly. It does **not** sync phone → laptop.
- **supabase**: set `NEXT_PUBLIC_DATA_SOURCE=supabase` plus URL/anon key.

### Backend contract (for Prachi)

The Supabase adapter (`src/lib/live/supabase.ts`) is aligned with the migrations in the repository's root `supabase/` folder. Apply those migrations and `supabase/seed.sql`, then set `NEXT_PUBLIC_DATA_SOURCE=supabase` plus the three Supabase environment variables in `.env.local`.

- `campaigns` table: `id, slug, name, goal, current_raised, supporter_count, business_funding, fan_contributions` plus its linked athlete.
- `donations` table: `id, created_at, supporter_name, campaign_id, athlete_id, amount, support_type, thank_you_pack_sent`.
- `rpc create_demo_donation(p_campaign_slug, p_supporter_name, p_amount)`: inserts a mock donation and bumps campaign totals atomically. **It never calls a payment provider.**
- `rpc reset_confidence_starts_here_demo()`: restores seeded metrics; it is server/service-role only. The admin UI calls `/api/demo/reset`, which requires `DEMO_RESET_SECRET`.
- Realtime enabled on both tables (the client listens to `INSERT` on `donations` and `UPDATE` on `campaigns`).

Athletes, tiers, packages, tasks and prospects are static in `src/lib/seed.ts` for now. The sponsor matcher (`src/lib/match.ts`) runs client-side with the plan's weights (cause 35, audience 25, format 20, budget 10, availability 10). The default brief returns Avery 94%, Mia 89%, Sofia 85%.

## Assets

`public/images` holds web-sized copies (about 10 MB) from `Red rocks digital assets.zip`. Videos are not included.
At the organizers' request, the four demo profiles use real Red Rocks photos (`athlete.photo` / `photoFocus` in `src/lib/seed.ts`). Every profile photo carries a visible "Real Red Rocks photo · name, story & stats are demo content" credit, and those four shots are kept out of the photo strip and banners so no face appears under two captions. Athletes without a photo fall back to an initials square.
