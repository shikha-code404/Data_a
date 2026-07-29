-- supabase/migrations/0009_candidate_job_embeddings_tables.sql

create extension if not exists vector;

-- Candidate Embeddings Table
create table if not exists public.candidate_embeddings (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

-- Job Embeddings Table
create table if not exists public.job_embeddings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  embedding vector(384) not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.candidate_embeddings enable row level security;
alter table public.job_embeddings enable row level security;

create policy "Allow public read on candidate_embeddings"
  on public.candidate_embeddings for select using (true);
create policy "Allow service_role full control on candidate_embeddings"
  on public.candidate_embeddings for all using (true);

create policy "Allow public read on job_embeddings"
  on public.job_embeddings for select using (true);
create policy "Allow service_role full control on job_embeddings"
  on public.job_embeddings for all using (true);

-- Similarity Indexes (HNSW for vector cosine ops)
create index if not exists candidate_embeddings_hnsw_idx 
  on public.candidate_embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists job_embeddings_hnsw_idx 
  on public.job_embeddings using hnsw (embedding vector_cosine_ops);
