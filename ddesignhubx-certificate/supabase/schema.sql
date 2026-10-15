-- Run in Supabase SQL Editor. This table is accessible only through server-side service role.
create extension if not exists pgcrypto;
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  verification_token uuid not null unique default gen_random_uuid(),
  student_name text not null,
  course text not null,
  duration text not null,
  mentor text not null default 'Dinesh V',
  issue_date date not null,
  completion_date date,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now()
);
alter table public.certificates enable row level security;
-- No anon/authenticated RLS policies: only service-role server endpoints can read/write.
create index if not exists cert_token_idx on public.certificates (verification_token);
