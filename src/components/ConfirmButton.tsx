"use client";

/** Submit button that asks "are you sure?" first. Works inside a server-action form. */
export function ConfirmButton({ message, label, className = "btn btn-danger mt-4" }: { message: string; label: string; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {label}
    </button>
  );
}
