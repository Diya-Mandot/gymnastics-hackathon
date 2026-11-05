-- Real Supabase Auth profiles for Rock the Arena. Staff is assigned only by an authorized database admin.
create type public.app_role as enum ('fan', 'business', 'athlete', 'staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text not null default '',
  role public.app_role not null default 'fan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles read own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles update own name" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'fan');
begin
  insert into public.profiles (id, email, first_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'first_name', ''), 30),
    case when requested_role in ('fan', 'business', 'athlete') then requested_role::public.app_role else 'fan'::public.app_role end
  );
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_profile();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
