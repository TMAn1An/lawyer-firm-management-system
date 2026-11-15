import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, Search, Shield } from "lucide-react";
import { getT } from "@/lib/i18n";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { digits } from "@/lib/format";

export default async function HomePage() {
  const { t, lang } = await getT();
  const stepIcons = [Search, BookOpen, CalendarCheck];
  return (
    <>
      <section className="border-b border-line bg-brand-soft">
        <div className="page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <h1 className="h1 max-w-2xl">{t.home.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-lg text-soft">{t.home.heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/find-help" className="btn btn-primary">
                {t.home.ctaFind} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/guides" className="btn btn-secondary">{t.home.ctaGuides}</Link>
            </div>
          </div>
          <aside className="card" aria-label={t.emergency.title}>
            <p className="flex items-center gap-2 font-semibold"><Shield className="h-5 w-5 text-danger" aria-hidden="true" />{t.emergency.title}</p>
            <ul className="mt-4 space-y-3">
              {t.emergency.items.map((i) => (
                <li key={i.n} className="flex items-baseline gap-3">
                  <a href={`tel:${digits(i.n, "en")}`} className="min-w-16 text-2xl font-bold text-danger">{i.n}</a>
                  <span className="text-sm text-soft">{i.t}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="page py-14">
        <h2 className="h2">{t.home.topicsTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={`/find-help?c=${c}`} className="card flex h-full flex-col gap-2 transition-colors hover:bg-surface-2">
                <span className="text-brand"><CategoryIcon category={c} /></span>
                <span className="h3">{CATEGORY_LABELS[c][lang]}</span>
                <span className="muted text-sm">{CATEGORY_LABELS[c][lang === "bn" ? "hintBn" : "hintEn"]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="page py-14">
          <h2 className="h2">{t.home.howTitle}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {t.home.steps.map((s, i) => {
              const Icon = stepIcons[i];
              return (
                <li key={s.t} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="h3">{digits(i + 1, lang)}. {s.t}</h3>
                    <p className="muted mt-1">{s.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="page py-14">
        <h2 className="h2">{t.home.principlesTitle}</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {t.home.principles.map((p) => (
            <li key={p.t} className="card">
              <h3 className="h3">{p.t}</h3>
              <p className="muted mt-2">{p.d}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
