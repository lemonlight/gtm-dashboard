const API_KEY = process.env.AMPLITUDE_API_KEY!;
const SECRET_KEY = process.env.AMPLITUDE_SECRET_KEY!;

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");
}

async function amplitudeFetch(
  url: string,
  retries = 2
): Promise<Record<string, unknown>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: getAuthHeader() },
    });

    if (res.status === 429 && attempt < retries) {
      // Rate limited — wait and retry
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Amplitude API error ${res.status}: ${text}`);
    }

    return res.json();
  }
  throw new Error("Amplitude API: max retries exceeded");
}

export async function fetchSegmentation(params: {
  event: string;
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
  metric?: "uniques" | "totals" | "avg" | "pct_dau";
  interval?: number; // 1 = daily, 7 = weekly, 30 = monthly
  groupBy?: string;
}): Promise<Record<string, unknown>> {
  const e = JSON.stringify({ event_type: params.event });
  const m = params.metric ?? "totals";
  const i = params.interval ?? 1;

  let url = `https://amplitude.com/api/2/events/segmentation?e=${encodeURIComponent(e)}&start=${params.start}&end=${params.end}&m=${m}&i=${i}`;

  if (params.groupBy) {
    const g = JSON.stringify({ type: "event", value: params.groupBy });
    url += `&g=${encodeURIComponent(g)}`;
  }

  return amplitudeFetch(url);
}

export async function fetchFunnel(params: {
  events: string[];
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
  conversionWindowSeconds: number;
}): Promise<Record<string, unknown>> {
  const eventParams = params.events
    .map((eventType) => `e=${encodeURIComponent(JSON.stringify({ event_type: eventType }))}`)
    .join("&");

  const url = `https://amplitude.com/api/2/funnels?${eventParams}&start=${params.start}&end=${params.end}&cs=${params.conversionWindowSeconds}`;

  return amplitudeFetch(url);
}
