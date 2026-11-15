"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";

/** Right to erasure: remove personal details but keep anonymous records for statistics. */
export async function eraseClient(id: string) {
  const admin = await requireAdmin();
  await db.$transaction([
    db.client.update({
      where: { id },
      data: { name: "Erased", phone: `erased-${id}`, email: null, district: null },
    }),
    db.helpRequest.updateMany({ where: { clientId: id }, data: { summary: "[erased]", publicNote: null } }),
  ]);
  await audit(admin.id, "CLIENT_ERASE", "Client", id);
  redirect(`/admin/clients/${id}?ok=1`);
}
