"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { audit, requireUser } from "@/lib/auth";
import { caseNumber } from "@/lib/codes";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import {
  canTransition,
  checkCapacity,
  maxPerDay,
  validateSchedule,
  type RequestStatus,
} from "@/lib/rules";

function back(id: string, params: Record<string, string>): never {
  const q = new URLSearchParams(params).toString();
  redirect(`/admin/requests/${id}${q ? `?${q}` : ""}`);
}

export async function scheduleRequest(id: string, formData: FormData) {
  const user = await requireUser();
  const volunteerId = String(formData.get("volunteerId") ?? "");
  const date = String(formData.get("date") ?? "");
  const slot = String(formData.get("slot") ?? "");
  const publicNote = String(formData.get("publicNote") ?? "").trim().slice(0, 500) || null;
  if (!volunteerId || !date || !slot) back(id, { error: "MISSING", v: volunteerId, d: date });

  const scheduleError = validateSchedule(date, slot);
  if (scheduleError) back(id, { error: scheduleError, v: volunteerId, d: date });

  // Check and write inside one transaction so two staff members cannot take the same slot.
  const result = await db.$transaction(async (tx) => {
    const req = await tx.helpRequest.findUnique({ where: { id } });
    if (!req) return "MISSING";
    if (!canTransition(req.status as RequestStatus, "CONFIRMED")) return "BAD_TRANSITION";

    const volunteer = await tx.volunteer.findUnique({ where: { id: volunteerId } });
    if (!volunteer || !volunteer.active || volunteer.availability === "ON_LEAVE") return "VOLUNTEER_UNAVAILABLE";

    const taken = await tx.helpRequest.findMany({
      where: { volunteerId, date, status: "CONFIRMED", NOT: { id } },
      select: { slot: true },
    });
    const conflict = checkCapacity(taken.map((r) => r.slot!).filter(Boolean), slot, maxPerDay());
    if (conflict) return conflict;

    await tx.helpRequest.update({
      where: { id },
      data: { status: "CONFIRMED", volunteerId, date, slot, publicNote },
    });
    return null;
  });

  if (result) back(id, { error: result, v: volunteerId, d: date });
  await audit(user.id, "SCHEDULE", "HelpRequest", id, { volunteerId, date, slot });
  revalidatePath("/admin", "layout");
  back(id, { ok: "1" });
}

export async function setRequestStatus(id: string, to: RequestStatus) {
  const user = await requireUser();
  const req = await db.helpRequest.findUnique({ where: { id } });
  if (!req) back(id, { error: "MISSING" });
  if (!canTransition(req!.status as RequestStatus, to)) back(id, { error: "BAD_TRANSITION" });
  await db.helpRequest.update({
    where: { id },
    // Cancelling frees the slot immediately.
    data: to === "CANCELLED" ? { status: to, date: null, slot: null } : { status: to },
  });
  await audit(user.id, `STATUS_${to}`, "HelpRequest", id);
  revalidatePath("/admin", "layout");
  back(id, { ok: "1" });
}

export async function saveRequestNote(id: string, formData: FormData) {
  const user = await requireUser();
  const publicNote = String(formData.get("publicNote") ?? "").trim().slice(0, 500) || null;
  await db.helpRequest.update({ where: { id }, data: { publicNote } });
  await audit(user.id, "NOTE", "HelpRequest", id);
  back(id, { ok: "1" });
}

export async function createCaseFromRequest(id: string) {
  const user = await requireUser();
  const req = await db.helpRequest.findUnique({ where: { id }, include: { client: true, case: true } });
  if (!req) back(id, { error: "MISSING" });
  if (req!.case) redirect(`/admin/cases/${req!.case.id}`);

  const year = new Date().getFullYear();
  const label = isCategory(req!.category) ? CATEGORY_LABELS[req!.category].en : req!.category;
  // Sequence number per year; retry on the unlikely race where two cases are opened at once.
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await db.case.count({ where: { caseNo: { startsWith: `C-${year}-` } } });
    try {
      const created = await db.case.create({
        data: {
          caseNo: caseNumber(year, count + 1 + attempt),
          title: `${label}: ${req!.client.name}`,
          category: req!.category,
          clientId: req!.clientId,
          volunteerId: req!.volunteerId,
          requestId: req!.id,
        },
      });
      await audit(user.id, "CASE_CREATE", "Case", created.id, { requestId: id });
      redirect(`/admin/cases/${created.id}`);
    } catch (e) {
      if (e instanceof Error && /Unique constraint/i.test(e.message)) continue;
      throw e;
    }
  }
  back(id, { error: "MISSING" });
}
