import { Baby, Briefcase, Gavel, Home, Landmark, ShieldAlert, ShoppingBag, HelpCircle } from "lucide-react";
import type { Category } from "@/lib/categories";

const MAP = {
  FAMILY: Baby,
  VIOLENCE: ShieldAlert,
  LAND: Home,
  LABOUR: Briefcase,
  CRIMINAL: Gavel,
  CONSUMER: ShoppingBag,
  RTI: Landmark,
  OTHER: HelpCircle,
} as const;

export function CategoryIcon({ category, className = "h-6 w-6" }: { category: Category; className?: string }) {
  const Icon = MAP[category];
  return <Icon className={className} aria-hidden="true" />;
}
