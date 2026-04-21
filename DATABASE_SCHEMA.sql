-- Supabase Database Schema
create table reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  input_text text,
  ai_output text,
  created_at timestamp default now()
);

alter table reports enable row level security;

create policy "user own"
on reports for select
using (auth.uid() = user_id);

create policy "insert own"
on reports for insert
with check (auth.uid() = user_id);
