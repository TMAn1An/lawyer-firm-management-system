import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { districtLabel } from "@/lib/districts";
import { StatusBadge } from "@/components/StatusBadge";
import { Flash } from "@/components/Flash";
import { formatDate, formatDateTime } from "@/lib/format";
import { eraseClient } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

export default async function ClientDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { ok } = await searchParams;
  const { t, lang } = await getT();
  const c = t.admin.clients;
  const client = await db.client.findUnique({
    where: { id },
    include: { requests: { orderBy: { createdAt: "desc" } }, cases: { orderBy: { createdAt: "desc" } } },
  });
  if (!client) notFound();
  const cat = (x: string) => (isCategory(x) ? CATEGORY_LABELS[x][lang] : x);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/clients" className="text-sm font-medium text-brand hover:underline">← {c.title}</Link>
      <h1 className="h1 mt-3">{client.name}</h1>
      <div className="mt-6"><Flash ok={ok} okText={c.erased} errors={{}} /></div>
      <dl className="card grid gap-4 sm:grid-cols-3">
        <div><dt className="text-sm text-soft">{t.common.phone}</dt><dd className="font-medium">{client.phone.startsWith("erased-") ? "—" : client.phone}</dd></div>
        <div><dt className="text-sm text-soft">{t.common.email}</dt><dd className="font-medium">{client.email ?? "—"}</dd></div>
        <div><dt className="text-sm text-soft">{t.request.district}</dt><dd className="font-medium">{districtLabel(client.district, lang) || "—"}</dd></div>
      </dl>

      <h2 className="h2 mt-10">{c.requests}</h2>
      <ul className="mt-4 space-y-3">
        {client.requests.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/requests/${r.id}`} className="card flex items-center justify-between gap-4 hover:bg-surface-2">
              <span><span className="font-mono font-semibold" translate="no">{r.refCode}</span> · {cat(r.category)}<span className="muted block text-sm">{formatDateTime(r.createdAt, lang)}{r.date ? ` · ${formatDate(r.date, lang)}` : ""}</span></span>
              <StatusBadge status={r.status} label={t.track.status[r.status]} />
            </Link>
          </li>
        ))}
      </ul>

      {client.cases.length > 0 ? (
        <>
          <h2 className="h2 mt-10">{c.cases}</h2>
          <ul className="mt-4 space-y-3">
            {client.cases.map((cs) => (
              <li key={cs.id}>
                <Link href={`/admin/cases/${cs.id}`} className="card flex items-center justify-between gap-4 hover:bg-surface-2">
                  <span><span className="font-mono font-semibold" translate="no">{cs.caseNo}</span> · {cs.title}</span>
                  <StatusBadge status={cs.status} label={t.admin.cases.statuses[cs.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {user.role === "ADMIN" && !client.phone.startsWith("erased-") ? (
        <form action={eraseClient.bind(null, id)} className="card mt-10 border-danger/40">
          <h2 className="h3 text-danger">{c.anonymise}</h2>
          <p className="muted mt-1 text-sm">{c.anonymiseHelp}</p>
          <ConfirmButton message={c.anonymiseConfirm} label={c.anonymise} />
        </form>
      ) : null}
    </div>
  );
}
