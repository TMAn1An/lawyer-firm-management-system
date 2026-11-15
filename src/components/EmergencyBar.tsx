import { getT } from "@/lib/i18n";

export async function EmergencyBar() {
  const { t } = await getT();
  return (
    <div className="no-print bg-danger-soft text-danger" role="region" aria-label={t.emergency.title}>
      <div className="page flex flex-wrap items-center gap-x-5 gap-y-1 py-2 text-sm">
        <strong>{t.emergency.title}</strong>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {t.emergency.items.map((i) => (
            <li key={i.n}>
              <a href={`tel:${i.n.replace(/[^\d]/g, "") || i.n}`} className="font-bold underline underline-offset-2">
                {i.n}
              </a>{" "}
              <span className="opacity-90">{i.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
