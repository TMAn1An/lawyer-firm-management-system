import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { DISTRICTS } from "@/lib/districts";
import { todayInDhaka } from "@/lib/rules";
import { RequestForm } from "./RequestForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.request.title, description: t.request.intro };
}

export default async function RequestPage({ searchParams }: { searchParams: Promise<{ c?: string; d?: string }> }) {
  const { t, lang } = await getT();
  const sp = await searchParams;
  return (
    <div className="prose-page py-12">
      <h1 className="h1">{t.request.title}</h1>
      <p className="muted mt-3 mb-8 text-lg">{t.request.intro}</p>
      <RequestForm
        lang={lang}
        t={t.request}
        siteName={t.site.name}
        today={todayInDhaka()}
        categories={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c][lang] }))}
        districts={DISTRICTS.map((d) => ({ value: d.en, label: d[lang] }))}
        defaults={{ category: sp.c && isCategory(sp.c) ? sp.c : undefined, district: sp.d && DISTRICTS.some((x) => x.en === sp.d) ? sp.d : undefined }}
      />
    </div>
  );
}
