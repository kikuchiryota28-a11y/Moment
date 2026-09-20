create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists likes_moment_id_idx on public.likes(moment_id);

alter policy "users insert own profile" on public.profiles with check ((select auth.uid()) = id);
alter policy "users update own profile" on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

alter policy "users create own moments" on public.moments with check ((select auth.uid()) = user_id);
alter policy "users update own moments" on public.moments using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "users delete own moments" on public.moments using ((select auth.uid()) = user_id);

alter policy "owners create moment media" on public.moment_media with check (exists (select 1 from public.moments m where m.id = moment_media.moment_id and m.user_id = (select auth.uid())));
alter policy "owners update moment media" on public.moment_media using (exists (select 1 from public.moments m where m.id = moment_media.moment_id and m.user_id = (select auth.uid()))) with check (exists (select 1 from public.moments m where m.id = moment_media.moment_id and m.user_id = (select auth.uid())));
alter policy "owners delete moment media" on public.moment_media using (exists (select 1 from public.moments m where m.id = moment_media.moment_id and m.user_id = (select auth.uid())));

alter policy "users read own journeys" on public.journeys using ((select auth.uid()) = user_id);
alter policy "users create own journeys" on public.journeys with check ((select auth.uid()) = user_id);
alter policy "users update own journeys" on public.journeys using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "users delete own journeys" on public.journeys using ((select auth.uid()) = user_id);

alter policy "users create own likes" on public.likes with check ((select auth.uid()) = user_id);
alter policy "users delete own likes" on public.likes using ((select auth.uid()) = user_id);

alter policy "users create own comments" on public.comments with check ((select auth.uid()) = user_id);
alter policy "users update own comments" on public.comments using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy "users delete own comments" on public.comments using ((select auth.uid()) = user_id);

alter policy "users create own follows" on public.follows with check ((select auth.uid()) = follower_id);
alter policy "users delete own follows" on public.follows using ((select auth.uid()) = follower_id);
