-- Preserve completed Journey snapshots when a creator deletes a Moment.
alter table public.journeys drop constraint if exists journeys_moment_id_fkey;
alter table public.journeys alter column moment_id drop not null;
alter table public.journeys add constraint journeys_moment_id_fkey
  foreign key (moment_id) references public.moments(id) on delete set null;

-- Public aggregate used for lightweight social proof without exposing other users' Journey rows.
create or replace function public.get_moment_experience_count(target_moment_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.journeys
  where moment_id = target_moment_id
    and status = 'COMPLETED'
    and experience_recorded_at is not null;
$$;

revoke all on function public.get_moment_experience_count(uuid) from public;
grant execute on function public.get_moment_experience_count(uuid) to anon, authenticated;
