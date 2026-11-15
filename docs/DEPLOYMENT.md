# Deployment

NyayPath needs a PostgreSQL database. Serverless hosts such as Vercel have no persistent disk, so SQLite is not an option there.

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `DATABASE_URL_UNPOOLED` | no | Direct (non-pooled) URL used for migrations when your provider gives you one (Neon does) |
| `SESSION_SECRET` | yes (production) | 32+ random characters: `openssl rand -base64 48`. The app refuses to sign people in with the placeholder value |
| `SITE_URL` | recommended | Public URL, used for page metadata |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | first deploy | Creates the first administrator during the build, only if the database has no users |
| `MAX_APPOINTMENTS_PER_VOLUNTEER_PER_DAY` | no | Default and maximum 8 (the number of daily slots) |

## Vercel + Neon

1. Import the repository in Vercel (framework: Next.js; no settings to change: `vercel-build` runs migrations).
2. In the project's **Storage** tab, add **Neon** (Postgres). This injects `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. Add `SESSION_SECRET`, `SITE_URL` and, for the first deploy, `ADMIN_EMAIL` / `ADMIN_PASSWORD` (mark the password as Sensitive).
4. Deploy. Each build applies pending migrations, then creates the first admin if no users exist.
5. After signing in, you may delete `ADMIN_PASSWORD` from the project settings.

Never run `npm run db:seed` against a real database: it wipes data and refuses to run when `NODE_ENV=production`.

## Docker (self-hosting)

```bash
export SESSION_SECRET="$(openssl rand -base64 48)"
docker compose --profile app up -d --build
```

Migrations are applied on container start. Create the first administrator with `ADMIN_EMAIL`, `ADMIN_NAME` and `ADMIN_PASSWORD` set, running `scripts/create-admin.ts` through `tsx` inside the container. **Back up** the `nyaypath-pg` volume (`pg_dump`).

> The Docker image has not been exercised in CI yet. Please report problems.

## Without Docker

```bash
npm ci && npm run build
DATABASE_URL=... npx prisma migrate deploy
ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
node .next/standalone/server.js   # copy .next/static next to it, as in the Dockerfile
```

## Reverse proxy and rate limiting

- Serve over HTTPS (session cookies are `Secure` in production).
- Login and tracking attempts are rate limited **in memory, per process**. On serverless hosts and multi-instance setups each instance has its own counters, so the limit is weaker than it looks; move it to Redis/Upstash for a stricter guarantee. The client address comes from `X-Forwarded-For`; on your own proxy make sure it **overwrites** that header rather than appends to it.

## Before you go live

- [ ] Strong `SESSION_SECRET`, HTTPS, database backups
- [ ] No demo users; real administrators only
- [ ] Have a lawyer review each guide, then set `reviewedBy`
- [ ] Phone/visit each directory entry, then set `verified: true`; add local services for your districts
- [ ] Set a data-retention policy and tell users (see the Privacy page text)
