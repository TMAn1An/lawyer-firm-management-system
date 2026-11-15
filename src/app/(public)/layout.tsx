import Link from "next/link";
import { getT } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { LangSwitch } from "@/components/LangSwitch";
import { EmergencyBar } from "@/components/EmergencyBar";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const { t, lang } = await getT();
  const links = [
    { href: "/guides", label: t.nav.guides },
    { href: "/find-help", label: t.nav.findHelp },
    { href: "/request", label: t.nav.request },
    { href: "/track", label: t.nav.track },
    { href: "/about", label: t.nav.about },
  ];
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="no-print sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2">
        {t.nav.skip}
      </a>
      <EmergencyBar />
      <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="page flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
            <span>{t.site.name}</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-2">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitch current={lang} label={t.nav.language} />
            <details className="relative lg:hidden">
              <summary className="btn btn-secondary btn-sm cursor-pointer list-none">{t.nav.menu}</summary>
              <nav aria-label="Mobile" className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-surface p-2 shadow-lg">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-surface-2">
                    {l.label}
                  </Link>
                ))}
              </nav>
            </details>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="no-print mt-16 border-t border-line bg-surface">
        <div className="page grid gap-6 py-10 sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold"><Logo className="h-6 w-6" />{t.site.name}</p>
            <p className="muted mt-2 text-sm">{t.site.tagline}</p>
          </div>
          <ul className="space-y-1 text-sm">
            <li><Link className="hover:underline" href="/about">{t.nav.about}</Link></li>
            <li><Link className="hover:underline" href="/privacy">{t.nav.privacy}</Link></li>
            <li><Link className="hover:underline" href="/admin">{t.nav.staff}</Link></li>
          </ul>
          <ul className="muted space-y-1 text-sm">
            <li>{t.footer.notAdvice}</li>
            <li>{t.footer.noAds}</li>
            <li>{t.footer.source}</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
