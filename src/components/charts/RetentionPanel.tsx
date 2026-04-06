"use client";

import { BarChart } from "@tremor/react";
import { ChartCard } from "@/components/ui/ChartCard";
import { MetricCard } from "@/components/ui/MetricCard";
import type { RetentionData } from "@/lib/types";

interface Props {
  data: RetentionData;
}

const pctFormatter = (value: number) => `${(value * 100).toFixed(1)}%`;

export function RetentionPanel({ data }: Props) {
  const isLoading = data.status === "loading";
  const error = data.status === "error" ? data.error : undefined;

  const funnelData = data.funnel.map((step) => ({
    step: step.name,
    Count: step.count,
  }));

  return (
    <ChartCard
      title="D30 Project Retention"
      subtitle="% of orgs that create a 2nd project within 30 days of org creation"
      loading={isLoading}
      error={error}
    >
      <div className="mb-4 grid grid-cols-2 gap-3">
        <MetricCard
          title="D30 Retention Rate"
          value={pctFormatter(data.overallRate)}
        />
        <MetricCard
          title="Funnel Steps"
          value={
            data.funnel.length > 0
              ? `${data.funnel[0]?.count ?? 0} → ${data.funnel[data.funnel.length - 1]?.count ?? 0}`
              : "—"
          }
          subtitle={
            data.funnel.length > 0
              ? `${data.funnel.map((s) => s.name).join(" → ")}`
              : undefined
          }
        />
      </div>
      {funnelData.length > 0 && (
        <BarChart
          data={funnelData}
          index="step"
          categories={["Count"]}
          colors={["indigo"]}
          yAxisWidth={48}
          showAnimation
          className="h-48"
        />
      )}
    </ChartCard>
  );
}
