-- One shared set of sponsor deal records for Sponsor Scout, the CRM, athlete approvals,
-- the admin dashboard and the revenue dashboard. Fictional demo data only.

create table public.demo_deals (
  id text primary key check (char_length(id) between 1 and 80),
  sponsor text not null check (char_length(sponsor) between 1 and 160),
  athlete_slug text not null check (char_length(athlete_slug) between 1 and 80),
  package_name text not null check (char_length(package_name) between 1 and 80),
  amount numeric(12,2) not null check (amount >= 0 and amount <= 10000000),
  stage text not null check (stage in ('Prospect', 'Qualified', 'Contacted', 'Meeting', 'Proposal', 'Negotiation', 'Agreement', 'Campaign', 'Renewal')),
  collected numeric(12,2) not null default 0 check (collected >= 0),
  athlete_approval text not null default 'pending' check (athlete_approval in ('pending', 'approved', 'changes-requested')),
  owner text not null default 'WRTH partnerships',
  next_action text not null default '',
  follow_up text not null default '',
  tasks jsonb not null default '[]'::jsonb check (jsonb_typeof(tasks) = 'array' and jsonb_array_length(tasks) <= 50),
  sort_order integer not null default 0,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_deals_collected_within_amount check (collected <= amount)
);

create index demo_deals_athlete_idx on public.demo_deals(athlete_slug);

alter table public.demo_deals enable row level security;
create policy "public can read demo deals" on public.demo_deals for select using (is_demo = true);

-- Browser writes go through this narrow RPC (same pattern as create_demo_donation).
-- It can only create or change demo rows; it never touches donations or campaigns.
create or replace function public.save_demo_deal(p_deal jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.demo_deals (
    id, sponsor, athlete_slug, package_name, amount, stage, collected, athlete_approval,
    owner, next_action, follow_up, tasks, sort_order, is_demo, updated_at
  ) values (
    p_deal->>'id',
    p_deal->>'sponsor',
    p_deal->>'athleteSlug',
    p_deal->>'packageName',
    (p_deal->>'amount')::numeric,
    p_deal->>'stage',
    coalesce((p_deal->>'collected')::numeric, 0),
    coalesce(p_deal->>'athleteApproval', 'pending'),
    coalesce(p_deal->>'owner', 'WRTH partnerships'),
    coalesce(p_deal->>'nextAction', ''),
    coalesce(p_deal->>'followUp', ''),
    coalesce(p_deal->'tasks', '[]'::jsonb),
    coalesce((p_deal->>'sortOrder')::integer, 0),
    true,
    now()
  )
  on conflict (id) do update set
    sponsor = excluded.sponsor,
    athlete_slug = excluded.athlete_slug,
    package_name = excluded.package_name,
    amount = excluded.amount,
    stage = excluded.stage,
    collected = excluded.collected,
    athlete_approval = excluded.athlete_approval,
    owner = excluded.owner,
    next_action = excluded.next_action,
    follow_up = excluded.follow_up,
    tasks = excluded.tasks,
    updated_at = now()
  where public.demo_deals.is_demo = true;
end;
$$;

revoke all on function public.save_demo_deal(jsonb) from public;
grant execute on function public.save_demo_deal(jsonb) to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'demo_deals') then
    alter publication supabase_realtime add table public.demo_deals;
  end if;
end;
$$;
