"use client";

import { LineChart } from "@tremor/react";
import { ChartCard } from "@/components/ui/ChartCard";
import type { MRRData } from "@/lib/types";

interface Props {
  data: MRRData;
}

const dollarFormatter = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export function MRRChart({ data }: Props) {
  const chartData = data.series.map((d) => ({
    date: d.date,
    MRR: d.value,
  }));

  return (
    <ChartCard
      title="Monthly Recurring Revenue"
      subtitle="Hero Stripe account only (not Lemonlightmedia account)"
      loading={data.status === "loading"}
      error={data.status === "error" ? data.error : undefined}
    >
      <LineChart
        data={chartData}
        index="date"
        categories={["MRR"]}
        colors={["emerald"]}
        valueFormatter={dollarFormatter}
        yAxisWidth={72}
        showAnimation
        className="h-64"
      />
    </ChartCard>
  );
}
