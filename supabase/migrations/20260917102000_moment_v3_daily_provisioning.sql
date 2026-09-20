create or replace function public.ensure_today_moment()
returns public.daily_moments
language plpgsql
security definer
set search_path = public
as $$
declare result public.daily_moments;
begin
  insert into public.daily_moments(moment_date,prompt,status,ends_at)
  select current_date, p.prompt, 'PREPARED', (current_date + 1)::timestamptz
  from public.prompt_library p
  where p.review_status = 'APPROVED'
  order by p.used_at nulls first, p.created_at
  limit 1
  on conflict (moment_date) do nothing;

  if not exists (select 1 from public.daily_moments where moment_date = current_date) then
    insert into public.daily_moments(moment_date,prompt,status,ends_at)
    values (current_date,'Find one small thing around you that you normally walk past. Bring it back as your answer.','PREPARED',(current_date + 1)::timestamptz)
    on conflict (moment_date) do nothing;
  end if;

  select * into result from public.daily_moments where moment_date = current_date limit 1;
  return result;
end;
$$;

revoke all on function public.ensure_today_moment() from public;
grant execute on function public.ensure_today_moment() to authenticated;
