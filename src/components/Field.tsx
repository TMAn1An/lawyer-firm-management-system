import type { ReactNode } from "react";

/** Label + control + hint + error, wired together for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  required,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required ? <span className="text-danger" aria-hidden="true"> *</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint ? <p id={`${id}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}
