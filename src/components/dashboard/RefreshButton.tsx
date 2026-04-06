"use client";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

export function RefreshButton({
  onRefresh,
  isRefreshing,
  lastUpdated,
}: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-sm text-tremor-content">
          Last updated:{" "}
          {new Date(lastUpdated).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-2 rounded-lg bg-tremor-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tremor-brand-emphasis disabled:opacity-50"
      >
        {isRefreshing ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
              />
            </svg>
            Refresh Data
          </>
        )}
      </button>
    </div>
  );
}
