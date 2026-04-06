"use client";

import { useCallback } from "react";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { TimeRangeSelector } from "@/components/dashboard/TimeRangeSelector";
import { CohortToggles } from "@/components/dashboard/CohortToggles";
import { MetricCard } from "@/components/ui/MetricCard";
import { AccountGrowthChart } from "@/components/charts/AccountGrowthChart";
import { MRRChart } from "@/components/charts/MRRChart";
import { SeatsPanel } from "@/components/charts/SeatsPanel";
import { RetentionPanel } from "@/components/charts/RetentionPanel";
import { ActivationPanel } from "@/components/charts/ActivationPanel";
import { OrgTable } from "@/components/charts/OrgTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useTimeRange } from "@/hooks/useTimeRange";
import { useCohortFilter } from "@/hooks/useCohortFilter";

const dollarFormat = (v: number) =>
  `$${v.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
const pctFormat = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function DashboardPage() {
  const { data, isRefreshing, refresh } = useDashboardData();
  const { range, setRange, getAmplitudeRange, getMonths } = useTimeRange();
  const { activeToggles, toggle, config } = useCohortFilter();

  const handleRefresh = useCallback(() => {
    const { start, end } = getAmplitudeRange();
    refresh(start, end, getMonths());
  }, [getAmplitudeRange, getMonths, refresh]);

  const hasData = data.timestamp !== null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GTM Dashboard</h1>
          <p className="text-sm text-gray-500">
            Source of truth for key business metrics
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={data.timestamp}
        />
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CohortToggles
          config={config}
          activeToggles={activeToggles}
          onToggle={toggle}
        />
        <TimeRangeSelector range={range} onChange={setRange} />
      </div>

      {!hasData && !isRefreshing ? (
        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">
              Welcome to the GTM Dashboard
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Click &quot;Refresh Data&quot; to load your metrics
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metrics Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              title="Total Orgs"
              value={
                hasData ? data.accountGrowth.totalOrgs.toLocaleString() : "—"
              }
              loading={data.accountGrowth.status === "loading"}
              error={
                data.accountGrowth.status === "error"
                  ? data.accountGrowth.error
                  : undefined
              }
            />
            <MetricCard
              title="Current MRR"
              value={hasData ? dollarFormat(data.mrr.currentMRR) : "—"}
              loading={data.mrr.status === "loading"}
              error={
                data.mrr.status === "error" ? data.mrr.error : undefined
              }
            />
            <MetricCard
              title="D30 Retention"
              value={hasData ? pctFormat(data.retention.overallRate) : "—"}
              loading={data.retention.status === "loading"}
              error={
                data.retention.status === "error"
                  ? data.retention.error
                  : undefined
              }
            />
            <MetricCard
              title="D3 Activation"
              value={hasData ? pctFormat(data.activation.rate) : "—"}
              loading={data.activation.status === "loading"}
              error={
                data.activation.status === "error"
                  ? data.activation.error
                  : undefined
              }
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AccountGrowthChart data={data.accountGrowth} />
            <MRRChart data={data.mrr} />
            <SeatsPanel data={data.seats} />
            <RetentionPanel data={data.retention} />
            <ActivationPanel data={data.activation} />
            <OrgTable data={data.orgTable} />
          </div>
        </>
      )}
    </div>
  );
}
