/**
 * Creates the first administrator on a fresh (production) database.
 *   ADMIN_EMAIL=you@org.example ADMIN_NAME="Your Name" ADMIN_PASSWORD='long-password' npm run admin:create
 *
 * With --bootstrap (used during the Vercel build) it does nothing unless the database has no
 * users yet and the ADMIN_* variables are set, so it is safe to run on every deploy.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const bootstrap = process.argv.includes("--bootstrap");
  if (bootstrap) {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return console.log("bootstrap: ADMIN_* not set, skipping.");
    if ((await db.user.count()) > 0) return console.log("bootstrap: users already exist, skipping.");
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error(`An account for ${email} already exists.`);
  await db.user.create({ data: { email, name, role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  console.log(`Created administrator ${email}`);
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
