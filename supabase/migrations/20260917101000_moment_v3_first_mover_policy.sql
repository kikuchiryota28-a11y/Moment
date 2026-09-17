drop policy if exists "authenticated users can start prepared moment" on public.daily_moments;
create policy "authenticated users can start and activate moment" on public.daily_moments for update to authenticated
  using ((status = 'PREPARED' and first_mover_id is null) or (status = 'FIRST_MOVER' and first_mover_id = auth.uid()))
  with check (status in ('FIRST_MOVER','LIVE') and first_mover_id = auth.uid());
