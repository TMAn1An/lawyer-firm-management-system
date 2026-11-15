import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.admin.login.title, robots: { index: false, follow: false } };
}

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const { t } = await getT();
  return (
    <main className="prose-page flex min-h-screen max-w-md flex-col justify-center py-12">
      <Link href="/" className="flex items-center gap-2.5 text-xl font-bold"><Logo />{t.site.name}</Link>
      <h1 className="h1 mt-6">{t.admin.login.title}</h1>
      <LoginForm t={t.admin.login} />
    </main>
  );
}
