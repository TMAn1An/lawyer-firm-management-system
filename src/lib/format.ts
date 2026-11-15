import type { Lang } from "./i18n";
import { TIME_ZONE } from "./rules";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function digits(value: string | number, lang: Lang): string {
  const s = String(value);
  return lang === "bn" ? s.replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : s;
}

export function formatDate(date: string | Date, lang: Lang): string {
  const d = typeof date === "string" ? new Date(`${date}T00:00:00Z`) : date;
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: typeof date === "string" ? "UTC" : TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTime(slot: string, lang: Lang): string {
  const [h, m] = slot.split(":").map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-US", { timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true }).format(d);
}

export function formatDateTime(d: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function maskPhone(phone: string): string {
  return phone.length >= 11 ? `${phone.slice(0, 3)}••••${phone.slice(-4)}` : phone;
}
