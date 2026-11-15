"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Field } from "@/components/Field";
import type { Messages } from "@/lib/i18n/en";

export function LoginForm({ t }: { t: Messages["admin"]["login"] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="card mt-6 space-y-5">
      {state.error ? <p role="alert" className="rounded-xl bg-danger-soft p-3 font-medium text-danger">{state.error === "tooMany" ? t.tooMany : t.invalid}</p> : null}
      <Field id="email" label={t.email} required>
        {(p) => <input {...p} name="email" type="email" autoComplete="username" required defaultValue={state.email} className="input" />}
      </Field>
      <Field id="password" label={t.password} required>
        {(p) => <input {...p} name="password" type="password" autoComplete="current-password" required className="input" />}
      </Field>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">{t.submit}</button>
    </form>
  );
}
