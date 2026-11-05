-- Referral rewards are supporter benefits; they never affect gameplay scores or ranks.
create table public.fan_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'signed_up' check (status in ('signed_up', 'contributed')),
  points integer not null default 100,
  created_at timestamptz not null default now(),
  contributed_at timestamptz,
  unique(referrer_id, referee_id),
  check(referrer_id <> referee_id)
);

alter table public.fan_referrals enable row level security;
create policy "fans can read their referral records" on public.fan_referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);
create policy "new fans can register a referral" on public.fan_referrals
  for insert with check (auth.uid() = referee_id);
create policy "referred fans can record first contribution" on public.fan_referrals
  for update using (auth.uid() = referee_id)
  with check (auth.uid() = referee_id);
