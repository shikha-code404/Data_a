-- supabase/migrations/0002_rls_policies.sql

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.agent_responses enable row level security;

-- RLS Policies for public.users
create policy "Allow public read on users"
  on public.users
  for select
  using (true);

create policy "Allow user self-insert profile"
  on public.users
  for insert
  with check (auth.uid() = id);

create policy "Allow user self-update profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policies for public.agent_responses
-- Service role client bypasses RLS, but for general authenticated queries:
create policy "Allow authenticated reads on agent_responses"
  on public.agent_responses
  for select
  to authenticated
  using (true);

create policy "Allow service_role full control"
  on public.agent_responses
  for all
  using (true);
