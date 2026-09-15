create extension if not exists pgcrypto;

do $$ begin
  create type public.journey_status as enum ('PLANNED','TRYING','COMPLETED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.moment_media_type as enum ('image','video');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  description text not null check (char_length(description) between 10 and 1000),
  why text,
  category text not null check (category in ('explore','eat','watch','move','create','social','travel')),
  location_name text,
  latitude double precision,
  longitude double precision,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  estimated_cost integer check (estimated_cost is null or estimated_cost >= 0),
  rating integer not null check (rating between 1 and 5),
  would_do_again boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moment_media (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  media_url text not null,
  media_type public.moment_media_type not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  moment_id uuid not null references public.moments(id) on delete cascade,
  status public.journey_status not null default 'PLANNED',
  planned_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, moment_id)
);

create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  moment_id uuid not null references public.moments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, moment_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  moment_id uuid not null references public.moments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists moments_created_at_idx on public.moments(created_at desc);
create index if not exists moments_category_idx on public.moments(category);
create index if not exists moments_user_id_idx on public.moments(user_id);
create index if not exists moment_media_moment_sort_idx on public.moment_media(moment_id, sort_order);
create index if not exists journeys_user_status_idx on public.journeys(user_id, status);
create index if not exists journeys_moment_idx on public.journeys(moment_id);
create index if not exists comments_moment_created_idx on public.comments(moment_id, created_at desc);
create index if not exists follows_following_idx on public.follows(following_id);

alter table public.profiles enable row level security;
alter table public.moments enable row level security;
alter table public.moment_media enable row level security;
alter table public.journeys enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

create policy "profiles readable by everyone" on public.profiles for select using (true);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "moments readable by everyone" on public.moments for select using (true);
create policy "users create own moments" on public.moments for insert with check (auth.uid() = user_id);
create policy "users update own moments" on public.moments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own moments" on public.moments for delete using (auth.uid() = user_id);

create policy "moment media readable by everyone" on public.moment_media for select using (true);
create policy "owners create moment media" on public.moment_media for insert with check (exists (select 1 from public.moments m where m.id = moment_id and m.user_id = auth.uid()));
create policy "owners update moment media" on public.moment_media for update using (exists (select 1 from public.moments m where m.id = moment_id and m.user_id = auth.uid()));
create policy "owners delete moment media" on public.moment_media for delete using (exists (select 1 from public.moments m where m.id = moment_id and m.user_id = auth.uid()));

create policy "users read own journeys" on public.journeys for select using (auth.uid() = user_id);
create policy "users create own journeys" on public.journeys for insert with check (auth.uid() = user_id);
create policy "users update own journeys" on public.journeys for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own journeys" on public.journeys for delete using (auth.uid() = user_id);

create policy "likes readable by everyone" on public.likes for select using (true);
create policy "users create own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "users delete own likes" on public.likes for delete using (auth.uid() = user_id);

create policy "comments readable by everyone" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "users update own comments" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "follows readable by everyone" on public.follows for select using (true);
create policy "users create own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "users delete own follows" on public.follows for delete using (auth.uid() = follower_id);

insert into storage.buckets (id, name, public) values ('moment-media', 'moment-media', true) on conflict (id) do nothing;
create policy "public read moment media" on storage.objects for select using (bucket_id = 'moment-media');
create policy "authenticated upload moment media" on storage.objects for insert to authenticated with check (bucket_id = 'moment-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users delete own moment media" on storage.objects for delete to authenticated using (bucket_id = 'moment-media' and owner_id = auth.uid()::text);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists moments_updated_at on public.moments;
create trigger moments_updated_at before update on public.moments for each row execute function public.set_updated_at();
drop trigger if exists journeys_updated_at on public.journeys;
create trigger journeys_updated_at before update on public.journeys for each row execute function public.set_updated_at();
drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at before update on public.comments for each row execute function public.set_updated_at();
