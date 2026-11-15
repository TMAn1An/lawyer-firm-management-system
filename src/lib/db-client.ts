import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

/**
 * One way to reach the database everywhere: through the libSQL adapter.
 * DATABASE_URL is `file:./dev.db` locally and `libsql://…turso.io` (with DATABASE_AUTH_TOKEN) in production.
 * Kept free of framework imports so scripts and the seed can share it.
 */
export function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  const adapter = new PrismaLibSQL({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  return new PrismaClient({ adapter });
}
