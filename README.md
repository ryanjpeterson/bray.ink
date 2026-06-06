# bray.ink

Tattoo studio website for bray.ink — Alliston, ON. Built with SvelteKit, self-hosted Supabase, and Docker Compose.

## Architecture

```
SvelteKit (adapter-node)
  └── Served by Node.js on port 3000 (inside Docker)

Caddy (reverse proxy)
  ├── bray.ink → app:3000
  ├── brayink.ryanjpeterson.dev → app:3000
  └── localhost:3001 → studio:3000 (Supabase Studio)

Self-hosted Supabase (Docker Compose)
  ├── Kong (API gateway, port 8000)
  ├── GoTrue (auth)
  ├── PostgREST (database REST API)
  ├── Realtime
  ├── Storage + imgproxy
  ├── Meta (migrations)
  ├── Studio (admin UI, port 3000 internal)
  └── PostgreSQL

Supabase Edge Functions (Deno)
  ├── send-booking-email — triggered via DB webhook on new submission
  └── refresh-instagram-token — cron every 55 days
```

## Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit (Svelte 5 runes) |
| Adapter | @sveltejs/adapter-node |
| Database | PostgreSQL via self-hosted Supabase |
| Auth | Supabase GoTrue (cookie-based via @supabase/ssr) |
| Email | Resend (API + SMTP) |
| Instagram | Basic Display API with DB token cache |
| Proxy | Caddy with automatic Let's Encrypt |
| Container | Docker Compose |

## Routes

### Public Site

| Route | Description |
|---|---|
| `/` | Single-page site — hero, gallery, studio info, contact form |
| `/api/submit` | POST endpoint — validates and inserts booking form submissions |

### Admin (auth-gated)

| Route | Description |
|---|---|
| `/admin/login` | Email/password login via Supabase Auth |
| `/admin/submissions` | View all booking form submissions, mark as read |
| `/admin/content` | Edit all site copy, brand gradient colors |

## Database Tables

| Table | Purpose |
|---|---|
| `copy` | Key-value CMS — all site text and brand colors |
| `submissions` | Booking form entries from visitors |
| `instagram_token` | Single-row; stores the long-lived IG access token |
| `instagram_posts_cache` | Cached Instagram posts, refreshed by edge function |

## CMS Fields

All fields are editable at `/admin/content`. Organized by section:

- **Brand** — `gradient_start`, `gradient_end` (hex color pickers — controls all buttons, gradients, SVGs site-wide)
- **SEO** — `meta_title`, `meta_description`
- **Hero** — `hero_booking_status`, `hero_tagline`, `hero_cta`
- **The Shop** — `about_p1/2/3`, `studio_chip_1/2/3`, `studio_image_url`
- **Contact** — `contact_location`, `contact_location_url`, `contact_phone`, `contact_email`, `booking_note_1/2`
- **Social** — `instagram_handle`, `footer_location`

## Edge Functions

### `send-booking-email`
Triggered by a Supabase DB webhook on INSERT to `submissions`. Sends an HTML email via Resend to `BOOKING_FORWARD_TO` with reply-to set to the submitter's email.

### `refresh-instagram-token`
Run as a cron every 55 days via Supabase Studio. Reads the token from `instagram_token`, calls the Instagram Graph API to refresh it, then re-fetches the latest 12 image posts into `instagram_posts_cache`.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
POSTGRES_PASSWORD         Strong password for Postgres
JWT_SECRET                32+ char random string (openssl rand -base64 32)
SECRET_KEY_BASE           64 char random string
SUPABASE_ANON_KEY         JWT signed with JWT_SECRET, role: anon
SUPABASE_SERVICE_ROLE_KEY JWT signed with JWT_SECRET, role: service_role
PUBLIC_SUPABASE_URL       http://localhost:8000 (Kong port)
PUBLIC_SUPABASE_ANON_KEY  Same as SUPABASE_ANON_KEY
RESEND_API_KEY            From resend.com
BOOKING_FORWARD_TO        Email to forward submissions to
BOOKING_FROM_EMAIL        From address for booking emails
SMTP_HOST/PORT/USER/PASS  Resend SMTP credentials
DASHBOARD_USERNAME/PASSWORD Supabase Studio login
ORIGIN                    https://bray.ink (or http://localhost:PORT for local)
```

## Local Development

```sh
npm install
npm run dev        # dev server at localhost:5173

# or run the production build as a Node process:
npm run build
PORT=9531 ORIGIN=http://localhost:9531 node build/index.js
```

## Docker

```sh
# Build and run the app container only (no Supabase)
docker build -t brayink-app .
docker run -p 9531:3000 --env-file .env -e ORIGIN=http://localhost:9531 --name brayink brayink-app

# Full stack (app + Supabase + Caddy)
docker compose up -d
```

## Deployment (VPS)

```sh
git pull
docker compose up -d --build app
```

Caddy handles SSL automatically via Let's Encrypt on first request to `bray.ink`.

## Instagram Setup

See `supabase/INSTAGRAM_SETUP.md` — OAuth flow must be completed manually once to seed the initial token into the `instagram_token` table.
