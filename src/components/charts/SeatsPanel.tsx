"use client";

import { LineChart } from "@tremor/react";
import { ChartCard } from "@/components/ui/ChartCard";
import { MetricCard } from "@/components/ui/MetricCard";
import type { SeatsData } from "@/lib/types";

interface Props {
  data: SeatsData;
}

export function SeatsPanel({ data }: Props) {
  const isLoading = data.status === "loading";
  const error = data.status === "error" ? data.error : undefined;

  return (
    <ChartCard
      title="Seats"
      subtitle="Paid (Member) and unpaid (Guest) seats across organizations"
      loading={isLoading}
      error={error}
    >
      <div className="mb-4 grid grid-cols-3 gap-3">
        <MetricCard
          title="Avg Seats / Org"
          value={data.summary.avgSeatsPerOrg.toString()}
        />
        <MetricCard
          title="Paid Seats"
          value={data.summary.totalPaidSeats.toLocaleString()}
        />
        <MetricCard
          title="Unpaid Seats"
          value={data.summary.totalUnpaidSeats.toLocaleString()}
        />
      </div>
      {data.series.length > 0 && (
        <LineChart
          data={data.series}
          index="date"
          categories={["Paid Seats", "Unpaid Seats"]}
          colors={["blue", "gray"]}
          yAxisWidth={48}
          showAnimation
          className="h-48"
        />
      )}
    </ChartCard>
  );
}
