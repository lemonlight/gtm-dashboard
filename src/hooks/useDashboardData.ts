"use client";

import { useState, useCallback } from "react";
import type { DashboardData } from "@/lib/types";

const initialData: DashboardData = {
  timestamp: null,
  accountGrowth: { series: [], totalOrgs: 0, status: "loading" },
  mrr: { series: [], currentMRR: 0, status: "loading" },
  seats: {
    summary: {
      totalOrgs: 0,
      avgSeatsPerOrg: 0,
      totalPaidSeats: 0,
      totalUnpaidSeats: 0,
    },
    series: [],
    status: "loading",
  },
  retention: {
    overallRate: 0,
    funnel: [],
    series: [],
    orgsInWindow: 0,
    orgsOnTrack: 0,
    orgsFailed: 0,
    avgTimeToSecondProject: null,
    status: "loading",
  },
  activation: { rate: 0, series: [], status: "loading" },
  orgTable: { rows: [], total: 0, status: "loading" },
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(
    async (startDate: string, endDate: string, months: number) => {
      setIsRefreshing(true);

      // Set all sections to loading
      setData((prev) => ({
        ...prev,
        accountGrowth: { ...prev.accountGrowth, status: "loading" },
        mrr: { ...prev.mrr, status: "loading" },
        seats: { ...prev.seats, status: "loading" },
        retention: { ...prev.retention, status: "loading" },
        activation: { ...prev.activation, status: "loading" },
        orgTable: { ...prev.orgTable, status: "loading" },
      }));

      try {
        const res = await fetch("/api/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate, months }),
        });

        if (!res.ok) {
          throw new Error(`Refresh failed: ${res.status}`);
        }

        const result = await res.json();
        setData(result);
      } catch (error) {
        const errMsg =
          error instanceof Error ? error.message : "Unknown error";
        setData((prev) => ({
          ...prev,
          timestamp: new Date().toISOString(),
          accountGrowth: { ...prev.accountGrowth, status: "error", error: errMsg },
          mrr: { ...prev.mrr, status: "error", error: errMsg },
          seats: { ...prev.seats, status: "error", error: errMsg },
          retention: { ...prev.retention, status: "error", error: errMsg },
          activation: { ...prev.activation, status: "error", error: errMsg },
          orgTable: { ...prev.orgTable, status: "error", error: errMsg },
        }));
      } finally {
        setIsRefreshing(false);
      }
    },
    []
  );

  return { data, isRefreshing, refresh };
}
