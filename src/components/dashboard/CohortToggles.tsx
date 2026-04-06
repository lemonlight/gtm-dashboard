"use client";

import type { CohortConfig, CohortState } from "@/lib/types";

interface CohortTogglesProps {
  config: Record<string, CohortConfig>;
  activeToggles: CohortState;
  onToggle: (key: string) => void;
}

export function CohortToggles({
  config,
  activeToggles,
  onToggle,
}: CohortTogglesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(config).map(([key, cohort]) => {
        const isActive = activeToggles[key];
        const hasOrgIds = cohort.orgIds.length > 0;

        return (
          <button
            key={key}
            onClick={() => hasOrgIds && onToggle(key)}
            disabled={!hasOrgIds}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              !hasOrgIds
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : isActive
                  ? cohort.isExclusion
                    ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                    : "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
                  : "bg-tremor-background-subtle text-tremor-content hover:bg-tremor-background-emphasis"
            }`}
            title={
              !hasOrgIds
                ? `${cohort.label} — no org IDs configured`
                : isActive
                  ? `${cohort.label}: active (click to deactivate)`
                  : `${cohort.label}: inactive (click to activate)`
            }
          >
            {cohort.label}
            {!hasOrgIds && " (empty)"}
          </button>
        );
      })}
    </div>
  );
}
