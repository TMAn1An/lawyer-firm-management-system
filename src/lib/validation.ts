import { z } from "zod";
import { CATEGORIES } from "./categories";
import { DISTRICTS } from "./districts";
import { isValidDateString } from "./rules";

/** Accepts 01712345678, +8801712345678 and 8801712345678; returns the 11-digit local form. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/[\s-]/g, "").replace(/^\+?88/, "");
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

const bnDigits = "০১২৩৪৫৬৭৮৯";
/** People often type Bangla digits; convert before validating. */
export function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(bnDigits.indexOf(d)));
}

const phone = z
  .string()
  .transform((v) => normalizePhone(toAsciiDigits(v)))
  .refine((v): v is string => v !== null, { message: "phone" });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const helpRequestSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  phone,
  email: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, { message: "email" }),
  district: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || DISTRICTS.some((d) => d.en === v), { message: "district" }),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "category" }) }),
  summary: z.string().trim().min(20, "summary").max(1000, "summary"),
  preferredDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || isValidDateString(v), { message: "date" }),
  mode: z.enum(["IN_PERSON", "PHONE"]),
  consent: z.literal("on", { errorMap: () => ({ message: "consent" }) }),
  /** Honeypot: real people never see or fill this field. */
  company: optionalText(200),
});

export type HelpRequestInput = z.infer<typeof helpRequestSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

export const trackSchema = z.object({
  ref: z.string().trim().min(4).max(20),
  pin: z.string().trim().regex(/^\d{6}$/),
});

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10, "password").max(200),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const volunteerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? normalizePhone(toAsciiDigits(v)) ?? "invalid" : undefined))
    .refine((v) => v !== "invalid", { message: "phone" }),
  email: z.string().trim().max(120).optional().refine((v) => !v || z.string().email().safeParse(v).success, { message: "email" }),
  availability: z.enum(["AVAILABLE", "BUSY", "ON_LEAVE"]),
});
