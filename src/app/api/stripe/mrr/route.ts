import { NextRequest, NextResponse } from "next/server";
import { fetchMRRTimeSeries } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const months = parseInt(searchParams.get("months") ?? "12");

    const series = await fetchMRRTimeSeries(months);

    const currentMRR = series.length > 0 ? series[series.length - 1].mrr : 0;

    return NextResponse.json({
      series: series.map((d) => ({
        date: d.month,
        value: d.mrr / 100, // Convert cents to dollars
      })),
      currentMRR: currentMRR / 100,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
