-- ════════════════════════════════════════════════════
--  WeekFlow — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  name          text not null default 'New User',
  email         text,
  plan          text not null default 'Free',
  avatar_color  text not null default '#6467f2',
  dark_mode     boolean not null default false,
  onboarding    jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ── tasks ─────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  category    text not null default 'Work',
  day         text not null,
  time        text not null default '09:00',
  duration    integer not null default 60,
  priority    text not null default 'medium',
  completed   boolean not null default false,
  recurring   boolean not null default false,
  notes       text default '',
  color       text default null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage own tasks"
  on public.tasks for all using (auth.uid() = user_id);

-- ── notes ─────────────────────────────────────────────
create table if not exists public.notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text default '',
  content     text default '',
  type        text not null default 'note',
  color       text not null default 'default',
  pinned      boolean not null default false,
  todos       jsonb default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users can manage own notes"
  on public.notes for all using (auth.uid() = user_id);

-- ── pomodoro_sessions ─────────────────────────────────
create table if not exists public.pomodoro_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  task_title  text default 'Free focus',
  duration    integer not null default 25,
  completed_at timestamptz not null default now()
);

alter table public.pomodoro_sessions enable row level security;

create policy "Users can manage own sessions"
  on public.pomodoro_sessions for all using (auth.uid() = user_id);

-- ── Auto-create profile on signup ─────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Updated_at trigger ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger tasks_updated_at  before update on public.tasks  for each row execute procedure set_updated_at();
create trigger notes_updated_at  before update on public.notes  for each row execute procedure set_updated_at();
create trigger profile_updated_at before update on public.profiles for each row execute procedure set_updated_at();
