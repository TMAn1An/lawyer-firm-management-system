"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { audit, requireUser } from "@/lib/auth";
import { volunteerSchema } from "@/lib/validation";
import { isCategory } from "@/lib/categories";

export async function addVolunteer(formData: FormData) {
  const user = await requireUser();
  const parsed = volunteerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    availability: formData.get("availability") ?? "AVAILABLE",
  });
  if (!parsed.success) redirect("/admin/volunteers?error=invalid");
  const categories = formData.getAll("categories").map(String).filter(isCategory).join(",");
  const v = await db.volunteer.create({
    data: { name: parsed.data.name, phone: parsed.data.phone, email: parsed.data.email || null, availability: parsed.data.availability, categories },
  });
  await audit(user.id, "VOLUNTEER_CREATE", "Volunteer", v.id);
  redirect("/admin/volunteers?ok=1");
}

export async function setAvailability(id: string, formData: FormData) {
  const user = await requireUser();
  const availability = String(formData.get("availability"));
  if (!["AVAILABLE", "BUSY", "ON_LEAVE"].includes(availability)) redirect("/admin/volunteers?error=invalid");
  await db.volunteer.update({ where: { id }, data: { availability } });
  await audit(user.id, "VOLUNTEER_AVAILABILITY", "Volunteer", id, { availability });
  redirect("/admin/volunteers?ok=1");
}

export async function toggleVolunteer(id: string) {
  const user = await requireUser();
  const v = await db.volunteer.findUnique({ where: { id } });
  if (!v) redirect("/admin/volunteers");
  await db.volunteer.update({ where: { id }, data: { active: !v!.active } });
  await audit(user.id, v!.active ? "VOLUNTEER_DEACTIVATE" : "VOLUNTEER_ACTIVATE", "Volunteer", id);
  redirect("/admin/volunteers?ok=1");
}
