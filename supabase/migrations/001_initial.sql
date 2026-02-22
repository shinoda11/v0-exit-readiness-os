-- YOHACK Phase 2: Initial Supabase Migration
-- Tables: fitgate_responses, pass_subscriptions, prep_mode_subscribers, user_profiles

-- =============================================================
-- 1. fitgate_responses — FitGate 回答データ + 判定結果
-- =============================================================
create table if not exists public.fitgate_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  answers jsonb not null,
  judgment text not null check (judgment in ('ready', 'prep')),
  prep_bucket text check (prep_bucket in ('near', 'notyet')),
  invitation_token text,
  created_at timestamptz default now() not null
);

-- Index for user lookups
create index if not exists idx_fitgate_responses_user_id on public.fitgate_responses(user_id);
create index if not exists idx_fitgate_responses_email on public.fitgate_responses(email);

-- RLS
alter table public.fitgate_responses enable row level security;

-- Allow insert from anyone (anon or authenticated)
create policy "Anyone can insert fitgate responses"
  on public.fitgate_responses for insert
  with check (true);

-- Users can read their own responses
create policy "Users can read own fitgate responses"
  on public.fitgate_responses for select
  using (auth.uid() = user_id);

-- =============================================================
-- 2. pass_subscriptions — Pass課金（Phase 3 Stripe連携用）
-- =============================================================
create table if not exists public.pass_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  started_at timestamptz not null,
  expires_at timestamptz not null,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz default now() not null
);

create index if not exists idx_pass_subscriptions_user_id on public.pass_subscriptions(user_id);
create index if not exists idx_pass_subscriptions_status on public.pass_subscriptions(status);

-- RLS
alter table public.pass_subscriptions enable row level security;

-- Users can read their own subscriptions
create policy "Users can read own subscriptions"
  on public.pass_subscriptions for select
  using (auth.uid() = user_id);

-- Only server (service_role) can insert/update subscriptions
-- No insert/update policy for anon/authenticated — handled via service_role in API routes

-- =============================================================
-- 3. prep_mode_subscribers — Prep Mode メール登録
-- =============================================================
create table if not exists public.prep_mode_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  judgment text not null check (judgment in ('ready', 'prep')),
  prep_bucket text check (prep_bucket in ('near', 'notyet')),
  fitgate_answers jsonb,
  subscribed_at timestamptz default now() not null,
  unsubscribed_at timestamptz
);

create unique index if not exists idx_prep_mode_subscribers_email on public.prep_mode_subscribers(email);

-- RLS
alter table public.prep_mode_subscribers enable row level security;

-- Allow insert from anyone (FitGate is pre-auth)
create policy "Anyone can insert prep subscribers"
  on public.prep_mode_subscribers for insert
  with check (true);

-- Allow upsert (update existing email with new data)
create policy "Anyone can update own prep subscription by email"
  on public.prep_mode_subscribers for update
  using (true)
  with check (true);

-- =============================================================
-- 4. user_profiles — ユーザープロファイル + シナリオ（localStorage移行先）
-- =============================================================
create table if not exists public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  profile_data jsonb not null default '{}'::jsonb,
  scenarios_data jsonb not null default '[]'::jsonb,
  branch_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create unique index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);

-- RLS
alter table public.user_profiles enable row level security;

-- Users can CRUD their own profile
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);
