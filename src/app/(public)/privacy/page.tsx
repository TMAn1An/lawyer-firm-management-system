import type { Metadata } from "next";
import { getT } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.privacy.title };
}

export default async function PrivacyPage() {
  const { t } = await getT();
  return (
    <div className="prose-page py-12">
      <h1 className="h1">{t.privacy.title}</h1>
      <dl className="mt-8 space-y-6">
        {t.privacy.items.map((i) => (
          <div key={i.t}>
            <dt className="h3">{i.t}</dt>
            <dd className="muted mt-1 text-lg">{i.d}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
