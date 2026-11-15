import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { STATUSES } from "@/lib/rules";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatTime, maskPhone } from "@/lib/format";

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser();
  const { t, lang } = await getT();
  const { status } = await searchParams;
  const active = STATUSES.find((s) => s === status);

  const rows = await db.helpRequest.findMany({
    where: active ? { status: active } : undefined,
    include: { client: true, volunteer: true },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });
  const cat = (c: string) => (isCategory(c) ? CATEGORY_LABELS[c][lang] : c);

  return (
    <div className="max-w-6xl">
      <h1 className="h1">{t.admin.requests.title}</h1>
      <nav aria-label={t.admin.requests.filter} className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/requests" aria-current={!active ? "page" : undefined} className={`badge px-4 py-2 text-sm ${!active ? "badge-brand" : "badge-neutral"}`}>{t.common.all}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/requests?status=${s}`} aria-current={active === s ? "page" : undefined} className={`badge px-4 py-2 text-sm ${active === s ? "badge-brand" : "badge-neutral"}`}>
            {t.track.status[s]}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="muted mt-10">{t.admin.requests.empty}</p>
      ) : (
        <div className="table-wrap mt-6">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{t.admin.requests.ref}</th>
                <th scope="col">{t.admin.requests.person}</th>
                <th scope="col">{t.common.topic}</th>
                <th scope="col">{t.admin.requests.received}</th>
                <th scope="col">{t.admin.requests.scheduled}</th>
                <th scope="col">{t.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/requests/${r.id}`} className="font-mono font-semibold text-brand underline" translate="no">{r.refCode}</Link></td>
                  <td>{r.client.name}<span className="muted block text-xs">{maskPhone(r.client.phone)}</span></td>
                  <td>{cat(r.category)}</td>
                  <td className="whitespace-nowrap">{formatDateTime(r.createdAt, lang)}</td>
                  <td className="whitespace-nowrap">{r.date && r.slot ? <>{formatDate(r.date, lang)}<span className="muted block text-xs">{formatTime(r.slot, lang)} · {r.volunteer?.name}</span></> : "—"}</td>
                  <td><StatusBadge status={r.status} label={t.track.status[r.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
