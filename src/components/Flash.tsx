import { CheckCircle2, TriangleAlert } from "lucide-react";

/** Success / error banner driven by ?ok=1 and ?error=CODE, so server actions need no client state. */
export function Flash({ ok, error, okText, errors }: { ok?: string; error?: string; okText: string; errors: Record<string, string> }) {
  if (error) {
    return (
      <p role="alert" className="mb-6 flex items-start gap-2 rounded-xl bg-danger-soft p-3 font-medium text-danger">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        {errors[error] ?? error}
      </p>
    );
  }
  if (ok) {
    return (
      <p role="status" className="mb-6 flex items-start gap-2 rounded-xl bg-ok-soft p-3 font-medium text-ok">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        {okText}
      </p>
    );
  }
  return null;
}
