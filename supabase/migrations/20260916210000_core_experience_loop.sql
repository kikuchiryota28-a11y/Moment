alter table public.journeys
  add column if not exists experience_note text,
  add column if not exists experience_media_url text,
  add column if not exists experience_location_name text,
  add column if not exists experience_recorded_at timestamptz;

alter table public.journeys
  add constraint journeys_experience_note_length
  check (experience_note is null or char_length(experience_note) <= 1000);

alter table public.journeys
  add constraint journeys_experience_location_length
  check (experience_location_name is null or char_length(experience_location_name) <= 200);

create index if not exists journeys_user_status_idx
  on public.journeys (user_id, status);

create index if not exists journeys_experience_location_idx
  on public.journeys (user_id, experience_location_name)
  where status = 'COMPLETED' and experience_location_name is not null;

create or replace function public.get_user_experience_stats(target_user_id uuid)
returns table (experience_count bigint, place_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*) filter (where j.status = 'COMPLETED')::bigint as experience_count,
    count(distinct nullif(trim(j.experience_location_name), ''))::bigint as place_count
  from public.journeys j
  where j.user_id = target_user_id
    and j.status = 'COMPLETED';
$$;
