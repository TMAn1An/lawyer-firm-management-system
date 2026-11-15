/**
 * Demo data for development and screenshots. All people and phone numbers are fictional.
 * Never run this against a real database: it wipes existing records.
 */
import bcrypt from "bcryptjs";
import { addDays, isWorkingDay, todayInDhaka } from "../src/lib/rules";
import { caseNumber } from "../src/lib/codes";

import { createPrisma } from "../src/lib/db-client";

const db = createPrisma();

/** Next working day on or after `from`, so seeded appointments are always schedulable. */
function workingDay(from: string, offset = 0): string {
  let d = addDays(from, offset);
  while (!isWorkingDay(d)) d = addDays(d, 1);
  return d;
}

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed a production database.");

  await db.auditLog.deleteMany();
  await db.caseNote.deleteMany();
  await db.case.deleteMany();
  await db.helpRequest.deleteMany();
  await db.client.deleteMany();
  await db.volunteer.deleteMany();
  await db.user.deleteMany();

  const demoPassword = process.env.SEED_ADMIN_PASSWORD ?? "demo-password-123";
  const hash = await bcrypt.hash(demoPassword, 10);
  const admin = await db.user.create({ data: { email: "admin@example.org", name: "Demo Admin", role: "ADMIN", passwordHash: hash } });
  await db.user.create({ data: { email: "staff@example.org", name: "Demo Staff", role: "STAFF", passwordHash: hash } });

  const volunteers = await Promise.all(
    [
      { name: "Nusrat Jahan", categories: "FAMILY,VIOLENCE", phone: "01700000011", availability: "AVAILABLE" },
      { name: "Abdul Karim", categories: "LAND,CRIMINAL", phone: "01700000012", availability: "AVAILABLE" },
      { name: "Shirin Akter", categories: "LABOUR,CONSUMER", phone: "01700000013", availability: "AVAILABLE" },
      { name: "Tanvir Hasan", categories: "RTI,OTHER", phone: "01700000014", availability: "BUSY" },
      { name: "Farhana Rahman", categories: "FAMILY,LAND", phone: "01700000015", availability: "ON_LEAVE" },
    ].map((v) => db.volunteer.create({ data: v })),
  );

  const people = [
    ["Rahima Begum", "01700000101", "Mymensingh"],
    ["Mizanur Rahman", "01700000102", "Dhaka"],
    ["Salma Khatun", "01700000103", "Rajshahi"],
    ["Jahid Hossain", "01700000104", "Chattogram"],
    ["Parvin Sultana", "01700000105", "Khulna"],
    ["Rafiqul Islam", "01700000106", "Sylhet"],
    ["Shapla Rani Das", "01700000107", "Barishal"],
    ["Kamal Uddin", "01700000108", "Cumilla"],
    ["Morium Akter", "01700000109", "Gazipur"],
    ["Hasan Mahmud", "01700000110", "Rangpur"],
  ] as const;
  const clients = await Promise.all(people.map(([name, phone, district]) => db.client.create({ data: { name, phone, district } })));

  const today = todayInDhaka();
  const pin = await bcrypt.hash("123456", 10);
  const d1 = workingDay(today, 0);
  const d2 = workingDay(today, 1);
  const d3 = workingDay(today, 3);

  type Seed = { c: number; category: string; summary: string; status: string; v?: number; date?: string; slot?: string; mode?: string; ageDays: number; ref: string; note?: string };
  const requests: Seed[] = [
    { c: 0, category: "LAND", summary: "My elder brother is refusing to give me my share of our late father's land and says the namjari is in his name only.", status: "SUBMITTED", ageDays: 4, ref: "NP-DEMO22" },
    { c: 1, category: "LABOUR", summary: "My factory has not paid three months of wages and told us to wait. I have no appointment letter.", status: "SUBMITTED", ageDays: 2, ref: "NP-TQ4R7K" },
    { c: 2, category: "FAMILY", summary: "My husband left two years ago and does not pay anything for our child. I have the kabinnama.", status: "CONFIRMED", v: 0, date: d1, slot: "10:00", ageDays: 5, ref: "NP-H8WM3C", note: "Please bring your kabinnama and your child's birth certificate." },
    { c: 3, category: "CRIMINAL", summary: "My son was arrested last night and we do not know which charges are filed or how to get a lawyer.", status: "CONFIRMED", v: 1, date: d1, slot: "11:00", mode: "PHONE", ageDays: 1, ref: "NP-9KX2PD" },
    { c: 4, category: "VIOLENCE", summary: "I face regular abuse at home and want to know about a protection order and where I can stay safely.", status: "CONFIRMED", v: 0, date: d2, slot: "09:00", ageDays: 3, ref: "NP-C5ZN8F" },
    { c: 5, category: "CONSUMER", summary: "I bought a refrigerator that stopped working after two weeks and the shop refuses to replace it.", status: "COMPLETED", v: 2, date: addDays(today, -6), slot: "14:00", ageDays: 12, ref: "NP-M3VB6J" },
    { c: 6, category: "RTI", summary: "I want to know the status of my allowance application at the Upazila office. They have not replied for months.", status: "COMPLETED", v: 3, date: addDays(today, -9), slot: "15:00", ageDays: 16, ref: "NP-W7DE4H" },
    { c: 7, category: "LAND", summary: "A neighbour is building on part of my land. I have my deed and khajna receipts.", status: "CONFIRMED", v: 1, date: d3, slot: "12:00", ageDays: 2, ref: "NP-R2GA9S" },
    { c: 8, category: "FAMILY", summary: "My in-laws are asking for dowry again and threatening my daughter. What can we do legally?", status: "CANCELLED", ageDays: 8, ref: "NP-J6TQ5X" },
    { c: 9, category: "LABOUR", summary: "I was dismissed without notice after reporting unsafe machines at my workplace.", status: "NO_SHOW", v: 2, date: addDays(today, -4), slot: "16:00", ageDays: 10, ref: "NP-B4YC2N" },
  ];

  const created = [];
  for (const r of requests) {
    created.push(
      await db.helpRequest.create({
        data: {
          refCode: r.ref,
          pinHash: pin,
          clientId: clients[r.c].id,
          category: r.category,
          summary: r.summary,
          district: people[r.c][2],
          status: r.status,
          mode: r.mode ?? "IN_PERSON",
          volunteerId: r.v !== undefined ? volunteers[r.v].id : null,
          date: r.date ?? null,
          slot: r.slot ?? null,
          publicNote: r.note ?? null,
          consentAt: new Date(),
          createdAt: new Date(Date.now() - r.ageDays * 86_400_000),
        },
      }),
    );
  }

  const year = new Date().getFullYear();
  const case1 = await db.case.create({
    data: { caseNo: caseNumber(year, 1), title: "Consumer rights: Rafiqul Islam", category: "CONSUMER", status: "CLOSED", outcome: "Seller agreed to replace the refrigerator after a written complaint.", clientId: clients[5].id, volunteerId: volunteers[2].id, requestId: created[5].id, closedAt: new Date() },
  });
  const case2 = await db.case.create({
    data: { caseNo: caseNumber(year, 2), title: "Right to information: Shapla Rani Das", category: "RTI", status: "IN_PROGRESS", clientId: clients[6].id, volunteerId: volunteers[3].id, requestId: created[6].id },
  });
  await db.caseNote.createMany({
    data: [
      { caseId: case1.id, authorId: admin.id, body: "Reviewed receipt and warranty card. Drafted a written complaint to the seller." },
      { caseId: case1.id, authorId: admin.id, body: "Seller replied and agreed to a replacement. Closing." },
      { caseId: case2.id, authorId: admin.id, body: "Helped fill in the RTI application form. Submitted to the Designated Officer; the 20-working-day clock is running." },
    ],
  });

  console.log("Seeded demo data.");
  console.log(`  Staff sign-in:   admin@example.org / ${demoPassword}   (also staff@example.org)`);
  console.log("  Public tracking: code NP-DEMO22, PIN 123456");
}

main().finally(() => db.$disconnect());
