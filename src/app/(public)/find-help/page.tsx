import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Globe, Clock, ShieldCheck, TriangleAlert } from "lucide-react";
import { getT } from "@/lib/i18n";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { DISTRICTS, districtLabel } from "@/lib/districts";
import { DOCUMENTS, guidesFor } from "@/content/guides";
import { listProviders } from "@/lib/providers";
import { digits } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t.find.title, description: t.find.intro };
}

export default async function FindHelpPage({ searchParams }: { searchParams: Promise<{ c?: string; d?: string }> }) {
  const { t, lang } = await getT();
  const sp = await searchParams;
  const category = sp.c && isCategory(sp.c) ? sp.c : undefined;
  const district = sp.d && DISTRICTS.some((x) => x.en === sp.d) ? sp.d : undefined;

  const guides = category ? guidesFor(category) : [];
  const providers = category ? listProviders({ category, district }) : [];

  return (
    <div className="page py-12">
      <h1 className="h1">{t.find.title}</h1>
      <p className="muted mt-3 max-w-2xl text-lg">{t.find.intro}</p>

      <form method="get" className="card mt-8 grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label htmlFor="c" className="label">{t.find.topic}</label>
          <select id="c" name="c" defaultValue={category ?? ""} required className="input">
            <option value="" disabled>{t.request.choose}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c][lang]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="d" className="label">{t.find.district}</label>
          <select id="d" name="d" defaultValue={district ?? ""} className="input">
            <option value="">{t.find.anyDistrict}</option>
            {DISTRICTS.map((d) => (
              <option key={d.en} value={d.en}>{d[lang]}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">{t.find.show}</button>
      </form>

      {category ? (
        <div className="mt-12 space-y-12">
          <h2 className="h2">
            {t.find.resultsFor} {CATEGORY_LABELS[category][lang]}
            {district ? <span className="muted font-normal"> · {districtLabel(district, lang)}</span> : null}
          </h2>

          {category === "VIOLENCE" || category === "CRIMINAL" ? (
            <section className="flex gap-3 rounded-2xl bg-danger-soft p-5 text-danger" role="alert">
              <TriangleAlert className="mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-bold">{t.find.dangerTitle}</p>
                <p className="mt-1 flex flex-wrap gap-x-6 text-lg font-bold">
                  {t.emergency.items.map((i) => (
                    <a key={i.n} href={`tel:${digits(i.n, "en")}`} className="underline">{i.n}</a>
                  ))}
                </p>
              </div>
            </section>
          ) : null}

          <section aria-labelledby="read-first">
            <h3 id="read-first" className="h3">{t.find.guidesTitle}</h3>
            {guides.length === 0 ? (
              <p className="muted mt-2">{t.find.noGuides}</p>
            ) : (
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="card block hover:bg-surface-2">
                      <span className="h3 block">{g.title[lang]}</span>
                      <span className="muted mt-1 block text-sm">{g.summary[lang]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="docs" className="card">
            <h3 id="docs" className="h3">{t.find.docsTitle}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              {DOCUMENTS[category][lang].map((d) => <li key={d}>{d}</li>)}
            </ul>
          </section>

          <section aria-labelledby="services">
            <h3 id="services" className="h3">{t.find.servicesTitle}</h3>
            <p className="muted mt-1 text-sm">{t.find.listNote}</p>
            {providers.length === 0 ? (
              <p className="mt-3">{t.find.noServices}</p>
            ) : (
              <ul className="mt-4 grid gap-4 md:grid-cols-2">
                {providers.map((p) => (
                  <li key={p.slug} className="card flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-neutral">{t.find.kinds[p.kind]}</span>
                      <span className={`badge ${p.free ? "badge-ok" : "badge-warn"}`}>{p.free ? t.find.free : t.find.paid}</span>
                      {p.nationwide ? <span className="badge badge-brand">{t.find.nationwide}</span> : null}
                    </div>
                    <h4 className="h3">{lang === "bn" ? p.nameBn : p.name}</h4>
                    <p className="muted">{lang === "bn" ? p.descBn : p.descEn}</p>
                    <dl className="space-y-1 text-sm">
                      {p.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                          <dt className="sr-only">{t.find.phone}</dt>
                          <dd><a className="font-semibold underline" href={`tel:${p.phone}`}>{digits(p.phone, lang)}</a></dd>
                        </div>
                      ) : null}
                      {p.website ? (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-brand" aria-hidden="true" />
                          <dt className="sr-only">{t.find.website}</dt>
                          <dd><a className="underline" href={p.website} rel="noopener noreferrer" target="_blank">{p.website.replace(/^https?:\/\//, "")}</a></dd>
                        </div>
                      ) : null}
                      {p.hours ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
                          <dt className="sr-only">{t.find.hours}</dt>
                          <dd>{p.hours}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <p className={`mt-auto flex items-start gap-2 text-xs ${p.verified ? "text-ok" : "text-soft"}`}>
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {p.verified ? t.find.verified : t.find.unverified}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card bg-brand-soft">
            <h3 className="h3">{t.find.requestTitle}</h3>
            <p className="muted mt-1">{t.find.requestText}</p>
            <Link href={`/request?c=${category}${district ? `&d=${encodeURIComponent(district)}` : ""}`} className="btn btn-primary mt-4">
              {t.find.requestCta}
            </Link>
          </section>
        </div>
      ) : null}
    </div>
  );
}
