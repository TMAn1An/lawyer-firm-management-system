"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Printer } from "lucide-react";
import { submitHelpRequest, type RequestFormState } from "./actions";
import { Field } from "@/components/Field";

type Props = {
  lang: "bn" | "en";
  t: import("@/lib/i18n/en").Messages["request"];
  categories: { value: string; label: string }[];
  districts: { value: string; label: string }[];
  defaults: { category?: string; district?: string };
  today: string;
  siteName: string;
};

const ERR_KEY: Record<string, string> = { date: "date", preferredDate: "date" };

export function RequestForm({ t, categories, districts, defaults, today, siteName }: Props) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(submitHelpRequest, { status: "idle" });

  if (state.status === "success") {
    return (
      <section className="card" aria-live="polite">
        <p className="flex items-center gap-2 text-brand"><CheckCircle2 className="h-6 w-6" aria-hidden="true" /><span className="h2 text-ink">{t.receipt.title}</span></p>
        <p className="mt-3">{t.receipt.lead}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-brand-soft p-5">
            <dt className="text-sm font-medium text-soft">{t.receipt.ref}</dt>
            <dd className="mt-1 font-mono text-3xl font-bold tracking-wider" translate="no">{state.ref}</dd>
          </div>
          <div className="rounded-2xl bg-brand-soft p-5">
            <dt className="text-sm font-medium text-soft">{t.receipt.pin}</dt>
            <dd className="mt-1 font-mono text-3xl font-bold tracking-widest" translate="no">{state.pin}</dd>
          </div>
        </dl>
        <h2 className="h3 mt-8">{t.receipt.next}</h2>
        <p className="muted mt-1">{t.receipt.nextText}</p>
        <p className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">{t.receipt.urgent}</p>
        <p className="print-only mt-4 text-sm">{siteName}</p>
        <div className="no-print mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" /> {t.receipt.print}
          </button>
          <Link href="/track" className="btn btn-primary">{t.receipt.track}</Link>
        </div>
      </section>
    );
  }

  const errors = state.status === "error" ? state.errors : {};
  const values = state.status === "error" ? state.values : {};
  const msg = (field: string): string | undefined => {
    const key = errors[field];
    if (!key) return undefined;
    return (t.errors as Record<string, string>)[ERR_KEY[key] ?? key] ?? t.errors.generic;
  };
  const dateErr = errors.preferredDate ? (t.errors as Record<string, string>)[errors.preferredDate] ?? t.errors.date : undefined;
  const formErr = errors.form ? (t.errors as Record<string, string>)[errors.form] ?? t.errors.generic : undefined;

  return (
    <form action={action} className="card space-y-6" noValidate>
      {formErr ? <p role="alert" className="rounded-xl bg-danger-soft p-3 font-medium text-danger">{formErr}</p> : null}

      {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label={t.name} error={msg("name")} required>
          {(p) => <input {...p} name="name" type="text" autoComplete="name" required defaultValue={values.name} className="input" />}
        </Field>
        <Field id="phone" label={t.phone} hint={t.phoneHint} error={msg("phone")} required>
          {(p) => <input {...p} name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={values.phone} className="input" />}
        </Field>
        <Field id="email" label={t.email} error={msg("email")}>
          {(p) => <input {...p} name="email" type="email" autoComplete="email" defaultValue={values.email} className="input" />}
        </Field>
        <Field id="district" label={t.district} error={msg("district")}>
          {(p) => (
            <select {...p} name="district" defaultValue={values.district ?? defaults.district ?? ""} className="input">
              <option value="">{t.choose}</option>
              {districts.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          )}
        </Field>
        <Field id="category" label={t.category} error={msg("category")} required>
          {(p) => (
            <select {...p} name="category" required defaultValue={values.category ?? defaults.category ?? ""} className="input">
              <option value="" disabled>{t.choose}</option>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          )}
        </Field>
        <Field id="mode" label={t.mode}>
          {(p) => (
            <select {...p} name="mode" defaultValue={values.mode ?? "IN_PERSON"} className="input">
              <option value="IN_PERSON">{t.modes.IN_PERSON}</option>
              <option value="PHONE">{t.modes.PHONE}</option>
            </select>
          )}
        </Field>
      </div>

      <Field id="summary" label={t.summary} hint={t.summaryHint} error={msg("summary")} required>
        {(p) => <textarea {...p} name="summary" required minLength={20} maxLength={1000} defaultValue={values.summary} className="input" />}
      </Field>

      <Field id="preferredDate" label={t.preferredDate} hint={t.preferredHint} error={dateErr}>
        {(p) => <input {...p} name="preferredDate" type="date" min={today} defaultValue={values.preferredDate} className="input sm:max-w-xs" />}
      </Field>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="consent" required defaultChecked={values.consent === "on"} aria-invalid={errors.consent ? true : undefined} className="mt-1.5 h-5 w-5 accent-[var(--brand)]" />
          <span>{t.consent}</span>
        </label>
        {msg("consent") ? <p className="field-error" role="alert">{msg("consent")}</p> : null}
        <p className="hint">{t.privacy}</p>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
