revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
revoke all on function public.handle_new_profile_settings() from public, anon, authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

drop function if exists private.is_activity_public(uuid);
drop function if exists private.is_experience_public(uuid);
create function private.is_activity_public(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_settings where user_id = target_user_id and activity_visibility = 'public') $$;
create function private.is_experience_public(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_settings where user_id = target_user_id and experience_visibility = 'public') $$;
revoke all on function private.is_activity_public(uuid) from public, anon, authenticated;
revoke all on function private.is_experience_public(uuid) from public, anon, authenticated;

drop policy if exists "moments readable by visibility" on public.moments;
create policy "moments readable by visibility" on public.moments for select to public
using (user_id = (select auth.uid()) or private.is_activity_public(user_id));

drop policy if exists "journeys readable by visibility" on public.journeys;
create policy "journeys readable by visibility" on public.journeys for select to public
using (user_id = (select auth.uid()) or private.is_experience_public(user_id));
