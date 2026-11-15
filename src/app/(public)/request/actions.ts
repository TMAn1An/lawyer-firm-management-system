"use server";

import { clientIp } from "@/lib/request-ip";
import { db } from "@/lib/db";
import { helpRequestSchema } from "@/lib/validation";
import { generatePin, generateRefCode, hashPin } from "@/lib/codes";
import { rateLimit } from "@/lib/rate-limit";
import { addDays, isWorkingDay, todayInDhaka, MAX_DAYS_AHEAD } from "@/lib/rules";

export type RequestFormState =
  | { status: "idle" }
  | { status: "error"; errors: Partial<Record<string, string>>; values: Record<string, string> }
  | { status: "success"; ref: string; pin: string };

/** At most this many unanswered requests per phone number, to stop spam and accidental duplicates. */
const MAX_OPEN_PER_PHONE = 3;

export async function submitHelpRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && k !== "company") values[k] = v;

  const ip = await clientIp();
  if (!rateLimit(`request:${ip}`, 5, 60 * 60 * 1000).ok) {
    return { status: "error", errors: { form: "tooMany" }, values };
  }

  // Honeypot: a hidden field that only bots fill in. Pretend it worked so they do not adapt.
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { status: "success", ref: generateRefCode(), pin: generatePin() };
  }

  const parsed = helpRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!errors[field]) errors[field] = issue.message in KNOWN ? issue.message : field;
    }
    return { status: "error", errors, values };
  }
  const data = parsed.data;

  if (data.preferredDate) {
    const today = todayInDhaka();
    if (data.preferredDate < today) return { status: "error", errors: { preferredDate: "pastDate" }, values };
    if (data.preferredDate > addDays(today, MAX_DAYS_AHEAD)) return { status: "error", errors: { preferredDate: "tooFar" }, values };
    if (!isWorkingDay(data.preferredDate)) return { status: "error", errors: { preferredDate: "workingDay" }, values };
  }

  try {
    const existing = await db.client.findUnique({ where: { phone: data.phone } });
    if (existing) {
      const open = await db.helpRequest.count({ where: { clientId: existing.id, status: "SUBMITTED" } });
      if (open >= MAX_OPEN_PER_PHONE) return { status: "error", errors: { form: "tooMany" }, values };
    }
    // Never overwrite an existing person's name or email from an anonymous form.
    const client =
      existing ??
      (await db.client.create({
        data: { name: data.name, phone: data.phone, email: data.email, district: data.district },
      }));

    const pin = generatePin();
    const pinHash = await hashPin(pin);

    for (let attempt = 0; attempt < 5; attempt++) {
      const refCode = generateRefCode();
      try {
        await db.helpRequest.create({
          data: {
            refCode,
            pinHash,
            clientId: client.id,
            category: data.category,
            summary: data.summary,
            district: data.district,
            preferredDate: data.preferredDate,
            mode: data.mode,
            consentAt: new Date(),
          },
        });
        return { status: "success", ref: refCode, pin };
      } catch (e) {
        // Unique violation on refCode: draw another code.
        if (!(e instanceof Error) || !/Unique constraint/i.test(e.message)) throw e;
      }
    }
    return { status: "error", errors: { form: "generic" }, values };
  } catch (e) {
    console.error("submitHelpRequest failed", e);
    return { status: "error", errors: { form: "generic" }, values };
  }
}

const KNOWN: Record<string, true> = { name: true, phone: true, email: true, district: true, category: true, summary: true, date: true, consent: true };
