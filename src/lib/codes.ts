import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

// No 0/O/1/I/L so codes can be read out over the phone without mistakes.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateRefCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `NP-${s}`;
}

export function generatePin(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function normalizeRefCode(input: string): string {
  const s = input.trim().toUpperCase().replace(/\s+/g, "");
  return s.startsWith("NP-") ? s : s.startsWith("NP") ? `NP-${s.slice(2)}` : `NP-${s}`;
}

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function caseNumber(year: number, sequence: number): string {
  return `C-${year}-${String(sequence).padStart(4, "0")}`;
}
