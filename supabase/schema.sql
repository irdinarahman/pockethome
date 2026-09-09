-- Run this in Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  is_done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  event_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  amount numeric(10, 2) not null,
  note text,
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  stat_date date not null default current_date,
  steps integer not null default 0,
  unique (user_id, stat_date)
);

create table if not exists public.self_care_streak (
  user_id uuid primary key references auth.users not null,
  current_streak integer not null default 0,
  last_checkin_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.upcoming_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  target_date date not null,
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high')),
  created_at timestamptz not null default now()
);

create table if not exists public.widget_settings (
  user_id uuid primary key references auth.users not null,
  show_greeting boolean not null default true,
  show_tasks boolean not null default true,
  show_events boolean not null default true,
  show_spending boolean not null default true,
  show_steps boolean not null default true,
  show_streak boolean not null default true,
  widget_size text not null default 'medium' check (widget_size in ('small', 'medium', 'large')),
  upcoming_limit integer not null default 3,
  updated_at timestamptz not null default now()
);

-- Grant table-level access to the authenticated role.
-- Anonymous sign-ins still get the "authenticated" role (with an
-- is_anonymous flag), so this is required for them too — RLS policies
-- alone aren't enough if the role has no grant on the table.
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.daily_stats to authenticated;
grant select, insert, update, delete on public.self_care_streak to authenticated;
grant select, insert, update, delete on public.upcoming_items to authenticated;
grant select, insert, update, delete on public.widget_settings to authenticated;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.expenses enable row level security;
alter table public.daily_stats enable row level security;
alter table public.self_care_streak enable row level security;
alter table public.upcoming_items enable row level security;

-- Policy: users can only see/edit their own rows
create policy "Users manage own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own events" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own daily_stats" on public.daily_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own self_care_streak" on public.self_care_streak
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own upcoming_items" on public.upcoming_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own widget_settings" on public.widget_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
