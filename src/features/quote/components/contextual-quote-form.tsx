"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getInsuranceBySlug } from "@/features/insurance/catalog";

export function resolveContextualInsuranceType(value: string | null) {
  if (!value) {
    return undefined;
  }

  return getInsuranceBySlug(value)?.slug;
}

export function InsuranceTypeSearchParam({ onResolve }: { onResolve: (value: string) => void }) {
  const searchParams = useSearchParams();
  const requestedInsuranceType = searchParams.get("seguro");

  useEffect(() => {
    if (requestedInsuranceType === null) {
      return;
    }

    onResolve(resolveContextualInsuranceType(requestedInsuranceType) ?? "");
  }, [onResolve, requestedInsuranceType]);

  return null;
}
