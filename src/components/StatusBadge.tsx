const STYLE: Record<string, string> = {
  SUBMITTED: "badge-warn",
  CONFIRMED: "badge-brand",
  COMPLETED: "badge-ok",
  CANCELLED: "badge-neutral",
  NO_SHOW: "badge-danger",
  OPEN: "badge-warn",
  IN_PROGRESS: "badge-brand",
  CLOSED: "badge-neutral",
  AVAILABLE: "badge-ok",
  BUSY: "badge-warn",
  ON_LEAVE: "badge-neutral",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`badge ${STYLE[status] ?? "badge-neutral"}`}>{label}</span>;
}
