-- supabase/migrations/0001_schema.sql

-- Extensions
create extension if not exists "uuid-ossp";

-- Users Table (Synced with auth.users)
create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  role text not null check (role in ('candidate', 'recruiter', 'admin')),
  created_at timestamptz not null default now()
);

-- Agent Responses Table (Cache)
create table if not exists public.agent_responses (
  id uuid primary key default gen_random_uuid(),
  agent_type text not null,
  input_hash text not null,
  input_payload jsonb not null,
  response jsonb not null,
  created_at timestamptz not null default now(),
  unique (agent_type, input_hash)
);
