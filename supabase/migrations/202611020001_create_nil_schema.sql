-- Rock the Routine: core Supabase data model.
-- This migration intentionally contains only fictional demo data structures.

create extension if not exists pgcrypto;

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  specialty text not null,
  short_bio text not null,
  quote text not null,
  photo_url text,
  story_video_url text,
  causes text[] not null default '{}',
  campaign_types text[] not null default '{}',
  audience_tags text[] not null default '{}',
  social_platforms text[] not null default '{}',
  availability text not null default 'Available',
  in_person_available boolean not null default false,
  budget_min numeric(12,2) not null check (budget_min >= 0),
  total_reach integer not null check (total_reach >= 0),
  engagement_rate numeric(5,2) not null check (engagement_rate between 0 and 100),
  featured_type text not null check (featured_type in ('Fan Favorite', 'Rising Routine')),
  impact_goal numeric(12,2) not null check (impact_goal >= 0),
  current_raised numeric(12,2) not null default 0 check (current_raised >= 0),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text not null,
  athlete_id uuid references public.athletes(id) on delete set null,
  community_partner text not null,
  sponsor_name text not null,
  goal numeric(12,2) not null check (goal > 0),
  current_raised numeric(12,2) not null default 0 check (current_raised >= 0),
  supporter_count integer not null default 0 check (supporter_count >= 0),
  business_funding numeric(12,2) not null default 0 check (business_funding >= 0),
  fan_contributions numeric(12,2) not null default 0 check (fan_contributions >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'complete')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supporter_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  monthly_amount numeric(12,2) not null default 0 check (monthly_amount >= 0),
  description text not null,
  benefits text[] not null default '{}',
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  owner_role text not null check (owner_role in ('athlete', 'sponsor', 'wrth_admin', 'creative')),
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'awaiting_approval', 'done')),
  approval_state text not null default 'not_required' check (approval_state in ('not_required', 'pending', 'approved')),
  attachment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete restrict,
  athlete_id uuid references public.athletes(id) on delete set null,
  supporter_name text not null default 'Demo Judge',
  amount numeric(12,2) not null check (amount > 0),
  support_type text not null check (support_type in ('one_time', 'monthly', 'celebration_video')),
  is_demo boolean not null default true,
  thank_you_pack_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.sponsor_matches (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  business_goal text not null,
  audience text not null,
  cause text not null,
  campaign_format text not null,
  budget numeric(12,2) not null check (budget >= 0),
  athlete_scope text not null check (athlete_scope in ('one_athlete', 'group', 'team_wide')),
  match_score numeric(5,2) not null check (match_score between 0 and 100),
  score_breakdown jsonb not null,
  explanation text not null,
  recommended_campaign text not null,
  created_at timestamptz not null default now()
);

create table public.fan_actions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  athlete_id uuid references public.athletes(id) on delete set null,
  action_type text not null check (action_type in ('donation', 'qr_scan', 'message', 'offer_claim', 'share', 'nomination')),
  detail text not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.sponsor_prospects (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text not null,
  description text,
  location text,
  known_connection text,
  estimated_budget numeric(12,2) check (estimated_budget >= 0),
  status text not null default 'new' check (status in ('new', 'researching', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index athletes_featured_type_idx on public.athletes(featured_type);
create index athletes_causes_idx on public.athletes using gin(causes);
create index athletes_audience_tags_idx on public.athletes using gin(audience_tags);
create index donations_campaign_created_idx on public.donations(campaign_id, created_at desc);
create index fan_actions_campaign_created_idx on public.fan_actions(campaign_id, created_at desc);
create index tasks_campaign_status_idx on public.tasks(campaign_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger athletes_set_updated_at before update on public.athletes
for each row execute function public.set_updated_at();
create trigger campaigns_set_updated_at before update on public.campaigns
for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();
create trigger sponsor_prospects_set_updated_at before update on public.sponsor_prospects
for each row execute function public.set_updated_at();

alter table public.athletes enable row level security;
alter table public.campaigns enable row level security;
alter table public.supporter_tiers enable row level security;
alter table public.tasks enable row level security;
alter table public.donations enable row level security;
alter table public.sponsor_matches enable row level security;
alter table public.fan_actions enable row level security;
alter table public.sponsor_prospects enable row level security;

create policy "public can read demo athletes" on public.athletes for select using (is_demo = true);
create policy "public can read demo campaigns" on public.campaigns for select using (is_demo = true);
create policy "public can read demo tiers" on public.supporter_tiers for select using (is_demo = true);
create policy "public can read demo tasks" on public.tasks for select using (true);
create policy "public can read demo donations" on public.donations for select using (is_demo = true);
create policy "public can read demo fan actions" on public.fan_actions for select using (is_demo = true);

alter table public.campaigns replica identity full;
alter table public.donations replica identity full;
alter table public.fan_actions replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'campaigns') then
    alter publication supabase_realtime add table public.campaigns;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'donations') then
    alter publication supabase_realtime add table public.donations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fan_actions') then
    alter publication supabase_realtime add table public.fan_actions;
  end if;
end;
$$;
