import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";

const STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

export default async function CasesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser();
  const { t, lang } = await getT();
  const { status } = await searchParams;
  const active = STATUSES.find((s) => s === status);
  const rows = await db.case.findMany({
    where: active ? { status: active } : undefined,
    include: { client: true, volunteer: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const c = t.admin.cases;
  return (
    <div className="max-w-6xl">
      <h1 className="h1">{c.title}</h1>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label={t.admin.requests.filter}>
        <Link href="/admin/cases" aria-current={!active ? "page" : undefined} className={`badge px-4 py-2 text-sm ${!active ? "badge-brand" : "badge-neutral"}`}>{t.common.all}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/cases?status=${s}`} aria-current={active === s ? "page" : undefined} className={`badge px-4 py-2 text-sm ${active === s ? "badge-brand" : "badge-neutral"}`}>{c.statuses[s]}</Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="muted mt-10">{c.empty}</p>
      ) : (
        <div className="table-wrap mt-6">
          <table className="table">
            <thead><tr><th scope="col">{c.no}</th><th scope="col">{c.client}</th><th scope="col">{t.common.topic}</th><th scope="col">{c.assigned}</th><th scope="col">{t.common.created}</th><th scope="col">{t.common.status}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/cases/${r.id}`} className="font-mono font-semibold text-brand underline" translate="no">{r.caseNo}</Link></td>
                  <td>{r.client.name}</td>
                  <td>{isCategory(r.category) ? CATEGORY_LABELS[r.category][lang] : r.category}</td>
                  <td>{r.volunteer?.name ?? "—"}</td>
                  <td className="whitespace-nowrap">{formatDateTime(r.createdAt, lang)}</td>
                  <td><StatusBadge status={r.status} label={c.statuses[r.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
