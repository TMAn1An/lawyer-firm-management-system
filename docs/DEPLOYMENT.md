# Deployment

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a PostgreSQL URL |
| `SESSION_SECRET` | yes (production) | 32+ random characters: `openssl rand -base64 48`. The app refuses to sign people in with the placeholder value |
| `SITE_URL` | recommended | Public URL, used for page metadata |
| `MAX_APPOINTMENTS_PER_VOLUNTEER_PER_DAY` | no | Default and maximum 8 (the number of daily slots) |

## Docker

```bash
export SESSION_SECRET="$(openssl rand -base64 48)"
docker compose up -d --build
docker compose exec app node node_modules/tsx/dist/cli.mjs scripts/create-admin.ts   # needs ADMIN_EMAIL, ADMIN_PASSWORD
```

Set `ADMIN_EMAIL`, `ADMIN_NAME` and `ADMIN_PASSWORD` (12+ characters) in the environment of that command. Data lives in the `nyaypath-data` volume: **back it up** (copy `/data/nyaypath.db` while the app is idle, or use `sqlite3 .backup`).

> The Docker files have not been exercised in CI yet. Please report problems.

## Without Docker

```bash
npm ci && npm run build
DATABASE_URL=... SESSION_SECRET=... npx prisma db push
ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
node .next/standalone/server.js   # copy .next/static and public next to it, as in the Dockerfile
```

Never run `npm run db:seed` on a real database; it wipes data and refuses to run when `NODE_ENV=production`.

## PostgreSQL

In `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`, set `DATABASE_URL`, then run `npx prisma db push` (or create migrations with `prisma migrate dev` for a team workflow). The code has no SQLite-specific queries. Note that name/phone search uses case-sensitive `contains` on SQLite; on PostgreSQL add `mode: "insensitive"` in `src/app/admin/(app)/clients/page.tsx`.

## Reverse proxy and rate limiting

- Serve over HTTPS (session cookies are `Secure` in production).
- Login and tracking attempts are rate limited **in memory, per process**. With several instances, move this to Redis. The client address comes from `X-Forwarded-For`; make your proxy **overwrite** that header rather than append to it, or it can be spoofed.

## Before you go live

- [ ] Strong `SESSION_SECRET`, HTTPS, backups
- [ ] Remove demo users; create real administrators
- [ ] Have a lawyer review each guide, then set `reviewedBy`
- [ ] Phone/visit each directory entry, then set `verified: true`; add local services for your districts
- [ ] Set a data-retention policy and tell users (see the Privacy page text)
