-- MOMENT V3: Journey tracking for daily_moments
-- Connects the action loop: PLANNED -> TRYING -> COMPLETED

-- Add daily_moment_id to journeys table to support v3 daily moments
alter table public.journeys
  add column if not exists daily_moment_id uuid references public.daily_moments(id) on delete cascade,
  add column if not exists phase text check (phase in ('planned', 'trying', 'completed'));

-- Make moment_id nullable since we now support both moment types
alter table public.journeys
  alter column moment_id drop not null;

-- Add constraint: exactly one of moment_id or daily_moment_id must be set
alter table public.journeys
  add constraint journeys_one_moment_check
  check (
    (moment_id is not null and daily_moment_id is null) or
    (moment_id is null and daily_moment_id is not null)
  );

-- Update unique constraint to support both moment types
alter table public.journeys
  drop constraint if exists journeys_user_id_moment_id_key;

create unique index if not exists journeys_user_daily_moment_unique
  on public.journeys (user_id, daily_moment_id)
  where daily_moment_id is not null;

-- Index for querying v3 journeys
create index if not exists journeys_user_daily_moment_idx
  on public.journeys (user_id, daily_moment_id)
  where daily_moment_id is not null;

create index if not exists journeys_user_phase_idx
  on public.journeys (user_id, phase)
  where daily_moment_id is not null;

-- Function to create/start a v3 journey when user enters a moment
create or replace function public.start_v3_journey(p_daily_moment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_journey_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Check if journey already exists
  select id into v_journey_id
  from public.journeys
  where user_id = v_user_id and daily_moment_id = p_daily_moment_id;

  if v_journey_id is null then
    insert into public.journeys (user_id, daily_moment_id, status, phase, planned_at, started_at)
    values (v_user_id, p_daily_moment_id, 'PLANNED', 'trying', now(), now())
    returning id into v_journey_id;
  else
    update public.journeys
    set phase = 'trying', started_at = coalesce(started_at, now()), updated_at = now()
    where id = v_journey_id;
  end if;

  return v_journey_id;
end;
$$;

-- Function to complete a v3 journey when user submits result
create or replace function public.complete_v3_journey(p_daily_moment_id uuid, p_experience_note text, p_experience_media_url text, p_experience_location_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.journeys
  set status = 'COMPLETED',
      phase = 'completed',
      completed_at = now(),
      experience_note = p_experience_note,
      experience_media_url = p_experience_media_url,
      experience_location_name = p_experience_location_name,
      experience_recorded_at = now(),
      updated_at = now()
  where user_id = v_user_id and daily_moment_id = p_daily_moment_id;
end;
$$;

-- Function to get user's v3 journey for a daily moment
create or replace function public.get_v3_journey(p_daily_moment_id uuid)
returns table (
  id uuid,
  status public.journey_status,
  phase text,
  planned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  experience_note text,
  experience_media_url text,
  experience_location_name text,
  experience_recorded_at timestamptz
)
language sql
security invoker
set search_path = public
as $$
  select j.id, j.status, j.phase, j.planned_at, j.started_at, j.completed_at,
         j.experience_note, j.experience_media_url, j.experience_location_name, j.experience_recorded_at
  from public.journeys j
  where j.user_id = auth.uid() and j.daily_moment_id = p_daily_moment_id;
$$;

-- RLS policies for v3 journeys
create policy "users read own v3 journeys" on public.journeys for select to authenticated
  using (auth.uid() = user_id and daily_moment_id is not null);

create policy "users create own v3 journeys" on public.journeys for insert to authenticated
  with check (auth.uid() = user_id and daily_moment_id is not null);

create policy "users update own v3 journeys" on public.journeys for update to authenticated
  using (auth.uid() = user_id and daily_moment_id is not null)
  with check (auth.uid() = user_id and daily_moment_id is not null);