import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, CATEGORY_LABELS, splitCategories } from "@/lib/categories";
import { StatusBadge } from "@/components/StatusBadge";
import { Flash } from "@/components/Flash";
import { addVolunteer, setAvailability, toggleVolunteer } from "./actions";

export default async function VolunteersPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireUser();
  const { t, lang } = await getT();
  const sp = await searchParams;
  const v = t.admin.volunteers;
  const rows = await db.volunteer.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <div className="max-w-5xl">
      <h1 className="h1">{v.title}</h1>
      <p className="muted mt-2">{v.note}</p>
      <div className="mt-6"><Flash ok={sp.ok} error={sp.error} okText={t.common.saved} errors={{ invalid: t.common.error }} /></div>

      {rows.length === 0 ? <p className="muted">{v.empty}</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`card flex flex-wrap items-center justify-between gap-4 ${r.active ? "" : "opacity-60"}`}>
              <div>
                <p className="font-semibold">{r.name} {!r.active ? <span className="badge badge-neutral ml-2">{v.inactive}</span> : null}</p>
                <p className="muted text-sm">{[r.phone, r.email].filter(Boolean).join(" · ") || "—"}</p>
                <p className="muted mt-1 text-sm">{splitCategories(r.categories).map((c) => CATEGORY_LABELS[c][lang]).join(", ") || "—"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={r.availability} label={v.states[r.availability]} />
                <form action={setAvailability.bind(null, r.id)} className="flex items-center gap-2">
                  <label htmlFor={`a-${r.id}`} className="sr-only">{v.availability}</label>
                  <select id={`a-${r.id}`} name="availability" defaultValue={r.availability} className="input min-h-9 w-auto py-1 text-sm">
                    {(["AVAILABLE", "BUSY", "ON_LEAVE"] as const).map((s) => <option key={s} value={s}>{v.states[s]}</option>)}
                  </select>
                  <button className="btn btn-secondary btn-sm">{t.common.save}</button>
                </form>
                <form action={toggleVolunteer.bind(null, r.id)}><button className="btn btn-secondary btn-sm">{r.active ? v.deactivate : v.activate}</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={addVolunteer} className="card mt-10 space-y-5">
        <h2 className="h3">{v.add}</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="vn" className="label">{t.common.name}</label><input id="vn" name="name" required minLength={2} className="input" /></div>
          <div><label htmlFor="vp" className="label">{t.common.phone}</label><input id="vp" name="phone" inputMode="tel" className="input" /></div>
          <div><label htmlFor="ve" className="label">{t.common.email}</label><input id="ve" name="email" type="email" className="input" /></div>
          <div>
            <label htmlFor="va" className="label">{v.availability}</label>
            <select id="va" name="availability" className="input">{(["AVAILABLE", "BUSY", "ON_LEAVE"] as const).map((s) => <option key={s} value={s}>{v.states[s]}</option>)}</select>
          </div>
        </div>
        <fieldset>
          <legend className="label">{v.topics}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex items-center gap-2"><input type="checkbox" name="categories" value={c} className="h-5 w-5 accent-[var(--brand)]" />{CATEGORY_LABELS[c][lang]}</label>
            ))}
          </div>
        </fieldset>
        <button className="btn btn-primary">{v.add}</button>
      </form>
    </div>
  );
}
