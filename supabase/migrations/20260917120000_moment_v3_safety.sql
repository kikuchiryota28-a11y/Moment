-- V3 safety primitives: reports, blocks, and server-enforced result moderation state.
create type public.moderation_status as enum ('VISIBLE','HIDDEN','REVIEW');

alter table public.results add column if not exists moderation_status public.moderation_status not null default 'VISIBLE';
create index if not exists results_moderation_status_idx on public.results(moderation_status, daily_moment_id);

create table if not exists public.result_reports (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.results(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  unique(result_id, reporter_id)
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.result_reports enable row level security;
alter table public.user_blocks enable row level security;

create policy "users can report results" on public.result_reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy "users can read own reports" on public.result_reports for select to authenticated
  using (reporter_id = auth.uid());
create policy "users can block" on public.user_blocks for insert to authenticated
  with check (blocker_id = auth.uid());
create policy "users can read own blocks" on public.user_blocks for select to authenticated
  using (blocker_id = auth.uid());
create policy "users can unblock" on public.user_blocks for delete to authenticated
  using (blocker_id = auth.uid());

-- Public result reads must never expose hidden/review items.
drop policy if exists "results readable by everyone" on public.results;
create policy "visible results readable by everyone" on public.results for select
  using (moderation_status = 'VISIBLE');
