-- Earnings table for Creator Copilot
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null check (amount > 0),
  source_type text not null,
  description text,
  earning_date date not null,
  contract_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists earnings_user_id_idx on public.earnings(user_id);
create index if not exists earnings_project_id_idx on public.earnings(project_id);
create index if not exists earnings_earning_date_idx on public.earnings(earning_date desc);
create index if not exists earnings_source_type_idx on public.earnings(source_type);

-- set_updated_at function may already exist from expenses.sql; safe to re-create
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_earnings_updated_at on public.earnings;
create trigger set_earnings_updated_at
before update on public.earnings
for each row
execute function public.set_updated_at();

alter table public.earnings enable row level security;

-- Select: users can read their own earnings
drop policy if exists "Users can select own earnings" on public.earnings;
create policy "Users can select own earnings"
on public.earnings
for select
to authenticated
using (auth.uid() = user_id);

-- Insert: user_id must match auth.uid(), and project must belong to the same user
drop policy if exists "Users can insert own earnings" on public.earnings;
create policy "Users can insert own earnings"
on public.earnings
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

-- Update: owners can update only their own earnings, and cannot move to another user's project
drop policy if exists "Users can update own earnings" on public.earnings;
create policy "Users can update own earnings"
on public.earnings
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

-- Delete: owners can delete only their own earnings
drop policy if exists "Users can delete own earnings" on public.earnings;
create policy "Users can delete own earnings"
on public.earnings
for delete
to authenticated
using (auth.uid() = user_id);
