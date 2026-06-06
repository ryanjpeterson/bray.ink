-- CMS copy key-value store
create table if not exists copy (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- Booking form submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Instagram token (single row)
create table if not exists instagram_token (
  id int primary key default 1,
  token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- Instagram posts cache (refreshed by edge function)
create table if not exists instagram_posts_cache (
  id text primary key,
  media_url text not null,
  permalink text not null,
  media_type text not null,
  caption text,
  timestamp timestamptz
);

-- Row Level Security
alter table copy enable row level security;
alter table submissions enable row level security;
alter table instagram_token enable row level security;
alter table instagram_posts_cache enable row level security;

-- Public can read copy and instagram cache (site rendering)
create policy "Public read copy" on copy for select using (true);
create policy "Public read instagram cache" on instagram_posts_cache for select using (true);

-- Only service role can write (app uses service role for all writes)
-- Authenticated users (admin) can read submissions
create policy "Admin read submissions" on submissions
  for select using (auth.role() = 'authenticated');

-- Seed default copy values
insert into copy (key, value) values
  -- SEO
  ('meta_title', 'bray.ink | Tattoo Studio in Alliston, ON'),
  ('meta_description', 'Custom fine line and blackwork tattooing in Alliston, ON. Appointment-only private studio specializing in anime, illustrative, and pop-culture tattoos.'),
  -- Hero
  ('hero_booking_status', 'Now booking for June/July 2026'),
  ('hero_tagline', 'Custom Fine Line & Blackwork Tattooing'),
  ('hero_cta', 'Contact'),
  ('hero_image_url', '/assets/brayden.jpg'),
  -- The Shop
  ('about_p1', 'Located in Alliston, ON, <strong>bray.ink</strong> is an appointment-only private space specializing in illustrative art, bold stencils, clean fine lines, and vibrant custom pop-culture tattooing.'),
  ('about_p2', 'Whether you are looking for a highly detailed anime piece, a sharp blackwork design, or custom nostalgic illustration, every canvas receives a unique, meticulously designed piece built to last.'),
  ('about_p3', 'We work in a relaxed, ultra-hygienic private atmosphere designed to make your session as comfortable and creative as possible.'),
  ('studio_chip_1', 'Appointment Only'),
  ('studio_chip_2', 'Private Studio'),
  ('studio_chip_3', 'Alliston, ON'),
  ('studio_image_url', 'https://images.unsplash.com/photo-1671750145942-da9fed292290?q=80&w=2070'),
  -- Contact
  ('contact_location', '36 Victoria St W, Alliston, ON'),
  ('contact_location_url', 'https://www.google.ca/maps/place/Bray.ink/@44.1539348,-79.8729879,17z'),
  ('contact_phone', '(289) 970-1828'),
  ('contact_email', 'brayinktats@gmail.com'),
  ('booking_note_1', 'To submit a booking request, please provide your design idea (any reference characters, anime series, or elements), desired size in inches, placement on the body, and preferred dates.'),
  ('booking_note_2', 'We only tattoo clients 18+ with valid ID. Make sure to come rested, hydrated, and ready for clean lines.'),
  -- Social / Footer
  ('instagram_handle', 'bray.ink'),
  ('footer_location', '36 Victoria St W — Alliston, ON'),
  -- Brand gradient
  ('gradient_start', '#00c6ff'),
  ('gradient_end', '#ff007f')
on conflict (key) do nothing;

-- Storage bucket for admin-uploaded site images
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('site-images', 'site-images', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Webhook to trigger email on new submission
-- (configured via Supabase dashboard: Database → Webhooks → new submission → send-booking-email)
