-- Keep moderation state server-controlled. Reporters may submit reports but cannot hide arbitrary results.
drop policy if exists "users update own results" on public.results;
create policy "users update own visible results" on public.results for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and moderation_status = 'VISIBLE');

-- Blocked users' results are excluded from the reporting user's public view.
drop policy if exists "visible results readable by everyone" on public.results;
create policy "visible unblocked results readable" on public.results for select
  using (
    moderation_status = 'VISIBLE'
    and not exists (
      select 1 from public.user_blocks b
      where b.blocker_id = auth.uid() and b.blocked_id = results.user_id
    )
  );
