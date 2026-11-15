/**
 * Applies the SQL files in prisma/migrations to DATABASE_URL (a local file or a Turso database).
 * `prisma migrate deploy` cannot talk to Turso, so this small runner is used everywhere for consistency.
 * Applied migrations are recorded in the `_migrations` table; running it again is a no-op.
 *
 * Create new migrations in development with `npm run db:migrate:new` (Prisma writes the SQL file).
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });

  await db.execute("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const done = new Set((await db.execute("SELECT name FROM _migrations")).rows.map((r) => String(r.name)));

  const dir = join(process.cwd(), "prisma", "migrations");
  const names = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];

  let applied = 0;
  for (const name of names) {
    if (done.has(name)) continue;
    const sql = readFileSync(join(dir, name, "migration.sql"), "utf8");
    // Run the whole migration atomically: either every statement lands or none does.
    await db.executeMultiple(`BEGIN;\n${sql}\nINSERT INTO _migrations (name, applied_at) VALUES ('${name.replace(/'/g, "''")}', datetime('now'));\nCOMMIT;`);
    console.log(`applied ${name}`);
    applied++;
  }
  console.log(applied ? `${applied} migration(s) applied.` : "Database is up to date.");
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
