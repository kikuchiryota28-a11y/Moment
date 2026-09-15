create or replace function public.handle_new_moment_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))),
    coalesce(new.raw_user_meta_data->>'display_name', 'New Moment User')
  );
  return new;
exception when unique_violation then
  raise exception 'That username is already taken.';
end;
$$;

drop trigger if exists on_auth_user_created_moment on auth.users;
create trigger on_auth_user_created_moment
after insert on auth.users
for each row execute function public.handle_new_moment_user();
