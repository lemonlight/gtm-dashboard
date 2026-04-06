import type { CohortConfig, CohortState } from "./types";
import cohortConfig from "@/config/cohorts.json";

export function getCohortConfig(): Record<string, CohortConfig> {
  return cohortConfig as Record<string, CohortConfig>;
}

export function getDefaultCohortState(): CohortState {
  const state: CohortState = {};
  for (const key of Object.keys(cohortConfig)) {
    state[key] = false;
  }
  return state;
}

export function filterByActiveCohorts<T>(
  data: T[],
  getOrgId: (item: T) => string,
  activeCohorts: CohortState
): T[] {
  const config = getCohortConfig();
  const activeKeys = Object.entries(activeCohorts)
    .filter(([, active]) => active)
    .map(([key]) => key);

  if (activeKeys.length === 0) return data;

  // Build inclusion set (union of all active inclusion cohorts)
  const includeIds = new Set<string>();
  let hasInclusion = false;
  for (const key of activeKeys) {
    const cohort = config[key];
    if (cohort && !cohort.isExclusion) {
      hasInclusion = true;
      for (const id of cohort.orgIds) {
        includeIds.add(id);
      }
    }
  }

  // Build exclusion set
  const excludeIds = new Set<string>();
  for (const key of activeKeys) {
    const cohort = config[key];
    if (cohort?.isExclusion) {
      for (const id of cohort.orgIds) {
        excludeIds.add(id);
      }
    }
  }

  return data.filter((item) => {
    const id = getOrgId(item);
    if (excludeIds.has(id)) return false;
    if (!hasInclusion) return true;
    return includeIds.has(id);
  });
}
