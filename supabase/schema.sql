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

-- Private chat rooms — one room per ordered pair of users.
-- user1_id is always the smaller UUID to enforce uniqueness regardless of
-- which participant creates the room.
create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  constraint chat_rooms_no_self_chat check (user1_id <> user2_id),
  constraint chat_rooms_ordered       check (user1_id < user2_id),
  unique (user1_id, user2_id)
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
create index if not exists chat_rooms_user1_idx on public.chat_rooms(user1_id);
create index if not exists chat_rooms_user2_idx on public.chat_rooms(user2_id);

-- Required for filtered postgres_changes subscriptions
alter table public.messages replica identity full;
alter table public.users replica identity full;
alter table public.chat_rooms replica identity full;

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.messages enable row level security;

-- -----------------------------------------------------------------------
-- Users RLS
-- -----------------------------------------------------------------------
create policy "Authenticated users can read profiles"
  on public.users for select
  to authenticated
  using (true);

create policy "Users insert own profile"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.users for update
  to authenticated
  using (auth.uid() = id);

-- -----------------------------------------------------------------------
-- Chat rooms RLS — only the two participants can see or create their room
-- -----------------------------------------------------------------------
create policy "Members can read their rooms"
  on public.chat_rooms for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Members can create their rooms"
  on public.chat_rooms for insert
  to authenticated
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- -----------------------------------------------------------------------
-- Messages RLS — only room members can read or write messages
-- -----------------------------------------------------------------------
create policy "Room members can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chat_rooms
      where id = room_id
        and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

create policy "Users insert own messages in their rooms"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chat_rooms
      where id = room_id
        and (user1_id = auth.uid() or user2_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.chat_rooms;
