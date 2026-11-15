import { describe, expect, it } from "vitest";
import { helpRequestSchema, normalizePhone, toAsciiDigits } from "./validation";
import { generatePin, generateRefCode, normalizeRefCode, caseNumber } from "./codes";

describe("phone numbers", () => {
  it("normalises common formats", () => {
    expect(normalizePhone("01712345678")).toBe("01712345678");
    expect(normalizePhone("+8801712345678")).toBe("01712345678");
    expect(normalizePhone("8801712-345 678")).toBe("01712345678");
  });
  it("rejects invalid numbers", () => {
    expect(normalizePhone("0212345678")).toBeNull();
    expect(normalizePhone("01212345678")).toBeNull();
    expect(normalizePhone("abc")).toBeNull();
  });
  it("understands Bangla digits", () => {
    expect(normalizePhone(toAsciiDigits("০১৭১২৩৪৫৬৭৮"))).toBe("01712345678");
  });
});

describe("help request schema", () => {
  const valid = {
    name: "Rahima Begum",
    phone: "০১৭১২৩৪৫৬৭৮",
    category: "LAND",
    summary: "My brother is claiming my share of our father's land.",
    mode: "PHONE",
    consent: "on",
  };
  it("accepts a valid request and cleans the phone", () => {
    const r = helpRequestSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("01712345678");
  });
  it("requires consent", () => expect(helpRequestSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false));
  it("rejects a too-short summary", () => expect(helpRequestSchema.safeParse({ ...valid, summary: "help" }).success).toBe(false));
  it("rejects unknown categories and districts", () => {
    expect(helpRequestSchema.safeParse({ ...valid, category: "NOPE" }).success).toBe(false);
    expect(helpRequestSchema.safeParse({ ...valid, district: "Atlantis" }).success).toBe(false);
  });
});

describe("codes", () => {
  it("makes readable reference codes and 6-digit PINs", () => {
    expect(generateRefCode()).toMatch(/^NP-[2-9A-HJKMNP-Z]{6}$/);
    expect(generatePin()).toMatch(/^\d{6}$/);
  });
  it("normalises typed codes", () => {
    expect(normalizeRefCode(" np-ab12cd ")).toBe("NP-AB12CD");
    expect(normalizeRefCode("ab12cd")).toBe("NP-AB12CD");
  });
  it("formats case numbers", () => expect(caseNumber(2026, 7)).toBe("C-2026-0007"));
});
