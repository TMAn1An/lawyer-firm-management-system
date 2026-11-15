import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { districtLabel } from "@/lib/districts";
import { formatDateTime } from "@/lib/format";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { t, lang } = await getT();
  const q = (await searchParams).q?.trim() ?? "";
  const rows = await db.client.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }] } : undefined,
    include: { _count: { select: { requests: true, cases: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const c = t.admin.clients;
  return (
    <div className="max-w-6xl">
      <h1 className="h1">{c.title}</h1>
      <form method="get" role="search" className="mt-6 flex max-w-xl gap-3">
        <label htmlFor="q" className="sr-only">{c.searchHint}</label>
        <input id="q" name="q" defaultValue={q} placeholder={c.searchHint} className="input" />
        <button className="btn btn-primary">{t.common.search}</button>
      </form>
      {rows.length === 0 ? <p className="muted mt-10">{c.empty}</p> : (
        <div className="table-wrap mt-6">
          <table className="table">
            <thead><tr><th scope="col">{t.common.name}</th><th scope="col">{t.common.phone}</th><th scope="col">{t.request.district}</th><th scope="col">{c.requests}</th><th scope="col">{c.cases}</th><th scope="col">{t.common.created}</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/clients/${r.id}`} className="font-medium text-brand underline">{r.name}</Link></td>
                  <td>{r.phone}</td>
                  <td>{districtLabel(r.district, lang) || "—"}</td>
                  <td>{r._count.requests}</td>
                  <td>{r._count.cases}</td>
                  <td className="whitespace-nowrap">{formatDateTime(r.createdAt, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
