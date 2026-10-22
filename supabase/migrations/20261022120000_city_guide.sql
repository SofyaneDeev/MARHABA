-- The city guide shown in the Cities tab, editable from the Supabase dashboard.
-- Travellers (anon) can only read active rows; edits are made by the owner in the dashboard.
-- The app keeps an offline copy and falls back to the guide bundled with it.

create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.cities (
  -- A short stable id like 'marrakech'; places refer to it.
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null unique,
  lat double precision not null check (lat between 20 and 37),
  lng double precision not null check (lng between -18 and 0),
  known_for text not null,
  tip_title text not null,
  tip_text text not null,
  best_season text not null,
  seasons text[] not null default '{}'
    check (seasons <@ array['winter', 'spring', 'summer', 'autumn']),
  nightlife_tip text,
  sort_order integer not null default 100,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  city_id text not null references public.cities (id) on update cascade on delete cascade,
  name text not null,
  kind text not null check (kind in ('gate', 'sight', 'square', 'market', 'garden', 'nature', 'nightlife')),
  description text not null,
  sort_order integer not null default 100,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (city_id, name)
);

create index places_city_idx on public.places (city_id, sort_order);

create table public.parks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  near text not null,
  best_for text not null,
  kind text not null check (kind in ('garden', 'park', 'national')),
  sort_order integer not null default 100,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.seasonal_recommendations (
  season text primary key check (season in ('winter', 'spring', 'summer', 'autumn')),
  label text not null,
  months text not null,
  experiences text not null,
  -- City names open that city's guide; other names open Maps.
  destinations text[] not null default '{}',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger cities_touch before update on public.cities
  for each row execute function public.touch_updated_at();
create trigger places_touch before update on public.places
  for each row execute function public.touch_updated_at();
create trigger parks_touch before update on public.parks
  for each row execute function public.touch_updated_at();
create trigger seasonal_recommendations_touch before update on public.seasonal_recommendations
  for each row execute function public.touch_updated_at();

alter table public.cities enable row level security;
alter table public.places enable row level security;
alter table public.parks enable row level security;
alter table public.seasonal_recommendations enable row level security;

create policy "Travellers can read active cities" on public.cities
  for select to anon, authenticated using (active);
create policy "Travellers can read active places" on public.places
  for select to anon, authenticated using (active);
create policy "Travellers can read active parks" on public.parks
  for select to anon, authenticated using (active);
create policy "Travellers can read seasonal recommendations" on public.seasonal_recommendations
  for select to anon, authenticated using (true);

revoke all on public.cities, public.places, public.parks, public.seasonal_recommendations from anon, authenticated;
grant select on public.cities, public.places, public.parks, public.seasonal_recommendations to anon, authenticated;
