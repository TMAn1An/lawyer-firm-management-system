import type { Metadata } from "next";
import Link from "next/link";
import { getT } from "@/lib/i18n";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { GUIDES } from "@/content/guides";
import { CategoryIcon } from "@/components/CategoryIcon";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.guides.title, description: t.guides.intro };
}

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { t, lang } = await getT();
  const { c } = await searchParams;
  const active = c && isCategory(c) ? c : undefined;
  const list = GUIDES.filter((g) => !active || g.category === active);
  return (
    <div className="page py-12">
      <h1 className="h1">{t.guides.title}</h1>
      <p className="muted mt-3 max-w-2xl text-lg">{t.guides.intro}</p>

      <nav aria-label={t.guides.title} className="mt-8 flex flex-wrap gap-2">
        <Link href="/guides" aria-current={!active ? "page" : undefined} className={`badge ${!active ? "badge-brand" : "badge-neutral"} px-4 py-2 text-sm`}>
          {t.guides.all}
        </Link>
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/guides?c=${cat}`} aria-current={active === cat ? "page" : undefined} className={`badge ${active === cat ? "badge-brand" : "badge-neutral"} px-4 py-2 text-sm`}>
            {CATEGORY_LABELS[cat][lang]}
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="muted mt-10">{t.guides.empty}</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="card flex h-full gap-4 transition-colors hover:bg-surface-2">
                <span className="mt-1 text-brand"><CategoryIcon category={g.category} /></span>
                <span>
                  <span className="badge badge-neutral">{CATEGORY_LABELS[g.category][lang]}</span>
                  <span className="h3 mt-2 block">{g.title[lang]}</span>
                  <span className="muted mt-1 block">{g.summary[lang]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
