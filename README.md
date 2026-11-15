# ন্যায়পথ · NyayPath

**Know your rights. Find free legal help.**
A free, open-source web app that helps people in Bangladesh understand their legal rights, find free legal-aid services, and request a free consultation from volunteers. It also includes a back office for the organisation that runs it.

> Started as a university DBMS project (a law-firm management system). Rebuilt as a public-interest tool.

## Why it is not a "law firm website"

Advertising by lawyers is not permitted in Bangladesh, so NyayPath is designed so that it **cannot** become an advertising channel:

- It lists **organisations only** (government, non-profit, helplines), never individual lawyers or firms.
- Listings are **alphabetical**: no ratings, rankings, featured slots or paid placement.
- It is **free**: no fees, no payment collection, no ads, no trackers.
- Volunteer lawyers are **internal records**, never shown publicly.

## Features

**For the public** (Bangla by default, English toggle, works on phones and low bandwidth)
- Plain-language guides to common problems: arrest, GD/FIR, domestic violence, family law, land, labour, consumer rights, RTI, and how to get government legal aid
- "Find help" by topic and district: the relevant guide, a checklist of documents to bring, and free services that can help
- Request a free consultation with no account. You get a reference code and a private PIN, and track the request with those, not your phone number
- Printable appointment slip; cancel your own request

**For the organisation** (`/admin`)
- Dashboard: waiting requests, today's schedule, open cases
- Schedule appointments with conflict prevention (no double-booking, daily cap per volunteer, Sunday to Thursday, Dhaka time)
- Cases with internal notes, volunteers, people helped, staff accounts (Admin / Staff), audit log
- Right to erasure: anonymise a person's details while keeping statistics

## Tech stack

Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Prisma · SQLite / Turso (libSQL) · Zod · Vitest · Docker

## Quick start

Requires Node.js 20.9+. No database server needed locally: it uses a SQLite file.

```bash
git clone https://github.com/TMAn1An/lawyer-firm-management-system.git nyaypath
cd nyaypath
npm install
cp .env.example .env
npm run db:migrate           # creates the local SQLite file dev.db
npm run db:seed              # fictional demo data (development only)
npm run dev          # http://localhost:3000
```

Demo staff sign-in: `admin@example.org` / `demo-password-123`. Demo tracking: code `NP-DEMO22`, PIN `123456`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests (scheduling rules, validation, codes) |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` (local file or Turso) |
| `npm run db:migrate:new` | Create a new migration after changing `schema.prisma` |
| `npm run db:reset` | Wipe and re-seed the dev database |
| `npm run admin:create` | Create the first administrator on a real database |

## Deploying

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Vercel + Turso, Docker, environment variables, backups, and reverse-proxy notes.

## Content and legal review

Guides live in `src/content/guides.ts` and the directory in `src/content/providers.json`, so they can be improved with a pull request. **All guides currently show a "community draft, not yet reviewed" banner and all directory entries are marked "details not yet checked".** Before launching publicly, a lawyer should review the guides (then set `reviewedBy`) and someone should phone each listed service and set `verified: true`. Never present this site as legal advice.

## Project layout

```
prisma/            schema + demo seed
src/app/(public)/  public pages (home, guides, find-help, request, track, about, privacy)
src/app/admin/     staff area (dashboard, requests, cases, clients, volunteers, team)
src/lib/           rules (scheduling), validation, auth, i18n, rate limiting
src/content/       guides and provider directory (edit these to contribute)
docs/              deployment and design notes
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Lawyers, paralegals, translators and designers are as welcome as developers.

## Licence

[MIT](LICENSE)
