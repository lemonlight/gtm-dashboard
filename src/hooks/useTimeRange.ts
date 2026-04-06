"use client";

import { useState, useCallback } from "react";
import { type RangeKey, getAmplitudeDateRange, getDateRange } from "@/lib/dates";

export function useTimeRange() {
  const [range, setRange] = useState<RangeKey>("30d");

  const getAmplitudeRange = useCallback(() => {
    return getAmplitudeDateRange(range);
  }, [range]);

  const getMonths = useCallback(() => {
    const { start, end } = getDateRange(range);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diffMs / (30 * 24 * 60 * 60 * 1000)));
  }, [range]);

  return { range, setRange, getAmplitudeRange, getMonths };
}
