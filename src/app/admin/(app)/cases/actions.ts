"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, requireUser } from "@/lib/auth";

export async function addCaseNote(id: string, formData: FormData) {
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  if (!body) redirect(`/admin/cases/${id}`);
  await db.caseNote.create({ data: { caseId: id, authorId: user.id, body } });
  await audit(user.id, "CASE_NOTE", "Case", id);
  redirect(`/admin/cases/${id}?ok=1`);
}

export async function updateCase(id: string, formData: FormData) {
  const user = await requireUser();
  const status = String(formData.get("status") ?? "");
  if (!["OPEN", "IN_PROGRESS", "CLOSED"].includes(status)) redirect(`/admin/cases/${id}`);
  const outcome = String(formData.get("outcome") ?? "").trim().slice(0, 1000) || null;
  const existing = await db.case.findUnique({ where: { id } });
  if (!existing) redirect("/admin/cases");
  await db.case.update({
    where: { id },
    data: {
      status,
      outcome,
      closedAt: status === "CLOSED" ? existing!.closedAt ?? new Date() : null,
    },
  });
  await audit(user.id, `CASE_${status}`, "Case", id);
  redirect(`/admin/cases/${id}?ok=1`);
}
