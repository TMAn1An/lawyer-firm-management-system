import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, ExternalLink, FolderOpen, Inbox, LayoutDashboard, LogOut, UserCog, Users } from "lucide-react";
import { getT } from "@/lib/i18n";
import { destroySession, requireUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { t, lang } = await getT();

  async function signOut() {
    "use server";
    await destroySession();
    redirect("/admin/login");
  }

  const nav = [
    { href: "/admin", label: t.admin.nav.dashboard, Icon: LayoutDashboard },
    { href: "/admin/requests", label: t.admin.nav.requests, Icon: Inbox },
    { href: "/admin/cases", label: t.admin.nav.cases, Icon: FolderOpen },
    { href: "/admin/clients", label: t.admin.nav.clients, Icon: Users },
    { href: "/admin/volunteers", label: t.admin.nav.volunteers, Icon: Briefcase },
    ...(user.role === "ADMIN" ? [{ href: "/admin/team", label: t.admin.nav.team, Icon: UserCog }] : []),
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="no-print border-b border-line bg-surface lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <Link href="/admin" className="flex items-center gap-2.5 text-lg font-bold"><Logo />{t.site.name}</Link>
          <div className="flex items-center gap-2 lg:mt-4"><LangSwitch current={lang} label={t.nav.language} /></div>
        </div>
        <nav aria-label="Staff" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {nav.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2">
              <Icon className="h-5 w-5 text-brand" aria-hidden="true" /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-line p-4 text-sm lg:block">
          <p className="font-semibold">{user.name}</p>
          <p className="muted break-all">{user.email}</p>
          <Link href="/" className="mt-3 flex items-center gap-2 text-brand hover:underline"><ExternalLink className="h-4 w-4" aria-hidden="true" />{t.admin.nav.site}</Link>
          <form action={signOut}>
            <button type="submit" className="mt-1 flex items-center gap-2 text-danger hover:underline"><LogOut className="h-4 w-4" aria-hidden="true" />{t.admin.nav.signOut}</button>
          </form>
        </div>
      </aside>
      <main id="main" className="min-w-0 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
