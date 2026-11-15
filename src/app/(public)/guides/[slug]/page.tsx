import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { getT } from "@/lib/i18n";
import { CATEGORY_LABELS } from "@/lib/categories";
import { DOCUMENTS, GUIDES, getGuide } from "@/content/guides";
import { digits, formatDate } from "@/lib/format";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  const { lang } = await getT();
  return g ? { title: g.title[lang], description: g.summary[lang] } : {};
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const { t, lang } = await getT();
  const docs = DOCUMENTS[guide.category][lang];

  return (
    <article className="prose-page py-12">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t.guides.back}
      </Link>
      <p className="mt-6"><span className="badge badge-brand">{CATEGORY_LABELS[guide.category][lang]}</span></p>
      <h1 className="h1 mt-3">{guide.title[lang]}</h1>
      <p className="muted mt-3 text-lg">{guide.summary[lang]}</p>

      {guide.reviewedBy === null ? (
        <p className="mt-6 flex gap-3 rounded-2xl bg-warn-soft p-4 text-sm" role="note">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <span>{t.guides.draftBanner}</span>
        </p>
      ) : (
        <p className="mt-6 text-sm text-soft">{t.guides.reviewed}: {guide.reviewedBy}</p>
      )}

      <div className="mt-10 space-y-4 text-lg">
        {guide.rights[lang].map((p) => <p key={p}>{p}</p>)}
      </div>

      <section className="mt-10" aria-labelledby="steps">
        <h2 id="steps" className="h2">{t.guides.stepsHeading}</h2>
        <ol className="mt-4 space-y-3">
          {guide.steps[lang].map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink" aria-hidden="true">{digits(i + 1, lang)}</span>
              <span className="text-lg">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-10">
        <h2 className="h3">{t.guides.bringHeading}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          {docs.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="h3">{t.guides.sourcesHeading}</h2>
        <ul className="muted mt-2 list-disc space-y-1 pl-6">
          {guide.sources.map((s) => <li key={s.en}>{s[lang]}</li>)}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link href={`/find-help?c=${guide.category}`} className="btn btn-primary">{t.guides.helpCta}</Link>
        <p className="muted text-sm">{t.guides.notAdvice} {t.guides.updated}: {formatDate(guide.updated, lang)}</p>
      </div>
    </article>
  );
}
