export type RangeKey = "7d" | "30d" | "90d" | "all";

export const RANGE_OPTIONS: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "Last 7 Days", days: 7 },
  { key: "30d", label: "Last 30 Days", days: 30 },
  { key: "90d", label: "Last 90 Days", days: 90 },
  { key: "all", label: "All Time", days: null },
];

const ALL_TIME_START = "2024-01-01";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatYYYYMMDD(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

export function formatISO(date: Date): string {
  return date.toISOString();
}

export function getDateRange(rangeKey: RangeKey): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  const days = RANGE_OPTIONS.find((r) => r.key === rangeKey)?.days;
  if (days === null || days === undefined) {
    start = new Date(ALL_TIME_START);
  } else {
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  }

  return { start, end };
}

export function getAmplitudeDateRange(rangeKey: RangeKey): {
  start: string;
  end: string;
} {
  const { start, end } = getDateRange(rangeKey);
  return { start: formatYYYYMMDD(start), end: formatYYYYMMDD(end) };
}
