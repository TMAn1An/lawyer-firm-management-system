"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, audit } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export type LoginState = { error?: "invalid" | "tooMany"; email?: string };

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  // React resets uncontrolled fields after an action; hand the email back so the user need not retype it.
  const typedEmail = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: "invalid", email: typedEmail };
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const ipKey = `login:ip:${ip}`;
  const emailKey = `login:email:${email}`;
  if (!rateLimit(ipKey, 20, 15 * 60 * 1000).ok || !rateLimit(emailKey, 6, 15 * 60 * 1000).ok) return { error: "tooMany", email };

  const user = await db.user.findUnique({ where: { email } });
  // Always run a hash comparison so response time does not reveal whether the email exists.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.active || !ok) return { error: "invalid", email };

  resetRateLimit(emailKey);
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role as "ADMIN" | "STAFF" });
  await audit(user.id, "LOGIN", "User", user.id);
  redirect("/admin");
}
