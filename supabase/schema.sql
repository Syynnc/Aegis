-- Aegis secure chat schema
-- Run this in your Supabase SQL editor

create extension if not exists "pgcrypto";

-- Users table — id must match auth.uid()
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  public_key text not null,
  created_at timestamptz default now()
);

-- Chat rooms table
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  encrypted_message text not null,
  iv text not null,
  hash text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists messages_room_id_idx on public.messages(room_id);
create index if not exists messages_created_at_idx on public.messages(created_at);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.messages enable row level security;

-- Users RLS
-- Anyone logged in can read user profiles (needed for key exchange)
create policy "Authenticated users can read profiles"
  on public.users for select
  to authenticated
  using (true);

-- Users can only insert their own profile row
create policy "Users insert own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- Users can only update their own public key
create policy "Users update own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id);

-- Chat rooms RLS
create policy "Authenticated users can read rooms"
  on public.chat_rooms for select
  to authenticated
  using (true);

create policy "Authenticated users can create rooms"
  on public.chat_rooms for insert
  to authenticated
  with check (true);

-- Messages RLS
create policy "Authenticated users can read messages"
  on public.messages for select
  to authenticated
  using (true);

-- Users can only send messages as themselves
create policy "Users insert own messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- Enable Realtime on messages and users tables
-- Supabase dashboard: Database > Replication > enable for messages and users tables
