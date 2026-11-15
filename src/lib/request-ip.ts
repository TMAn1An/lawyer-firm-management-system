import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client address for rate limiting. Behind a reverse proxy, make sure it overwrites
 * (not appends to) X-Forwarded-For, otherwise this value can be spoofed. See docs/DEPLOYMENT.md.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
