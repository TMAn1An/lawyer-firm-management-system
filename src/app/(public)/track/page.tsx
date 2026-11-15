import type { Metadata } from "next";
import { getT } from "@/lib/i18n";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { TrackForm } from "./TrackForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.track.title, robots: { index: false } };
}

export default async function TrackPage() {
  const { t, lang } = await getT();
  const categories = Object.fromEntries(CATEGORIES.map((c) => [c, CATEGORY_LABELS[c][lang]]));
  return (
    <div className="prose-page py-12">
      <h1 className="h1">{t.track.title}</h1>
      <p className="muted mt-3 mb-8 text-lg">{t.track.intro}</p>
      <TrackForm lang={lang} t={t.track} modes={t.request.modes} categories={categories} siteName={t.site.name} />
    </div>
  );
}
