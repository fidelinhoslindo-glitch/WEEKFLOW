-- ── Plan columns for 3-tier system (Free / Pro / Business) ──────────────────

alter table public.profiles
  add column if not exists plan text default 'Free',
  add column if not exists plan_expires_at timestamptz,
  add column if not exists plan_billing text default 'monthly';

-- Garantir que plan aceita os 3 valores
alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('Free','Pro','Business'));
