-- MOMENT V3 prompt infrastructure: human-curated library first, generation later.
create type public.prompt_archetype as enum ('DISCOVER','REFRAME','ALTER','PREDICT','CHOOSE');
create type public.prompt_review_status as enum ('DRAFT','REVIEW','APPROVED','REJECTED','RETIRED');

create table if not exists public.prompt_library (
  id uuid primary key default gen_random_uuid(),
  prompt text not null check (char_length(prompt) between 5 and 500),
  archetype public.prompt_archetype not null,
  self_curiosity smallint not null default 0 check (self_curiosity between 0 and 3),
  other_curiosity smallint not null default 0 check (other_curiosity between 0 and 3),
  result_variance smallint not null default 0 check (result_variance between 0 and 3),
  real_world_action smallint not null default 0 check (real_world_action between 0 and 3),
  low_friction smallint not null default 0 check (low_friction between 0 and 3),
  moment_fit smallint not null default 0 check (moment_fit between 0 and 3),
  world_value smallint not null default 0 check (world_value between 0 and 3),
  safety_flags text[] not null default '{}',
  review_status public.prompt_review_status not null default 'DRAFT',
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_library_status_idx on public.prompt_library(review_status, used_at);

alter table public.prompt_library enable row level security;
create policy "approved prompts readable by authenticated" on public.prompt_library
  for select to authenticated using (review_status = 'APPROVED');

insert into public.prompt_library (prompt, archetype, self_curiosity, other_curiosity, result_variance, real_world_action, low_friction, moment_fit, world_value, review_status)
values
('Find one small thing around you that you normally walk past. Bring it back as your answer.','DISCOVER',2,3,3,3,3,3,3,'APPROVED'),
('Look around you. Pick the thing that feels most out of place today. Bring it back.','REFRAME',2,3,3,3,3,3,3,'APPROVED'),
('Choose something nearby you would normally ignore. Give it one minute of attention, then answer with what you noticed.','ALTER',3,3,3,3,2,3,3,'APPROVED'),
('If you had to keep one ordinary thing from today as a tiny memory, what would you choose? Bring it back.','CHOOSE',3,3,3,3,3,3,3,'APPROVED')
on conflict do nothing;
