export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--brand)" />
      {/* a path that bridges two points: "nyay-path" */}
      <path d="M7 24c4 0 4-16 9-16s5 16 9 16" fill="none" stroke="var(--brand-ink)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="16" cy="8" r="2.2" fill="var(--brand-ink)" />
    </svg>
  );
}
