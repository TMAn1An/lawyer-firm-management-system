import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { districtLabel } from "@/lib/districts";
import { SLOTS, canTransition, checkCapacity, isValidDateString, maxPerDay, todayInDhaka, type RequestStatus } from "@/lib/rules";
import { StatusBadge } from "@/components/StatusBadge";
import { Flash } from "@/components/Flash";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";
import { createCaseFromRequest, saveRequestNote, scheduleRequest, setRequestStatus } from "../actions";

export default async function RequestDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string; v?: string; d?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const { t, lang } = await getT();
  const a = t.admin.requests;

  const req = await db.helpRequest.findUnique({ where: { id }, include: { client: true, volunteer: true, case: true } });
  if (!req) notFound();
  const status = req.status as RequestStatus;

  const volunteers = await db.volunteer.findMany({
    where: { active: true, availability: { not: "ON_LEAVE" } },
    orderBy: { name: "asc" },
  });
  const chosenVolunteer = volunteers.find((v) => v.id === (sp.v ?? req.volunteerId ?? ""));
  const chosenDate = sp.d && isValidDateString(sp.d) ? sp.d : req.date ?? req.preferredDate ?? "";

  let takenSlots: string[] = [];
  if (chosenVolunteer && chosenDate) {
    const taken = await db.helpRequest.findMany({
      where: { volunteerId: chosenVolunteer.id, date: chosenDate, status: "CONFIRMED", NOT: { id } },
      select: { slot: true },
    });
    takenSlots = taken.map((r) => r.slot!).filter(Boolean);
  }
  const cat = isCategory(req.category) ? CATEGORY_LABELS[req.category][lang] : req.category;
  const canSchedule = canTransition(status, "CONFIRMED");

  const schedule = scheduleRequest.bind(null, id);
  const saveNote = saveRequestNote.bind(null, id);
  const createCase = createCaseFromRequest.bind(null, id);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/requests" className="text-sm font-medium text-brand hover:underline">← {a.title}</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="h1 font-mono" translate="no">{req.refCode}</h1>
        <StatusBadge status={status} label={t.track.status[status]} />
      </div>

      <div className="mt-6">
        <Flash ok={sp.ok} error={sp.error} okText={t.common.saved} errors={a.errors} />
      </div>

      <section className="card" aria-labelledby="who">
        <h2 id="who" className="h3">{a.detail}</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div><dt className="text-sm text-soft">{a.person}</dt><dd className="font-medium"><Link className="text-brand underline" href={`/admin/clients/${req.clientId}`}>{req.client.name}</Link></dd></div>
          <div><dt className="text-sm text-soft">{a.contact}</dt><dd><a className="font-medium underline" href={`tel:${req.client.phone}`}>{req.client.phone}</a>{req.client.email ? <span className="muted block text-sm">{req.client.email}</span> : null}</dd></div>
          <div><dt className="text-sm text-soft">{t.common.topic}</dt><dd className="font-medium">{cat}</dd></div>
          <div><dt className="text-sm text-soft">{t.request.district}</dt><dd className="font-medium">{districtLabel(req.district, lang) || "—"}</dd></div>
          <div><dt className="text-sm text-soft">{a.mode}</dt><dd className="font-medium">{t.request.modes[req.mode]}</dd></div>
          <div><dt className="text-sm text-soft">{a.preferred}</dt><dd className="font-medium">{req.preferredDate ? formatDate(req.preferredDate, lang) : "—"}</dd></div>
          <div><dt className="text-sm text-soft">{a.received}</dt><dd className="font-medium">{formatDateTime(req.createdAt, lang)}</dd></div>
          {req.date && req.slot ? <div><dt className="text-sm text-soft">{a.scheduled}</dt><dd className="font-medium">{formatDate(req.date, lang)}, {formatTime(req.slot, lang)} · {req.volunteer?.name}</dd></div> : null}
          <div className="sm:col-span-2"><dt className="text-sm text-soft">{a.summary}</dt><dd className="mt-1 whitespace-pre-line rounded-xl bg-surface-2 p-4">{req.summary}</dd></div>
        </dl>
      </section>

      {canSchedule ? (
        <section className="card mt-6" aria-labelledby="sched">
          <h2 id="sched" className="h3">{status === "CONFIRMED" ? a.reschedule : a.schedule}</h2>
          {volunteers.length === 0 ? (
            <p className="mt-3 text-danger">{a.noVolunteers}</p>
          ) : (
            <>
              <form method="get" className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div>
                  <label htmlFor="v" className="label">{a.volunteer}</label>
                  <select id="v" name="v" defaultValue={chosenVolunteer?.id ?? ""} required className="input">
                    <option value="" disabled>{a.pickVolunteer}</option>
                    {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="d" className="label">{t.common.date}</label>
                  <input id="d" name="d" type="date" min={todayInDhaka()} defaultValue={chosenDate} required className="input" />
                </div>
                <button type="submit" className="btn btn-secondary">{a.checkTimes}</button>
              </form>

              {chosenVolunteer && chosenDate ? (
                <form action={schedule} className="mt-6 space-y-4 border-t border-line pt-6">
                  <input type="hidden" name="volunteerId" value={chosenVolunteer.id} />
                  <input type="hidden" name="date" value={chosenDate} />
                  <p className="font-medium">{chosenVolunteer.name} · {formatDate(chosenDate, lang)}</p>
                  <div>
                    <label htmlFor="slot" className="label">{t.common.time}</label>
                    <select id="slot" name="slot" required defaultValue="" className="input sm:max-w-xs">
                      <option value="" disabled>{a.pickSlot}</option>
                      {SLOTS.map((s) => {
                        const unavailable = checkCapacity(takenSlots, s, maxPerDay()) !== null;
                        return <option key={s} value={s} disabled={unavailable}>{formatTime(s, lang)}{unavailable ? ` · ${a.errors.SLOT_TAKEN}` : ""}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="publicNote" className="label">{a.publicNote}</label>
                    <textarea id="publicNote" name="publicNote" maxLength={500} defaultValue={req.publicNote ?? ""} className="input min-h-24" />
                    <p className="hint">{a.publicNoteHint}</p>
                  </div>
                  <button type="submit" className="btn btn-primary">{a.confirm}</button>
                </form>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {status === "CONFIRMED" || status === "SUBMITTED" ? (
        <section className="mt-6 flex flex-wrap gap-3" aria-label={t.common.actions}>
          {status === "CONFIRMED" ? (
            <>
              <form action={setRequestStatus.bind(null, id, "COMPLETED")}><button className="btn btn-primary">{a.markCompleted}</button></form>
              <form action={setRequestStatus.bind(null, id, "NO_SHOW")}><button className="btn btn-secondary">{a.markNoShow}</button></form>
            </>
          ) : null}
          <form action={setRequestStatus.bind(null, id, "CANCELLED")}><button className="btn btn-secondary text-danger">{a.cancelRequest}</button></form>
        </section>
      ) : null}

      {status !== "SUBMITTED" && status !== "CANCELLED" ? (
        <section className="card mt-6" aria-labelledby="case">
          <h2 id="case" className="h3">{t.admin.nav.cases}</h2>
          {req.case ? (
            <Link href={`/admin/cases/${req.case.id}`} className="btn btn-secondary mt-3">{a.viewCase}: {req.case.caseNo}</Link>
          ) : (
            <form action={createCase}><button className="btn btn-primary mt-3">{a.createCase}</button></form>
          )}
        </section>
      ) : null}

      {!canSchedule ? (
        <form action={saveNote} className="card mt-6 space-y-3">
          <label htmlFor="publicNote2" className="label">{a.publicNote}</label>
          <textarea id="publicNote2" name="publicNote" maxLength={500} defaultValue={req.publicNote ?? ""} className="input min-h-24" />
          <p className="hint">{a.publicNoteHint}</p>
          <button className="btn btn-secondary">{t.common.save}</button>
        </form>
      ) : null}
    </div>
  );
}
