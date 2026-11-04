-- Fictional-demo records for the Athlete Intelligence and Management Portal.
-- Production use requires athlete consent, authentication, authorization, and compliance review.

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  title text not null,
  asset_type text not null check (asset_type in ('story_video', 'social_post', 'reel', 'offer_card', 'proposal', 'media_kit')),
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'approved', 'published')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  content_asset_id uuid references public.content_assets(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  requested_by text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_note text,
  decided_at timestamptz,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.opportunity_tasks (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  title text not null,
  owner_role text not null check (owner_role in ('athlete', 'wrth_manager', 'creative_reviewer')),
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'awaiting_approval', 'done')),
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_role text not null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  detail text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now()
);

create trigger content_assets_set_updated_at before update on public.content_assets for each row execute function public.set_updated_at();
create trigger opportunity_tasks_set_updated_at before update on public.opportunity_tasks for each row execute function public.set_updated_at();

alter table public.content_assets enable row level security;
alter table public.approval_requests enable row level security;
alter table public.opportunity_tasks enable row level security;
alter table public.audit_events enable row level security;

create policy "public can read demo content assets" on public.content_assets for select using (is_demo = true);
create policy "public can read demo approval requests" on public.approval_requests for select using (is_demo = true);
create policy "public can read demo opportunity tasks" on public.opportunity_tasks for select using (is_demo = true);
create policy "public can read demo audit events" on public.audit_events for select using (is_demo = true);
