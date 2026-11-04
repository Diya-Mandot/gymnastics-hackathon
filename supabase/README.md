# Supabase backend handoff

This directory is the backend contract for the Rock the Routine demo. It uses only fictional athletes and a mock $10 contribution; it has no payment-provider integration.

## Apply the backend

1. Create a Supabase project.
2. Run the SQL files in `migrations/` in lexical order.
3. Run `seed.sql` once. It is idempotent, so it can also be rerun to restore missing demo records.
4. Confirm the `campaigns`, `donations`, and `fan_actions` tables are enabled in the `supabase_realtime` publication (migration `202611020001` does this automatically in a normal Supabase project).
5. Use the browser client with the project URL and anon key. Keep the service-role key server-only.

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=server-only-secret
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in a client component, a public route, or a committed environment file. For the frontend's protected demo reset, also set a server-only `DEMO_RESET_SECRET`; the admin screen asks the presenter for it before calling the reset route.

## Frontend integration

Copy/import `client/rockTheRoutine.ts` after installing `@supabase/supabase-js` in the frontend app. It provides:

| Screen / flow | Helper |
| --- | --- |
| Explore Athletes | `getAllAthletes(client, filters)` |
| Athlete profile | `getAthleteBySlug(client, slug)` |
| Campaign / impact | `getCampaignBySlug(client)` |
| Campaign workspace | `getCampaignTasks(client, campaignId)` |
| Get Matched results | `submitSponsorMatcher(client, brief)` |
| Fake QR contribution | `createDemoDonation(client)` |
| Admin dashboard | `getAdminDashboard(client)` |
| Live updates | `subscribeToCampaignUpdates(client, campaignId, handler)` |

For the QR demo, call `createDemoDonation(client, 'confidence-starts-here', 'Demo Judge')`. The UI must visibly state: **“Demo contribution - no payment will be processed.”** The response returns the updated total and supporter count; the separate admin display should subscribe to Realtime to show the change without a refresh. The Next.js app's `web/src/lib/live/supabase.ts` is the canonical adapter for this schema.

## Reset control

`resetDemo` calls `reset_confidence_starts_here_demo`, which is intentionally granted only to `service_role`. Put a reset button behind a server-side demo/admin route; never call it from a browser Supabase client.

## Data / safety decisions

- The weighted sponsor match is 35% cause, 25% audience, 20% campaign format, 10% budget, and 10% availability. It does not rank by follower count.
- RLS allows public reads only for designated fictional demo records. Writes happen through the narrowly scoped donation RPC.
- The contribution RPC is mock-only and always records `$10.00` with `is_demo = true`.
- Asset URLs in seed data are intentional placeholders for optimized, approved derivatives from the Red Rocks asset pack. Do not assign a real athlete image to a fictional profile without written approval.
