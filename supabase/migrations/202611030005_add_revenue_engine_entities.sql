-- Shared, fictional-demo entities for the public fan and sponsorship-revenue experiences.
-- Athlete Intelligence and Management Portal entities are intentionally out of scope.

create table public.fans (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  email text,
  supporter_tier_id uuid references public.supporter_tiers(id) on delete set null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.trading_cards (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  slug text not null unique,
  qr_route text not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.card_collections (
  fan_id uuid not null references public.fans(id) on delete cascade,
  trading_card_id uuid not null references public.trading_cards(id) on delete cascade,
  collected_at timestamptz not null default now(),
  primary key (fan_id, trading_card_id)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  sponsor_prospect_id uuid references public.sponsor_prospects(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  title text not null,
  relationship_owner text not null,
  proposed_amount numeric(12,2) not null check (proposed_amount >= 0),
  stage text not null default 'Prospect' check (stage in ('Prospect', 'Qualified', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Agreement', 'Campaign', 'Renewal')),
  next_action text not null,
  follow_up_date date,
  notes text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null unique references public.opportunities(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'draft', 'under_review', 'signed', 'declined')),
  signed_at timestamptz,
  proposed_amount numeric(12,2) not null check (proposed_amount >= 0),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.opportunities(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  event_type text not null check (event_type in ('existing_supporter_baseline', 'new_supporter', 'signed_agreement', 'collected_sponsorship', 'one_time_support', 'refund', 'cost')),
  amount numeric(12,2) not null,
  is_collected boolean not null default false,
  is_incremental boolean not null default true,
  is_demo boolean not null default true,
  occurred_at timestamptz not null default now(),
  notes text
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid references public.fans(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  event_type text not null check (event_type in ('card_scan', 'card_collect', 'profile_view', 'support_start', 'support_complete', 'offer_claim', 'story_view')),
  source text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create index opportunities_stage_idx on public.opportunities(stage);
create index revenue_events_type_idx on public.revenue_events(event_type, is_collected);
create index analytics_events_campaign_idx on public.analytics_events(campaign_id, event_type);

create trigger opportunities_set_updated_at before update on public.opportunities for each row execute function public.set_updated_at();
create trigger agreements_set_updated_at before update on public.agreements for each row execute function public.set_updated_at();

alter table public.fans enable row level security;
alter table public.trading_cards enable row level security;
alter table public.card_collections enable row level security;
alter table public.opportunities enable row level security;
alter table public.agreements enable row level security;
alter table public.revenue_events enable row level security;
alter table public.analytics_events enable row level security;

create policy "public can read demo trading cards" on public.trading_cards for select using (is_demo = true);
create policy "public can read demo opportunities" on public.opportunities for select using (is_demo = true);
create policy "public can read demo agreements" on public.agreements for select using (is_demo = true);
create policy "public can read demo revenue events" on public.revenue_events for select using (is_demo = true);
create policy "public can read demo analytics events" on public.analytics_events for select using (is_demo = true);
