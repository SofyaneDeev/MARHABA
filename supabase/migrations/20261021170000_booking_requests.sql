-- Experiences travellers can request, and the requests they send.
-- Travellers (the anon role) may read active experiences and create requests,
-- but may never read, change or delete requests: those hold personal data.

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  category text not null check (category in ('tour', 'culture', 'food', 'desert', 'outdoor')),
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) <= 600),
  duration text check (duration is null or char_length(duration) <= 40),
  price_from_mad integer check (price_from_mad is null or price_from_mad >= 0),
  guide_name text check (guide_name is null or char_length(guide_name) <= 80),
  -- Set only after checking the guide's official licence.
  licensed boolean not null default false,
  -- Example listings shown before real partners are signed up.
  is_sample boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index experiences_city_idx on public.experiences (city) where active;

alter table public.experiences enable row level security;

create policy "Travellers can read active experiences"
  on public.experiences for select
  to anon, authenticated
  using (active);

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete restrict,
  traveller_name text not null check (char_length(btrim(traveller_name)) between 2 and 80),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^\+?[0-9 ]{6,20}$'),
  preferred_date date not null,
  group_size smallint not null check (group_size between 1 and 20),
  message text check (message is null or char_length(message) <= 1000),
  consent boolean not null check (consent),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
  created_at timestamptz not null default now()
);

create index booking_requests_experience_idx on public.booking_requests (experience_id);
create index booking_requests_status_idx on public.booking_requests (status, created_at desc);

alter table public.booking_requests enable row level security;

-- Insert only. No select/update/delete policy exists, so travellers can't read requests back.
create policy "Travellers can send a booking request"
  on public.booking_requests for insert
  to anon, authenticated
  with check (
    status = 'new'
    -- One day of slack for time zones; at most a year ahead.
    and preferred_date >= current_date - 1
    and preferred_date <= current_date + 366
    and exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.active
    )
  );

revoke all on public.booking_requests from anon, authenticated;
grant insert on public.booking_requests to anon, authenticated;
revoke all on public.experiences from anon, authenticated;
grant select on public.experiences to anon, authenticated;
