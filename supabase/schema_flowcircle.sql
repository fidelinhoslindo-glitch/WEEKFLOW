-- ═══════════════════════════════════════════════════════════════════════════════
-- FlowCircle — Schema with proper RLS (membership-based access)
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── circles ──────────────────────────────────────────────
create table if not exists public.circles (
  id          text primary key,
  owner_id    uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  mode        text default 'friends',
  color       text default '#6467f2',
  created_at  timestamptz default now()
);

alter table public.circles enable row level security;

-- Owner can do everything
drop policy if exists "own circles" on public.circles;
create policy "circles_owner_all"
  on public.circles for all using (auth.uid() = owner_id);

-- Members can read circles they belong to
drop policy if exists "read circles" on public.circles;
create policy "circles_member_read"
  on public.circles for select using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = id and cm.user_id = auth.uid()
    )
  );


-- ── circle_members ───────────────────────────────────────
create table if not exists public.circle_members (
  id          bigserial primary key,
  circle_id   text references public.circles(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade,
  name        text,
  role        text default 'member',
  avatar      text,
  status      text default 'offline',
  joined_at   timestamptz default now()
);

alter table public.circle_members enable row level security;

-- Members can read other members in the same circle
drop policy if exists "read circle members" on public.circle_members;
create policy "cm_member_read"
  on public.circle_members for select using (
    exists (
      select 1 from public.circle_members me
      where me.circle_id = public.circle_members.circle_id and me.user_id = auth.uid()
    )
  );

-- Authenticated users can insert themselves as member (join)
drop policy if exists "insert circle members" on public.circle_members;
create policy "cm_self_insert"
  on public.circle_members for insert with check (
    auth.uid() = user_id
  );

-- Members can update their own row (status, avatar, etc)
create policy "cm_self_update"
  on public.circle_members for update using (
    auth.uid() = user_id
  );

-- Circle owner can delete any member; members can delete themselves (leave)
create policy "cm_delete"
  on public.circle_members for delete using (
    auth.uid() = user_id
    or exists (
      select 1 from public.circles c
      where c.id = public.circle_members.circle_id and c.owner_id = auth.uid()
    )
  );


-- ── circle_events ────────────────────────────────────────
create table if not exists public.circle_events (
  id          text primary key,
  circle_id   text references public.circles(id) on delete cascade not null,
  title       text not null,
  date        text,
  time        text default '18:00',
  duration    int default 60,
  color       text default '#6467f2',
  emoji       text default '📅',
  note        text default '',
  image       text,
  pinned      boolean default false,
  shared      boolean default true,
  created_by  text,
  created_at  timestamptz default now()
);

alter table public.circle_events enable row level security;

-- Only members can read events
drop policy if exists "read circle events" on public.circle_events;
create policy "ce_member_read"
  on public.circle_events for select using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_events.circle_id and cm.user_id = auth.uid()
    )
  );

-- Only members can insert events
drop policy if exists "insert circle events" on public.circle_events;
create policy "ce_member_insert"
  on public.circle_events for insert with check (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_events.circle_id and cm.user_id = auth.uid()
    )
  );

-- Only members can delete events
drop policy if exists "delete circle events" on public.circle_events;
create policy "ce_member_delete"
  on public.circle_events for delete using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_events.circle_id and cm.user_id = auth.uid()
    )
  );


-- ── circle_invites ───────────────────────────────────────
create table if not exists public.circle_invites (
  id            bigserial primary key,
  circle_id     text not null,
  circle_name   text not null,
  circle_mode   text,
  inviter_name  text,
  email         text not null,
  status        text default 'pending',
  created_at    timestamptz default now()
);

alter table public.circle_invites enable row level security;

-- Invitee can read their own invites (by email matching their auth email)
drop policy if exists "read invites by email" on public.circle_invites;
create policy "invites_recipient_read"
  on public.circle_invites for select using (
    email = (select email from auth.users where id = auth.uid())
  );

-- Circle members can also read invites for their circle (to see pending invites)
create policy "invites_circle_member_read"
  on public.circle_invites for select using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_invites.circle_id and cm.user_id = auth.uid()
    )
  );

-- Any authenticated user who is a circle member can create invites for that circle
drop policy if exists "insert invites" on public.circle_invites;
create policy "invites_member_insert"
  on public.circle_invites for insert with check (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_invites.circle_id and cm.user_id = auth.uid()
    )
  );

-- Invitee can update their own invite (accept/decline)
drop policy if exists "update invites" on public.circle_invites;
create policy "invites_recipient_update"
  on public.circle_invites for update using (
    email = (select email from auth.users where id = auth.uid())
  );


-- ── circle_poll_votes ────────────────────────────────────
create table if not exists public.circle_poll_votes (
  id          bigserial primary key,
  circle_id   text not null,
  user_id     uuid references auth.users(id),
  option_key  text,
  created_at  timestamptz default now()
);

alter table public.circle_poll_votes enable row level security;

create policy "votes_member_read"
  on public.circle_poll_votes for select using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = public.circle_poll_votes.circle_id and cm.user_id = auth.uid()
    )
  );

create policy "votes_self_insert"
  on public.circle_poll_votes for insert with check (
    auth.uid() = user_id
  );


-- ── Enable realtime ──────────────────────────────────────
alter publication supabase_realtime add table public.circles;
alter publication supabase_realtime add table public.circle_members;
alter publication supabase_realtime add table public.circle_events;
