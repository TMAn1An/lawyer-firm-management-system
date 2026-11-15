import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

export function LangSwitch({ current, label }: { current: Lang; label: string }) {
  async function toggle() {
    "use server";
    const next: Lang = current === "bn" ? "en" : "bn";
    (await cookies()).set(LANG_COOKIE, next, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    revalidatePath("/", "layout");
  }
  return (
    <form action={toggle}>
      <button type="submit" className="btn btn-secondary btn-sm" lang={current === "bn" ? "en" : "bn"} aria-label={label}>
        {label}
      </button>
    </form>
  );
}
