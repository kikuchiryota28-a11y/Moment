create or replace function public.is_activity_public(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_settings where user_id = target_user_id and activity_visibility = 'public') $$;
create or replace function public.is_experience_public(target_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_settings where user_id = target_user_id and experience_visibility = 'public') $$;
revoke all on function public.is_activity_public(uuid) from public;
revoke all on function public.is_experience_public(uuid) from public;
grant execute on function public.is_activity_public(uuid) to public;
grant execute on function public.is_experience_public(uuid) to public;

drop policy if exists "moments readable by visibility" on public.moments;
create policy "moments readable by visibility" on public.moments for select to public
using (user_id = (select auth.uid()) or public.is_activity_public(user_id));

drop policy if exists "journeys readable by visibility" on public.journeys;
create policy "journeys readable by visibility" on public.journeys for select to public
using (user_id = (select auth.uid()) or public.is_experience_public(user_id));
