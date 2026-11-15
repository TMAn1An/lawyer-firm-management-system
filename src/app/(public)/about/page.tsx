import type { Metadata } from "next";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.about.title };
}

export default async function AboutPage() {
  const { t } = await getT();
  return (
    <div className="prose-page py-12">
      <h1 className="h1">{t.about.title}</h1>
      <div className="mt-6 space-y-4 text-lg">
        {t.about.body.map((p) => <p key={p}>{p}</p>)}
      </div>
      <section className="card mt-8 border-accent/40 bg-warn-soft">
        <h2 className="h3">{t.about.notAdviceTitle}</h2>
        <p className="mt-2">{t.about.notAdvice}</p>
      </section>
      <section className="mt-8">
        <h2 className="h2">{t.about.contributeTitle}</h2>
        <p className="mt-3 text-lg">{t.about.contribute}</p>
      </section>
    </div>
  );
}
