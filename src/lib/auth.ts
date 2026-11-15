import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE = "np_session";
const MAX_AGE_SEC = 60 * 60 * 8;

export type SessionUser = { id: string; name: string; email: string; role: "ADMIN" | "STAFF" };

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET ?? "";
  if (process.env.NODE_ENV === "production" && (s.length < 32 || s.startsWith("change-me"))) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters in production.");
  }
  return new TextEncoder().encode(s || "dev-only-insecure-secret-do-not-use-in-production");
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Verifies the cookie and re-checks the account is still active, so deactivation takes effect immediately. */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.active) return null;
    return { id: user.id, name: user.name, email: user.email, role: user.role as SessionUser["role"] };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin");
  return user;
}

export async function audit(actorId: string | null, action: string, entity: string, entityId?: string, meta?: Record<string, unknown>) {
  await db.auditLog.create({
    data: { actorId, action, entity, entityId, meta: meta ? JSON.stringify(meta) : null },
  });
}
