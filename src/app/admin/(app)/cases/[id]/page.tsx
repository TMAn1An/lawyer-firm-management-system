import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { StatusBadge } from "@/components/StatusBadge";
import { Flash } from "@/components/Flash";
import { formatDateTime } from "@/lib/format";
import { addCaseNote, updateCase } from "../actions";

export default async function CaseDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireUser();
  const { id } = await params;
  const { ok } = await searchParams;
  const { t, lang } = await getT();
  const c = t.admin.cases;
  const row = await db.case.findUnique({
    where: { id },
    include: { client: true, volunteer: true, request: true, notes: { include: { author: true }, orderBy: { createdAt: "desc" } } },
  });
  if (!row) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/cases" className="text-sm font-medium text-brand hover:underline">← {c.title}</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="h1 font-mono" translate="no">{row.caseNo}</h1>
        <StatusBadge status={row.status} label={c.statuses[row.status]} />
      </div>
      <p className="mt-2 text-lg">{row.title}</p>
      <div className="mt-6"><Flash ok={ok} okText={t.common.saved} errors={{}} /></div>

      <dl className="card grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div><dt className="text-sm text-soft">{c.client}</dt><dd className="font-medium"><Link className="text-brand underline" href={`/admin/clients/${row.clientId}`}>{row.client.name}</Link></dd></div>
        <div><dt className="text-sm text-soft">{t.common.topic}</dt><dd className="font-medium">{isCategory(row.category) ? CATEGORY_LABELS[row.category][lang] : row.category}</dd></div>
        <div><dt className="text-sm text-soft">{c.assigned}</dt><dd className="font-medium">{row.volunteer?.name ?? "—"}</dd></div>
        <div><dt className="text-sm text-soft">{t.common.created}</dt><dd className="font-medium">{formatDateTime(row.createdAt, lang)}</dd></div>
        {row.request ? <div><dt className="text-sm text-soft">{t.admin.requests.ref}</dt><dd><Link className="font-mono text-brand underline" href={`/admin/requests/${row.request.id}`}>{row.request.refCode}</Link></dd></div> : null}
      </dl>

      <form action={updateCase.bind(null, id)} className="card mt-6 space-y-4">
        <h2 className="h3">{c.updateStatus}</h2>
        <div className="grid gap-4 sm:grid-cols-[14rem_1fr]">
          <div>
            <label htmlFor="status" className="label">{t.common.status}</label>
            <select id="status" name="status" defaultValue={row.status} className="input">
              {(["OPEN", "IN_PROGRESS", "CLOSED"] as const).map((s) => <option key={s} value={s}>{c.statuses[s]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="outcome" className="label">{c.outcome}</label>
            <input id="outcome" name="outcome" maxLength={1000} defaultValue={row.outcome ?? ""} className="input" />
            <p className="hint">{c.outcomeHint}</p>
          </div>
        </div>
        <button className="btn btn-primary">{t.common.save}</button>
      </form>

      <section className="mt-8" aria-labelledby="notes">
        <h2 id="notes" className="h2">{t.common.notes}</h2>
        <form action={addCaseNote.bind(null, id)} className="card mt-4 space-y-3">
          <label htmlFor="body" className="label">{c.addNote}</label>
          <textarea id="body" name="body" required maxLength={4000} className="input" />
          <p className="hint">{c.noteHint}</p>
          <button className="btn btn-secondary">{c.addNote}</button>
        </form>
        {row.notes.length === 0 ? <p className="muted mt-4">{c.noNotes}</p> : (
          <ul className="mt-4 space-y-3">
            {row.notes.map((n) => (
              <li key={n.id} className="card">
                <p className="whitespace-pre-line">{n.body}</p>
                <p className="muted mt-2 text-xs">{c.by} {n.author.name} · {formatDateTime(n.createdAt, lang)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
