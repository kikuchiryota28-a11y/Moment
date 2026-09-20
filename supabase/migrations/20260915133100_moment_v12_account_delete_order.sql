create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'AUTH_REQUIRED'; end if;
  delete from public.comments where user_id = uid;
  delete from public.likes where user_id = uid;
  delete from public.follows where follower_id = uid or following_id = uid;
  delete from public.journeys where user_id = uid;
  delete from public.moment_media where moment_id in (select id from public.moments where user_id = uid);
  delete from public.moments where user_id = uid;
  delete from public.user_settings where user_id = uid;
  delete from public.profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
