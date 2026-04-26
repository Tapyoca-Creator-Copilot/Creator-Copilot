-- Projects table for Creator Copilot
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null,
  budget_ceiling numeric(12,2) not null check (budget_ceiling > 0),
  currency text not null,
  project_type text not null check (project_type in ('Music', 'Film')),
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_archived boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint projects_end_after_start check (end_date >= start_date)
);

alter table public.projects
  add column if not exists is_archived boolean not null default false;

alter table public.projects
  add column if not exists archived_at timestamptz;

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

alter table public.projects enable row level security;

-- Allow authenticated users to read only their own projects
drop policy if exists "Users can select own projects" on public.projects;

create policy "Users can select own projects"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);

-- Allow authenticated users to insert their own projects
drop policy if exists "Users can insert own projects" on public.projects;

create policy "Users can insert own projects"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);

-- Optional: allow owners to update/delete their projects later
drop policy if exists "Users can update own projects" on public.projects;

create policy "Users can update own projects"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;

create policy "Users can delete own projects"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);