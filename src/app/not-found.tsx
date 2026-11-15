import Link from "next/link";
import { getT } from "@/lib/i18n";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <main className="prose-page py-24 text-center">
      <p className="text-6xl font-bold text-brand" aria-hidden="true">404</p>
      <h1 className="h1 mt-4">{t.common.notFound}</h1>
      <p className="muted mt-3">{t.common.page404}</p>
      <Link href="/" className="btn btn-primary mt-8">{t.common.backHome}</Link>
    </main>
  );
}
