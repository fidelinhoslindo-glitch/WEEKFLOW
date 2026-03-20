-- ═══════════════════════════════════════════════════════════════════════════════
-- FlowCircle: Chama, Escudos e FlowStreak
-- ═══════════════════════════════════════════════════════════════════════════════

-- Chama do círculo (streak coletivo)
create table if not exists public.circle_flame (
  id bigserial primary key,
  circle_id text references public.circles(id) on delete cascade,
  streak_days int default 0,
  last_active_date date,
  updated_at timestamptz default now()
);
alter table public.circle_flame enable row level security;
create policy "circle_flame_all" on public.circle_flame for all using (true);

-- Escudos dos membros
create table if not exists public.member_shields (
  id bigserial primary key,
  circle_id text not null,
  owner_id uuid references auth.users(id),
  count int default 0,
  expires_at timestamptz,
  updated_at timestamptz default now()
);
alter table public.member_shields enable row level security;
create policy "member_shields_all" on public.member_shields for all using (true);

-- FlowStreak bilateral
create table if not exists public.flow_streaks (
  id bigserial primary key,
  circle_id text not null,
  user_a uuid references auth.users(id),
  user_b uuid references auth.users(id),
  streak_days int default 0,
  last_shared_date date,
  updated_at timestamptz default now(),
  unique(circle_id, user_a, user_b)
);
alter table public.flow_streaks enable row level security;
create policy "flow_streaks_all" on public.flow_streaks for all using (true);

-- Recursos compartilhados do círculo
create table if not exists public.circle_resources (
  id bigserial primary key,
  circle_id text not null,
  name text not null,
  icon text default '📦',
  created_at timestamptz default now()
);
alter table public.circle_resources enable row level security;
create policy "circle_resources_all" on public.circle_resources for all using (true);

-- Ativar realtime
alter publication supabase_realtime add table public.circle_flame;
alter publication supabase_realtime add table public.member_shields;
alter publication supabase_realtime add table public.flow_streaks;
alter publication supabase_realtime add table public.circle_resources;
