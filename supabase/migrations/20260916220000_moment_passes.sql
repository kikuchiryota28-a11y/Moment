create table if not exists public.moment_passes (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(moment_id, sender_id, recipient_id),
  check (sender_id <> recipient_id)
);

create index if not exists moment_passes_recipient_created_idx
  on public.moment_passes(recipient_id, created_at desc);
create index if not exists moment_passes_sender_created_idx
  on public.moment_passes(sender_id, created_at desc);

alter table public.moment_passes enable row level security;

create policy "pass participants can read passes"
  on public.moment_passes for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "users can pass experienced moments"
  on public.moment_passes for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.moments m
      where m.id = moment_id
        and m.user_id <> auth.uid()
    )
    and exists (
      select 1 from public.journeys j
      where j.user_id = auth.uid()
        and j.moment_id = moment_passes.moment_id
        and j.status = 'COMPLETED'
        and j.experience_recorded_at is not null
    )
  );
