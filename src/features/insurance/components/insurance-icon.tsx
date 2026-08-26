import type { LucideIcon } from "lucide-react";
import { Building2, Car, HeartPulse, House, Plane, ShieldCheck } from "lucide-react";
import type { InsuranceIconName } from "@/features/insurance/catalog";

const icons: Record<InsuranceIconName, LucideIcon> = {
  building: Building2,
  car: Car,
  heart: HeartPulse,
  house: House,
  plane: Plane,
  shield: ShieldCheck,
};

type InsuranceIconProps = {
  name: InsuranceIconName;
  className?: string;
  size?: number;
};

export function InsuranceIcon({ className, name, size = 26 }: InsuranceIconProps) {
  const Icon = icons[name];

  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={1.7} />;
}
