-- MOMENT V3 core experience model.
-- Legacy user-created Moments/social tables remain intact for safe migration; V3 UI no longer depends on them.

create type public.daily_moment_status as enum ('PREPARED','FIRST_MOVER','LIVE','ENDING','ENDED','ARCHIVE');
create type public.result_type as enum ('photo','video','text','choice','combination');

create table if not exists public.daily_moments (
  id uuid primary key default gen_random_uuid(),
  moment_date date not null unique,
  prompt text not null check (char_length(prompt) between 5 and 500),
  status public.daily_moment_status not null default 'PREPARED',
  first_mover_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > created_at)
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  daily_moment_id uuid not null references public.daily_moments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  result_type public.result_type not null,
  text_content text,
  choice_value text,
  why text,
  country_code text check (country_code is null or char_length(country_code) between 2 and 3),
  city text check (city is null or char_length(city) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(daily_moment_id, user_id),
  check (text_content is null or char_length(text_content) <= 2000),
  check (why is null or char_length(why) <= 500)
);

create table if not exists public.result_media (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.results(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image','video')),
  created_at timestamptz not null default now()
);

create index if not exists daily_moments_date_idx on public.daily_moments(moment_date desc);
create index if not exists daily_moments_status_idx on public.daily_moments(status);
create index if not exists results_daily_moment_idx on public.results(daily_moment_id, created_at);
create index if not exists results_user_idx on public.results(user_id, created_at desc);
create index if not exists result_media_result_idx on public.result_media(result_id);

alter table public.daily_moments enable row level security;
alter table public.results enable row level security;
alter table public.result_media enable row level security;

create policy "daily moments readable by everyone" on public.daily_moments for select using (true);
create policy "authenticated users can start prepared moment" on public.daily_moments for update to authenticated
  using (status = 'PREPARED' and first_mover_id is null)
  with check (status in ('FIRST_MOVER','LIVE') and first_mover_id = auth.uid());

create policy "results readable by everyone" on public.results for select using (true);
create policy "users create own results" on public.results for insert to authenticated with check (auth.uid() = user_id);
create policy "users update own results" on public.results for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own results" on public.results for delete to authenticated using (auth.uid() = user_id);

create policy "result media readable by everyone" on public.result_media for select using (true);
create policy "owners create result media" on public.result_media for insert to authenticated
  with check (exists (select 1 from public.results r where r.id = result_id and r.user_id = auth.uid()));
create policy "owners delete result media" on public.result_media for delete to authenticated
  using (exists (select 1 from public.results r where r.id = result_id and r.user_id = auth.uid()));

create or replace function public.set_daily_moment_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists daily_moments_updated_at on public.daily_moments;
create trigger daily_moments_updated_at before update on public.daily_moments for each row execute function public.set_daily_moment_updated_at();

drop trigger if exists results_updated_at on public.results;
create trigger results_updated_at before update on public.results for each row execute function public.set_daily_moment_updated_at();

-- Seed today's global Moment so the first authenticated user can start it.
insert into public.daily_moments (moment_date, prompt, status, ends_at)
values (
  current_date,
  'Find one small thing around you that you normally walk past. Bring it back as your answer.',
  'PREPARED',
  ((current_date + 1)::timestamptz)
)
on conflict (moment_date) do nothing;
