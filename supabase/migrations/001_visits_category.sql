-- Required so Field Log can re-fetch NPS details by id + category.
alter table public.visits
  add column if not exists category text;

comment on column public.visits.category is
  'NPS API path segment: parks | campgrounds | places | thingstodo | tours | people';
