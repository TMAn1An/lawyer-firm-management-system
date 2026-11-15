"use server";

import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { normalizeRefCode, verifyPin } from "@/lib/codes";
import { trackSchema } from "@/lib/validation";
import { toAsciiDigits } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import { canTransition, type RequestStatus } from "@/lib/rules";

export type TrackResult = {
  ref: string;
  status: RequestStatus;
  category: string;
  mode: string;
  date: string | null;
  slot: string | null;
  volunteer: string | null;
  publicNote: string | null;
  createdAt: string;
  district: string | null;
};

export type TrackState =
  | { status: "idle" }
  | { status: "error"; error: "notFound" | "tooMany"; ref: string }
  | { status: "found"; result: TrackResult; pin: string };

// A fixed hash lets us spend the same time whether or not the code exists.
const DUMMY_HASH = bcrypt.hashSync("000000", 10);

type WithVolunteer = Prisma.HelpRequestGetPayload<{ include: { volunteer: true } }>;
type Lookup = { error: "notFound" | "tooMany" } | { req: WithVolunteer; pin: string };

async function lookup(refInput: string, pinInput: string): Promise<Lookup> {
  const parsed = trackSchema.safeParse({ ref: refInput, pin: toAsciiDigits(pinInput) });
  if (!parsed.success) return { error: "notFound" };

  const ip = await clientIp();
  const ref = normalizeRefCode(parsed.data.ref);
  // Per-address and per-code limits: a 6-digit PIN must not be guessable by brute force.
  if (!rateLimit(`track:ip:${ip}`, 15, 10 * 60 * 1000).ok || !rateLimit(`track:ref:${ref}`, 5, 15 * 60 * 1000).ok) {
    return { error: "tooMany" };
  }

  const req = await db.helpRequest.findUnique({ where: { refCode: ref }, include: { volunteer: true } });
  const ok = await verifyPin(parsed.data.pin, req?.pinHash ?? DUMMY_HASH);
  if (!req || !ok) return { error: "notFound" };
  return { req, pin: parsed.data.pin };
}

function toResult(req: WithVolunteer): TrackResult {
  return {
    ref: req.refCode,
    status: req.status as RequestStatus,
    category: req.category,
    mode: req.mode,
    date: req.date,
    slot: req.slot,
    volunteer: req.volunteer?.name ?? null,
    publicNote: req.publicNote,
    createdAt: req.createdAt.toISOString(),
    district: req.district,
  };
}

export async function trackRequest(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const found = await lookup(String(formData.get("ref") ?? ""), String(formData.get("pin") ?? ""));
  if ("error" in found) return { status: "error", error: found.error, ref: String(formData.get("ref") ?? "") };
  return { status: "found", result: toResult(found.req), pin: found.pin };
}

export async function cancelOwnRequest(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const found = await lookup(String(formData.get("ref") ?? ""), String(formData.get("pin") ?? ""));
  if ("error" in found) return { status: "error", error: found.error, ref: String(formData.get("ref") ?? "") };
  let req = found.req;
  if (canTransition(req.status as RequestStatus, "CANCELLED")) {
    req = await db.helpRequest.update({
      where: { id: req.id },
      data: { status: "CANCELLED", date: null, slot: null },
      include: { volunteer: true },
    });
  }
  return { status: "found", result: toResult(req), pin: found.pin };
}
