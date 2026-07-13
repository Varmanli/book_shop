# MVP Deployment Guide

## Requirements

- **Node.js** 20 LTS or higher
- **PostgreSQL** 14+ (Neon, Supabase, or self-hosted)
- **Arvan Object Storage** bucket (S3-compatible) for file uploads

---

## 1. Clone & install

```bash
git clone <repo-url>
cd book_shop
npm ci
```

---

## 2. Create `.env`

Copy the example and fill in every value:

```bash
cp .env.example .env
```

### Required variables

| Variable | Notes |
|---|---|
| `NODE_ENV` | Set to `production` |
| `NEXT_PUBLIC_APP_URL` | Full public URL, e.g. `https://your-domain.com` |
| `DATABASE_URL` | PostgreSQL connection string — must start with `postgres` |
| `AUTH_SECRET` | Min 32 random chars — `openssl rand -base64 32` |
| `STORAGE_DRIVER` | `s3` for Arvan |
| `S3_ENDPOINT` | e.g. `https://s3.ir-thr-at1.arvanstorage.ir` |
| `S3_REGION` | e.g. `ir-thr-at1` |
| `S3_BUCKET` | Your Arvan bucket name |
| `S3_ACCESS_KEY_ID` | Arvan access key — **server-only, never expose to browser** |
| `S3_SECRET_ACCESS_KEY` | Arvan secret key — **server-only, never expose to browser** |
| `S3_PUBLIC_BASE_URL` | e.g. `https://your-bucket.s3.ir-thr-at1.arvanstorage.ir` |
| `ADMIN_EMAIL` | Email address for the first admin account (used by seed) |
| `ADMIN_PASSWORD` | Strong password, min 12 chars (used by seed) |

### Optional

| Variable | Notes |
|---|---|
| `ADMIN_NAME` | Display name for admin (default: مدیر سیستم) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID — skip for MVP |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret — skip for MVP |

---

## 3. Run database migrations

Run this once before each release, using the same `DATABASE_URL` that the app
will use at runtime. It is the only supported migration command:

```bash
npm run db:migrate
```

Do not run `db:push` in production. It bypasses the reviewed migration
journal.

## Docker / Coolify deployment

The Docker build never connects to PostgreSQL and requires no database
credentials. Set `NEXT_PUBLIC_APP_URL` as the only optional build argument.

Configure `DATABASE_URL`, `AUTH_SECRET`, and all other secrets as **runtime**
variables in Coolify. Container startup is always `node server.js`; it never
runs a migration. Deploy the image normally, then open a Coolify terminal for
the newly running application container and run:

```bash
npm run db:migrate
```

This is the single production migration command. It uses the container's
runtime `DATABASE_URL`, writes PostgreSQL/Drizzle errors directly to that
terminal, and a failure affects only the command—not the running application.
Do not configure it as a Docker `CMD`, entrypoint, image-build step, or a
Coolify automatic pre-deployment command.

### One-time recovery for the current production database

The reported `type "role" already exists` error means the production schema
already contains the pre-Owner migrations, but its Drizzle history is empty.
Do **not** drop the enum, tables, or production data. Instead, first take a
database backup and verify that the database is the pre-Owner schema (the
`role` enum contains only `USER` and `ADMIN`, and `owner_control` does not
exist). Then run this once through `psql` against that production database:

```sql
BEGIN;

CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

-- Safety guards: this recovery is only for the known, pre-Owner schema with
-- an empty migration history.
DO $$
DECLARE
  role_values text[];
BEGIN
  IF EXISTS (SELECT 1 FROM "drizzle"."__drizzle_migrations") THEN
    RAISE EXCEPTION 'Drizzle migration history is not empty; aborting recovery.';
  END IF;

  SELECT array_agg(enumlabel ORDER BY enumsortorder)
  INTO role_values
  FROM pg_enum
  WHERE enumtypid = 'public.role'::regtype;

  IF role_values IS DISTINCT FROM ARRAY['USER', 'ADMIN'] THEN
    RAISE EXCEPTION 'Expected the pre-Owner public.role enum; aborting recovery.';
  END IF;

  IF to_regclass('public.owner_control') IS NOT NULL
     OR to_regclass('public.role_audit_logs') IS NOT NULL
     OR to_regclass('public.users') IS NULL
     OR to_regclass('public.books') IS NULL
     OR to_regclass('public.genres') IS NULL
     OR to_regclass('public.reviews') IS NULL
     OR to_regclass('public.coupons') IS NULL
     OR to_regclass('public.transactions') IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'books' AND column_name = 'is_sold'
     )
     OR NOT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'genres' AND column_name = 'image'
     ) THEN
    RAISE EXCEPTION 'Database does not match the expected pre-Owner schema; aborting recovery.';
  END IF;
END $$;

INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at) VALUES
  ('d614f0a93b263f3a9666067e3bac3f0305ead4e2b14240e81accdbe72db0ee13', 1780951720886),
  ('ec36c713636a415ac7f5f07424f8926df916620c26ff79f14691e91012e5687c', 1781018102677),
  ('5987fdb8ed01186859fdc75b401758eee97ee65a6749e511e02b2bac05fe75c6', 1782599883087),
  ('738ba59fb2c1c1c880fbbad617f864d1509bc3d31800dc70b95b64fad40cdb49', 1782645926925);

COMMIT;
```

Immediately run `npm run db:migrate`. Drizzle will then apply only
`0005_add_owner_role` and `0006_owner_role_management`. This repair is
deliberately a documented, one-time operator action—not an automatic fallback
in the application or image.

Before the final migration command, confirm the four baseline rows are the
only history rows:

```sql
SELECT created_at
FROM "drizzle"."__drizzle_migrations"
ORDER BY created_at;
```

The result must be exactly `1780951720886`, `1781018102677`,
`1782599883087`, and `1782645926925`. Drizzle Kit has no migration dry-run
flag; this guarded history check is the safe verification that its next run
will select only the two Owner migrations.

---

## 4. Seed the database — FIRST DEPLOY ONLY

> ⚠️ **Read before running**
> - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` first — the seed will refuse to run without them.
> - The seed is **idempotent** for categories/books/blog posts (uses `onConflictDoNothing`), but it **upserts** the admin user — meaning it will reset the admin password to whatever is in `.env` each time it runs.
> - **Do not run the seed again after changing the admin password in-app**, or it will reset back to the `.env` value.
> - Sample test users (`ali@example.com`, `maryam@example.com`) are only inserted in non-production environments.

```bash
npm run db:seed
```

After seeding, log in at `/auth/login` with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set.

---

## 5. Build

```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ TypeScript — 0 errors
48 routes generated
```

---

## 6. Start

```bash
npm run start
```

Default port: **3000**. Use a reverse proxy (nginx, Caddy) for HTTPS on port 443.

---

## 7. Process manager (PM2)

```bash
npm install -g pm2
pm2 start npm --name book_shop -- start
pm2 save
pm2 startup
```

---

## 8. Nginx example

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 9. Arvan S3 bucket setup

1. Create a bucket in Arvan Cloud Object Storage.
2. Set the bucket ACL to **public-read** so uploaded images are accessible without auth.
3. Note the endpoint URL and bucket name — both go in `.env`.
4. The upload API (`/api/uploads`) is protected: only authenticated ADMIN users can upload. No public upload is possible.

---

## 10. Full first-deploy sequence

```bash
git pull
npm ci
# Edit .env — set DATABASE_URL, AUTH_SECRET, S3_*, ADMIN_EMAIL, ADMIN_PASSWORD
npm run db:migrate
npm run db:seed          # first time only — creates admin account
npm run build
pm2 start npm --name book_shop -- start
```

### Update deploys (no re-seed needed)

```bash
git pull
npm ci
npm run db:migrate       # safe to re-run; applies only new migrations
npm run build
pm2 restart book_shop
```

---

## 11. Post-deploy smoke test checklist

After starting, verify these routes return 200 with real content:

- [ ] `GET /` — home page with hero slider and featured books
- [ ] `GET /books` — book listing with search and filters
- [ ] `GET /books/<any-slug>` — book detail page
- [ ] `GET /blog` — blog post listing
- [ ] `GET /blog/<any-slug>` — blog post detail
- [ ] `GET /about` — about page
- [ ] `GET /contact` — contact page
- [ ] `GET /auth/login` — login form (no crash)
- [ ] Admin login: visit `/auth/login`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] `GET /admin` — admin dashboard loads
- [ ] `GET /admin/books/new` — book form loads with upload button
- [ ] Upload a book cover image from the admin UI — confirm it appears in Arvan S3
- [ ] `GET /admin/site-content` — hero slider management loads

---

## 12. Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Invalid server environment variables` | Missing or wrong `.env` value | Check all required vars above |
| `DATABASE_URL must be a PostgreSQL connection string` | URL doesn't start with `postgres` | Fix the connection string prefix |
| `AUTH_SECRET must be at least 32 characters` | Secret too short | `openssl rand -base64 32` |
| `ADMIN_EMAIL and ADMIN_PASSWORD must be set` | Seed vars missing | Add them to `.env` before running seed |
| `ADMIN_PASSWORD must be at least 12 characters` | Weak seed password | Use a stronger password |
| `S3 configuration is incomplete` | S3 vars missing | Add all `S3_*` vars, or set `STORAGE_DRIVER=local` |
| Admin login redirect loop | No ADMIN-role user in DB | Run `npm run db:seed` (first time), or manually: `UPDATE users SET role='ADMIN' WHERE email='...'` |
| Images not loading from Arvan | Wrong `S3_PUBLIC_BASE_URL` | Check bucket domain and confirm bucket ACL is public-read |
| Port already in use | Another process on 3000 | `PORT=4000 npm run start` |

---

## 13. Known MVP limitations (non-blockers)

- Blog post HTML is sanitized server-side via an allowlist before rendering. Only admin-created content reaches the renderer.
- No rate limiting on auth endpoints — add nginx `limit_req` for production hardening.
- No automated backups — set up a PostgreSQL backup cron (e.g., `pg_dump`) before launch.
- Google OAuth is optional — credentials sign-in works without it.
