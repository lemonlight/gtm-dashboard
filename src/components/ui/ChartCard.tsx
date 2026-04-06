"use client";

import { Card } from "@tremor/react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  loading,
  error,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-tremor-content-strong">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-tremor-content">{subtitle}</p>
        )}
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-tremor-border border-t-tremor-brand" />
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}
