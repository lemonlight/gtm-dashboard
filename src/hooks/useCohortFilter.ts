"use client";

import { useState, useCallback } from "react";
import { getDefaultCohortState, filterByActiveCohorts, getCohortConfig } from "@/lib/cohorts";
import type { CohortState } from "@/lib/types";

export function useCohortFilter() {
  const [activeToggles, setActiveToggles] = useState<CohortState>(
    getDefaultCohortState()
  );

  const toggle = useCallback((key: string) => {
    setActiveToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filterData = useCallback(
    <T>(data: T[], getOrgId: (item: T) => string): T[] => {
      return filterByActiveCohorts(data, getOrgId, activeToggles);
    },
    [activeToggles]
  );

  const config = getCohortConfig();

  return { activeToggles, toggle, filterData, config };
}
