import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { StatusBadge } from "@/components/StatusBadge";
import { digits, formatTime } from "@/lib/format";
import { todayInDhaka } from "@/lib/rules";

export default async function DashboardPage() {
  const user = await requireUser();
  const { t, lang } = await getT();
  const today = todayInDhaka();
  const monthStart = new Date(`${today.slice(0, 8)}01T00:00:00+06:00`);

  const [awaiting, todayCount, openCases, helpedThisMonth, todayList, queue] = await Promise.all([
    db.helpRequest.count({ where: { status: "SUBMITTED" } }),
    db.helpRequest.count({ where: { status: "CONFIRMED", date: today } }),
    db.case.count({ where: { status: { not: "CLOSED" } } }),
    db.helpRequest.count({ where: { status: "COMPLETED", updatedAt: { gte: monthStart } } }),
    db.helpRequest.findMany({ where: { status: "CONFIRMED", date: today }, include: { client: true, volunteer: true }, orderBy: { slot: "asc" } }),
    db.helpRequest.findMany({ where: { status: "SUBMITTED" }, include: { client: true }, orderBy: { createdAt: "asc" }, take: 6 }),
  ]);

  const stats = [
    { label: t.admin.dashboard.awaiting, value: awaiting, href: "/admin/requests?status=SUBMITTED" },
    { label: t.admin.dashboard.today, value: todayCount, href: "/admin/requests?status=CONFIRMED" },
    { label: t.admin.dashboard.openCases, value: openCases, href: "/admin/cases" },
    { label: t.admin.dashboard.thisMonth, value: helpedThisMonth, href: "/admin/requests?status=COMPLETED" },
  ];
  const now = Date.now();
  const cat = (c: string) => (isCategory(c) ? CATEGORY_LABELS[c][lang] : c);

  return (
    <div className="max-w-6xl">
      <h1 className="h1">{t.admin.dashboard.hello}, {user.name}</h1>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card block hover:bg-surface-2">
              <span className="text-4xl font-bold text-brand">{digits(s.value, lang)}</span>
              <span className="muted mt-1 block text-sm">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="today">
          <h2 id="today" className="h2">{t.admin.dashboard.todayList}</h2>
          {todayList.length === 0 ? (
            <p className="muted mt-4">{t.admin.dashboard.noToday}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {todayList.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/requests/${r.id}`} className="card flex items-center justify-between gap-4 hover:bg-surface-2">
                    <span>
                      <span className="font-semibold">{r.slot ? formatTime(r.slot, lang) : ""}</span> · {r.client.name}
                      <span className="muted block text-sm">{cat(r.category)} · {r.volunteer?.name ?? t.common.unassigned}</span>
                    </span>
                    <StatusBadge status={r.status} label={t.track.status[r.status]} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="queue">
          <div className="flex items-baseline justify-between">
            <h2 id="queue" className="h2">{t.admin.dashboard.queue}</h2>
            <Link href="/admin/requests?status=SUBMITTED" className="text-sm font-medium text-brand hover:underline">{t.admin.dashboard.viewAll}</Link>
          </div>
          {queue.length === 0 ? (
            <p className="muted mt-4">{t.admin.dashboard.noQueue}</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {queue.map((r) => {
                const days = Math.floor((now - r.createdAt.getTime()) / 86_400_000);
                return (
                  <li key={r.id}>
                    <Link href={`/admin/requests/${r.id}`} className="card flex items-center justify-between gap-4 hover:bg-surface-2">
                      <span>
                        <span className="font-semibold">{r.client.name}</span>
                        <span className="muted block text-sm">{cat(r.category)}</span>
                      </span>
                      <span className={`badge ${days >= 3 ? "badge-danger" : "badge-warn"}`}>{t.admin.dashboard.waitingFor}: {digits(days, lang)} {t.admin.dashboard.days}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
