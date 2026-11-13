-- Run this in Supabase SQL Editor after creating your project.
create table if not exists public.love_reactions (
  id bigint generated always as identity primary key,
  event_name text not null,
  detail text,
  page text,
  created_at timestamptz not null default now()
);

alter table public.love_reactions enable row level security;

-- Visitors who opted in can add a small event. Anonymous visitors cannot read events.
create policy "Visitors can submit reactions"
on public.love_reactions for insert
to anon
with check (
  char_length(event_name) <= 80
  and (detail is null or char_length(detail) <= 180)
  and (page is null or page = 'vasu-love')
);

-- After creating your owner account in Supabase Authentication, replace OWNER_USER_UUID
-- with that account's Auth user UUID (no angle brackets), then run this policy.
create policy "Only page owner can read reactions"
on public.love_reactions for select
to authenticated
using (auth.uid() = 'OWNER_USER_UUID'::uuid);

grant insert on public.love_reactions to anon;
grant select on public.love_reactions to authenticated;
