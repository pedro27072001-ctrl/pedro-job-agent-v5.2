-- Pedro Job Agent V5 - Supabase
-- Execute no SQL Editor do projeto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  profile_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text default '',
  location text default '',
  url text default '',
  description text not null default '',
  source text default '',
  match_score integer,
  ai_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'REVISAR' check (status in ('REVISAR','APROVADA','CANDIDATADA','ENTREVISTA','OFERTA','RECUSADA','ARQUIVADA')),
  note text default '',
  materials jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, job_id)
);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists jobs_self on public.jobs;
create policy jobs_self on public.jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists applications_self on public.applications;
create policy applications_self on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.applications to authenticated;

-- automatic schema cache refresh is handled by Supabase; if the tables do not appear in the Data API immediately, reload the dashboard.
