alter table public.moments add column if not exists experience_note text;

alter table public.journeys add column if not exists moment_title_snapshot text;
alter table public.journeys add column if not exists moment_category_snapshot text;
alter table public.journeys add column if not exists moment_media_url_snapshot text;

update public.journeys j
set moment_title_snapshot = m.title,
    moment_category_snapshot = m.category,
    moment_media_url_snapshot = (
      select mm.media_url
      from public.moment_media mm
      where mm.moment_id = m.id
      order by mm.sort_order asc, mm.created_at asc
      limit 1
    )
from public.moments m
where j.moment_id = m.id
  and j.moment_title_snapshot is null;

alter table public.journeys alter column moment_id drop not null;
alter table public.journeys drop constraint if exists journeys_pkey;
alter table public.journeys drop constraint if exists journeys_moment_id_fkey;
alter table public.journeys add constraint journeys_moment_id_fkey foreign key (moment_id) references public.moments(id) on delete set null;
create unique index if not exists journeys_user_moment_unique_idx on public.journeys(user_id, moment_id) where moment_id is not null;

alter table public.moments drop constraint if exists moments_experience_note_length;
alter table public.moments add constraint moments_experience_note_length check (experience_note is null or char_length(experience_note) <= 1000);
