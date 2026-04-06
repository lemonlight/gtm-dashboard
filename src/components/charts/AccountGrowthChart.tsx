"use client";

import { LineChart } from "@tremor/react";
import { ChartCard } from "@/components/ui/ChartCard";
import type { AccountGrowthData } from "@/lib/types";

interface Props {
  data: AccountGrowthData;
}

export function AccountGrowthChart({ data }: Props) {
  const chartData = data.series.map((d) => ({
    date: d.date,
    "Total Orgs": d.value,
  }));

  return (
    <ChartCard
      title="Account Growth"
      subtitle="Cumulative organizations created over time"
      loading={data.status === "loading"}
      error={data.status === "error" ? data.error : undefined}
    >
      <LineChart
        data={chartData}
        index="date"
        categories={["Total Orgs"]}
        colors={["blue"]}
        yAxisWidth={48}
        showAnimation
        className="h-64"
      />
    </ChartCard>
  );
}
