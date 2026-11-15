"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, requireAdmin } from "@/lib/auth";
import { staffSchema } from "@/lib/validation";

export async function addStaff(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/team?error=invalid");
  const { name, email, password, role } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) redirect("/admin/team?error=emailTaken");
  const u = await db.user.create({ data: { name, email, role, passwordHash: await bcrypt.hash(password, 12) } });
  await audit(admin.id, "USER_CREATE", "User", u.id, { role });
  redirect("/admin/team?ok=1");
}

export async function toggleStaff(id: string) {
  const admin = await requireAdmin();
  const user = await db.user.findUnique({ where: { id } });
  if (!user) redirect("/admin/team");
  if (user!.active && user!.role === "ADMIN") {
    const admins = await db.user.count({ where: { role: "ADMIN", active: true } });
    if (admins <= 1) redirect("/admin/team?error=lastAdmin");
  }
  await db.user.update({ where: { id }, data: { active: !user!.active } });
  await audit(admin.id, user!.active ? "USER_DEACTIVATE" : "USER_ACTIVATE", "User", id);
  redirect("/admin/team?ok=1");
}
