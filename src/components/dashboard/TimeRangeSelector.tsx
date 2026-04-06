"use client";

import { type RangeKey, RANGE_OPTIONS } from "@/lib/dates";

interface TimeRangeSelectorProps {
  range: RangeKey;
  onChange: (range: RangeKey) => void;
}

export function TimeRangeSelector({ range, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-tremor-background-subtle p-1">
      {RANGE_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            range === opt.key
              ? "bg-white text-tremor-content-strong shadow-sm"
              : "text-tremor-content hover:text-tremor-content-strong"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
