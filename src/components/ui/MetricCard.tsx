"use client";

import { Card } from "@tremor/react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  loading,
  error,
}: MetricCardProps) {
  return (
    <Card className="p-4">
      <p className="text-tremor-default text-tremor-content">{title}</p>
      {loading ? (
        <div className="mt-1 h-8 w-24 animate-pulse rounded bg-tremor-background-subtle" />
      ) : error ? (
        <p className="mt-1 text-sm text-red-500">Error</p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold text-tremor-content-strong">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-tremor-default text-tremor-content">
              {subtitle}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
