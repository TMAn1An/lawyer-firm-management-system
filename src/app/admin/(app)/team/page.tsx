import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireAdmin } from "@/lib/auth";
import { Flash } from "@/components/Flash";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { addStaff, toggleStaff } from "./actions";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const me = await requireAdmin();
  const { t, lang } = await getT();
  const sp = await searchParams;
  const m = t.admin.team;
  const [users, logs] = await Promise.all([
    db.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
  ]);
  const names = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div className="max-w-5xl">
      <h1 className="h1">{m.title}</h1>
      <div className="mt-6"><Flash ok={sp.ok} error={sp.error} okText={t.common.saved} errors={{ invalid: t.common.error, emailTaken: m.emailTaken, lastAdmin: m.lastAdmin }} /></div>

      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id} className={`card flex flex-wrap items-center justify-between gap-4 ${u.active ? "" : "opacity-60"}`}>
            <div>
              <p className="font-semibold">{u.name} {u.id === me.id ? <span className="muted font-normal">{m.you}</span> : null}</p>
              <p className="muted text-sm">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge badge-neutral">{m.roles[u.role]}</span>
              {!u.active ? <StatusBadge status="CLOSED" label={m.inactive} /> : null}
              {u.id !== me.id ? (
                <form action={toggleStaff.bind(null, u.id)}><button className="btn btn-secondary btn-sm">{u.active ? m.deactivate : m.activate}</button></form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <form action={addStaff} className="card mt-10 space-y-5">
        <h2 className="h3">{m.add}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="sn" className="label">{t.common.name}</label><input id="sn" name="name" required minLength={2} className="input" /></div>
          <div><label htmlFor="se" className="label">{t.common.email}</label><input id="se" name="email" type="email" required autoComplete="off" className="input" /></div>
          <div><label htmlFor="sp" className="label">{m.password}</label><input id="sp" name="password" type="password" required minLength={10} autoComplete="new-password" className="input" /></div>
          <div>
            <label htmlFor="sr" className="label">{m.role}</label>
            <select id="sr" name="role" defaultValue="STAFF" className="input"><option value="STAFF">{m.roles.STAFF}</option><option value="ADMIN">{m.roles.ADMIN}</option></select>
          </div>
        </div>
        <button className="btn btn-primary">{m.add}</button>
      </form>

      <h2 className="h2 mt-12">{m.recent}</h2>
      <div className="table-wrap mt-4">
        <table className="table">
          <thead><tr><th scope="col">{t.common.time}</th><th scope="col">{t.common.name}</th><th scope="col">{t.common.actions}</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">{formatDateTime(l.createdAt, lang)}</td>
                <td>{(l.actorId && names.get(l.actorId)) || "—"}</td>
                <td className="font-mono text-xs">{l.action} · {l.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
