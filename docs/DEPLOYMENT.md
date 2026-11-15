# Deployment

NyayPath uses SQLite locally and **Turso (libSQL)** in production. Turso is SQLite-compatible, hosted, and works on serverless platforms such as Vercel, which have no persistent disk. The app always reaches the database through the libSQL adapter (`src/lib/db-client.ts`).

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` locally, `libsql://<db>-<org>.turso.io` on Turso |
| `DATABASE_AUTH_TOKEN` | Turso only | Database token (`turso db tokens create <db>`) |
| `SESSION_SECRET` | yes (production) | 32+ random characters: `openssl rand -base64 48`. The app refuses to sign people in with the placeholder value |
| `SITE_URL` | recommended | Public URL, used for page metadata |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | first deploy | Creates the first administrator during the build, only if the database has no users. Password: 12+ characters |
| `MAX_APPOINTMENTS_PER_VOLUNTEER_PER_DAY` | no | Default and maximum 8 (the number of daily slots) |

## Vercel + Turso

1. Create a Turso database (`turso db create nyaypath`) and a token (`turso db tokens create nyaypath`).
2. Import the repository in Vercel (framework: Next.js; the `vercel-build` script runs migrations and the admin bootstrap for you).
3. Set `DATABASE_URL`, `DATABASE_AUTH_TOKEN` (Sensitive), `SESSION_SECRET`, `SITE_URL`, and for the first deploy `ADMIN_EMAIL` / `ADMIN_PASSWORD` (Sensitive).
4. Deploy. After you can sign in, you may delete `ADMIN_PASSWORD` from the project settings.

Never run `npm run db:seed` against a real database: it wipes data and refuses to run when `NODE_ENV=production`.

## Changing the schema

Edit `prisma/schema.prisma`, run `npm run db:migrate:new` (Prisma writes a SQL file under `prisma/migrations`), commit it. `npm run db:migrate` (and every Vercel build) applies pending files to whichever database `DATABASE_URL` points at. Prisma's own `migrate deploy` cannot reach Turso, so `scripts/migrate.ts` is used instead.

## Docker (self-hosting)

```bash
export SESSION_SECRET="$(openssl rand -base64 48)"
docker compose up -d --build
```

Migrations are applied on container start; data lives in the `nyaypath-data` volume, so **back it up**. Create the first administrator by running `scripts/create-admin.ts` with the `ADMIN_*` variables set. Or point `DATABASE_URL` at Turso instead of a file.

> The Docker image has not been exercised in CI yet. Please report problems.

## Reverse proxy and rate limiting

- Serve over HTTPS (session cookies are `Secure` in production).
- Login and tracking attempts are rate limited **in memory, per process**. On serverless hosts each instance has its own counters, so the limit is weaker than it looks; move it to Redis/Upstash for a stricter guarantee. The client address comes from `X-Forwarded-For`; on your own proxy make sure it **overwrites** that header rather than appends to it.

## Before you go live

- [ ] Strong `SESSION_SECRET`, HTTPS, database backups (Turso: point-in-time restore on paid plans, or periodic `turso db shell nyaypath .dump`)
- [ ] No demo users; real administrators only
- [ ] Have a lawyer review each guide, then set `reviewedBy`
- [ ] Phone/visit each directory entry, then set `verified: true`; add local services for your districts
- [ ] Set a data-retention policy and tell users (see the Privacy page text)
