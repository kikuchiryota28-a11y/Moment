create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system','light','dark')),
  notifications_enabled boolean not null default true,
  try_notifications boolean not null default true,
  reminder_notifications boolean not null default true,
  activity_visibility text not null default 'public' check (activity_visibility in ('public','private')),
  experience_visibility text not null default 'public' check (experience_visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists website_url text;
alter table public.profiles add column if not exists instagram_url text;
alter table public.profiles add column if not exists x_url text;
alter table public.profiles drop constraint if exists profiles_username_check;
alter table public.profiles add constraint profiles_username_check check (username ~ '^[a-z0-9_]{3,20}$');
create index if not exists profiles_username_idx on public.profiles (username);

alter table public.user_settings enable row level security;
drop policy if exists "users read own settings" on public.user_settings;
drop policy if exists "users insert own settings" on public.user_settings;
drop policy if exists "users update own settings" on public.user_settings;
create policy "users read own settings" on public.user_settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own settings" on public.user_settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own settings" on public.user_settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into public.user_settings (user_id) select id from public.profiles on conflict (user_id) do nothing;

create or replace function public.handle_new_profile_settings()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_profile_create_settings on public.profiles;
create trigger on_profile_create_settings after insert on public.profiles for each row execute function public.handle_new_profile_settings();

drop policy if exists "moments readable by everyone" on public.moments;
create policy "moments readable by visibility" on public.moments for select to public
using (user_id = (select auth.uid()) or exists (
  select 1 from public.user_settings s where s.user_id = moments.user_id and s.activity_visibility = 'public'
));

drop policy if exists "users read own journeys" on public.journeys;
create policy "journeys readable by visibility" on public.journeys for select to public
using (user_id = (select auth.uid()) or exists (
  select 1 from public.user_settings s where s.user_id = journeys.user_id and s.experience_visibility = 'public'
));

create index if not exists user_settings_activity_visibility_idx on public.user_settings (activity_visibility);
create index if not exists user_settings_experience_visibility_idx on public.user_settings (experience_visibility);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "public read avatars" on storage.objects;
drop policy if exists "users upload own avatars" on storage.objects;
drop policy if exists "users update own avatars" on storage.objects;
drop policy if exists "users delete own avatars" on storage.objects;
create policy "public read avatars" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "users upload own avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users update own avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete own avatars" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
