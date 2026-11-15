"use client";

import { useActionState } from "react";
import { CalendarClock, Printer } from "lucide-react";
import { trackRequest, cancelOwnRequest, type TrackState } from "./actions";
import { Field } from "@/components/Field";
import { StatusBadge } from "@/components/StatusBadge";
import { digits, formatDate, formatDateTime, formatTime } from "@/lib/format";
import type { Messages } from "@/lib/i18n/en";

type Props = { lang: "bn" | "en"; t: Messages["track"]; modes: Record<string, string>; categories: Record<string, string>; siteName: string };

export function TrackForm({ lang, t, modes, categories, siteName }: Props) {
  const [state, action, pending] = useActionState<TrackState, FormData>(trackRequest, { status: "idle" });
  const [cancelState, cancelAction, cancelling] = useActionState<TrackState, FormData>(cancelOwnRequest, { status: "idle" });

  // After cancelling, show the refreshed result.
  const current = cancelState.status === "found" ? cancelState : state;

  if (current.status === "found") {
    const r = current.result;
    const canCancel = r.status === "SUBMITTED" || r.status === "CONFIRMED";
    return (
      <section className="card" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-soft">{t.ref}</p>
            <p className="font-mono text-2xl font-bold tracking-wider" translate="no">{r.ref}</p>
          </div>
          <StatusBadge status={r.status} label={t.status[r.status]} />
        </div>
        <p className="mt-4 text-lg">{t.explain[r.status]}</p>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <div><dt className="text-sm text-soft">{t.topic}</dt><dd className="font-medium">{categories[r.category] ?? r.category}</dd></div>
          <div><dt className="text-sm text-soft">{t.mode}</dt><dd className="font-medium">{modes[r.mode] ?? r.mode}</dd></div>
          {r.date && r.slot ? (
            <div className="sm:col-span-2 rounded-2xl bg-brand-soft p-4">
              <dt className="flex items-center gap-2 text-sm text-soft"><CalendarClock className="h-4 w-4" aria-hidden="true" />{t.when}</dt>
              <dd className="text-xl font-bold">{formatDate(r.date, lang)}, {formatTime(r.slot, lang)}</dd>
            </div>
          ) : null}
          {r.volunteer ? <div><dt className="text-sm text-soft">{t.volunteer}</dt><dd className="font-medium">{r.volunteer}</dd></div> : null}
          <div><dt className="text-sm text-soft">{t.submitted}</dt><dd className="font-medium">{formatDateTime(new Date(r.createdAt), lang)}</dd></div>
          {r.publicNote ? <div className="sm:col-span-2"><dt className="text-sm text-soft">{t.message}</dt><dd className="whitespace-pre-line">{r.publicNote}</dd></div> : null}
        </dl>

        {r.status === "CONFIRMED" ? (
          <div className="print-only mt-6 border-t pt-4 text-sm">
            <p className="font-bold">{siteName}: {t.slipTitle}</p>
            <p>{t.slipNote}</p>
          </div>
        ) : null}

        <div className="no-print mt-8 flex flex-wrap gap-3">
          {r.status === "CONFIRMED" ? (
            <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" aria-hidden="true" /> {t.printSlip}
            </button>
          ) : null}
          {canCancel ? (
            <form action={cancelAction} onSubmit={(e) => { if (!window.confirm(t.cancelConfirm)) e.preventDefault(); }}>
              <input type="hidden" name="ref" value={r.ref} />
              <input type="hidden" name="pin" value={current.pin} />
              <button type="submit" disabled={cancelling} className="btn btn-secondary text-danger">{t.cancel}</button>
            </form>
          ) : null}
          <a href="/track" className="btn btn-secondary">{t.another}</a>
        </div>
      </section>
    );
  }

  const err = state.status === "error" ? state.error : cancelState.status === "error" ? cancelState.error : null;
  return (
    <form action={action} className="card space-y-6">
      {err ? <p role="alert" className="rounded-xl bg-danger-soft p-3 font-medium text-danger">{t[err]}</p> : null}
      <Field id="ref" label={t.ref} required>
        {(p) => <input {...p} name="ref" type="text" required autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="NP-XXXXXX" defaultValue={state.status === "error" ? state.ref : cancelState.status === "error" ? cancelState.ref : undefined} className="input font-mono uppercase" />}
      </Field>
      <Field id="pin" label={t.pin} required>
        {(p) => <input {...p} name="pin" type="text" inputMode="numeric" pattern="[0-9০-৯]{6}" maxLength={6} required autoComplete="off" className="input font-mono tracking-widest sm:max-w-48" placeholder={digits("000000", lang)} />}
      </Field>
      <button type="submit" disabled={pending} className="btn btn-primary">{pending ? t.checking : t.submit}</button>
    </form>
  );
}
