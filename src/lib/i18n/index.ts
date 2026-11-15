import "server-only";
import { cookies } from "next/headers";
import { en, type Messages } from "./en";
import { bn } from "./bn";

export type Lang = "bn" | "en";
export const LANG_COOKIE = "np_lang";
const dictionaries: Record<Lang, Messages> = { en, bn };

/** Bangla is the default: the audience is people in Bangladesh. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return v === "en" ? "en" : "bn";
}

export async function getT(): Promise<{ t: Messages; lang: Lang }> {
  const lang = await getLang();
  return { t: dictionaries[lang], lang };
}

export function getMessages(lang: Lang): Messages {
  return dictionaries[lang];
}
