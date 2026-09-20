# Semika — personal archive

A cinematic, minimal portfolio with a database-backed CMS.
Next.js (App Router) · TypeScript · Tailwind CSS v4 · PostgreSQL · Prisma · Better Auth.

> **Build status: Step 3 of 12 — scaffold.**
> Working now: project structure, database schema, seed, Google sign-in for `/admin`,
> guarded admin shell with a live overview, custom 404, `robots.txt`, `sitemap.xml`.
> Public pages are labelled placeholders until Step 5. The full README (deployment,
> backups, troubleshooting) is completed in Step 12.

## Prerequisites

- **Node.js 20.9 or newer** (22 LTS recommended) — check with `node -v`
- **VS Code** (or any editor) and a terminal
- A free **Neon** account (PostgreSQL) — https://neon.tech
- A **Google Cloud** project for OAuth sign-in (free) — https://console.cloud.google.com

## Deploy without a terminal (GitHub + Vercel)

Everything below happens in browser or desktop apps. Vercel installs dependencies,
creates the database tables and runs the seed as part of the production build
(`scripts/prepare-db.mjs`), so you never run Prisma yourself.

1. **GitHub.** Create a new private repository. Put this folder's contents in it using
   *GitHub Desktop* (File → Add local repository → Publish), or drag the unzipped files
   into GitHub's "uploading an existing file" page (max 100 files per commit — do two batches).
   Upload the *contents* of the unzipped folder, not the .zip itself.
2. **Neon.** Create a project, open *Connect*, and copy two connection strings:
   the **pooled** one (`DATABASE_URL`) and the **direct** one (`DIRECT_URL`, pooling off).
3. **Google.** Create an OAuth client (Web application). Add the authorised redirect URI
   `https://YOUR-PROJECT.vercel.app/api/auth/callback/google`.
4. **Vercel.** *Add New → Project → import the repo*. Before clicking Deploy, add every
   variable from `.env.example` under *Environment Variables* (leave R2_* and RESEND_* empty for now).
   Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://YOUR-PROJECT.vercel.app`.
5. **Deploy.** Then visit `/admin` and sign in. If the domain Vercel assigned differs from
   what you used in step 3–4, update those values and redeploy.

Build errors appear in the Vercel deployment log. Every push to `main` redeploys.

## Quick start (local development)

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Create your env file
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

### 3. Fill in `.env`

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Neon dashboard → Connection details → **Pooled connection** |
| `DIRECT_URL` | Same screen → turn pooling **off** → copy the direct string |
| `BETTER_AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud → APIs & Services → Credentials → *Create credentials → OAuth client ID → Web application*. Add authorised redirect URI `http://localhost:3000/api/auth/callback/google`. (First time: you'll be asked to configure the OAuth consent screen — "External", add your own email as a test user.) |
| `ADMIN_EMAILS` | Your Google account email. Only addresses listed here can ever enter `/admin`. |

Storage (`R2_*`, `NEXT_PUBLIC_MEDIA_URL`) and email (`RESEND_API_KEY`) can stay empty for now.

### 4. Create the database and start

```bash
npx prisma migrate dev --name init   # creates tables; commit the generated prisma/migrations folder
npm run db:seed                      # categories, site settings, about, cv
npm run dev                          # http://localhost:3000
```

## What to check

1. `http://localhost:3000` — dark green status page; click through each route link.
2. `/does-not-exist` — custom 404.
3. `/robots.txt` and `/sitemap.xml` — both respond.
4. `/admin` — redirects to `/admin/login`. Sign in with your Google account → overview with zeros and
   "No activity yet." (that page is querying your real database).
5. Sign in with a *different* Google account — it must be rejected.
6. `npm run typecheck` and `npm run lint` — both should be clean.

## Structure

```text
app/            routes (public + /admin + /api)
components/     ui · layout · navigation · projects · experiments · media · sections · admin
lib/
  db/           Prisma client
  auth/         Better Auth config, session helpers (requireAdmin), client
  storage/      upload policy + video-provider contract
  validation/   Zod schemas shared by forms and server actions
  utils/        cn, slugify
  env.ts        validated environment (lazy)
  routes.ts     nav + static route list
prisma/         schema.prisma, seed.ts (migrations appear after the first migrate)
types/
```

## Security model (already in place)

- Admin sign-in is **Google OAuth only** — no passwords are stored.
- Accounts and sessions are created **only** for emails in `ADMIN_EMAILS`.
- `requireAdmin()` runs on every admin page and route handler; layouts are never the only guard.
- Only `http(s)` URLs are accepted for links (blocks `javascript:` URLs).
- Baseline security headers are set in `next.config.ts`; a nonce-based CSP lands in Step 10.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `db:migrate` · `db:deploy` · `db:seed` · `db:studio` · `db:reset`

## Troubleshooting

- **"Invalid environment configuration"** — a required variable in `.env` is missing or malformed; the message lists which.
- **`redirect_uri_mismatch` from Google** — the redirect URI in Google Cloud must be exactly `http://localhost:3000/api/auth/callback/google`.
- **Signed in but bounced back to login** — the account's email isn't in `ADMIN_EMAILS`.
- **Prisma "prepared statement" errors** — add `&pgbouncer=true` to `DATABASE_URL`.
- **Overview page errors about missing tables** — run `npx prisma migrate dev` first.
