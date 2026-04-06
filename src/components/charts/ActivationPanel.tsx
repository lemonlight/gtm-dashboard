"use client";

import { ChartCard } from "@/components/ui/ChartCard";
import { MetricCard } from "@/components/ui/MetricCard";
import type { ActivationData } from "@/lib/types";

interface Props {
  data: ActivationData;
}

export function ActivationPanel({ data }: Props) {
  const isLoading = data.status === "loading";
  const error = data.status === "error" ? data.error : undefined;

  return (
    <ChartCard
      title="D3 Activation Rate"
      subtitle="% of orgs that create a storyboard within 3 days of org creation"
      loading={isLoading}
      error={error}
    >
      <div className="mb-4">
        <MetricCard
          title="D3 Activation Rate"
          value={`${(data.rate * 100).toFixed(1)}%`}
        />
      </div>
      {data.series.length > 0 ? (
        <p className="text-sm text-tremor-content">
          Time series data available with more historical data.
        </p>
      ) : (
        <p className="text-sm text-tremor-content">
          Showing overall activation rate. Time series will populate as more data accumulates.
        </p>
      )}
    </ChartCard>
  );
}
