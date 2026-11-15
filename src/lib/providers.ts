import raw from "@/content/providers.json";
import type { Category } from "./categories";

export type Provider = {
  slug: string;
  name: string;
  nameBn: string;
  kind: "GOVERNMENT" | "NGO" | "BAR" | "CLINIC" | "HELPLINE";
  descEn: string;
  descBn: string;
  categories: Category[];
  nationwide?: boolean;
  /** English district name if the service is local rather than nationwide. */
  district?: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  free: boolean;
  /** true only after a maintainer has phoned or visited to confirm the details. */
  verified: boolean;
};

const providers = raw as Provider[];

/**
 * Organisations only, sorted alphabetically by English name. This is deliberate:
 * lawyer advertising is not allowed in Bangladesh, so there is no ranking, rating, or featured slot.
 */
export function listProviders(opts: { category?: Category; district?: string } = {}): Provider[] {
  return providers
    .filter((p) => !opts.category || p.categories.includes(opts.category))
    .filter((p) => !opts.district || p.nationwide || p.district === opts.district)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}
