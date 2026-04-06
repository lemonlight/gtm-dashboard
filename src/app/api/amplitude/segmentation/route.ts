import { NextRequest, NextResponse } from "next/server";
import { fetchSegmentation } from "@/lib/amplitude";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const event = searchParams.get("event");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const metric = (searchParams.get("metric") ?? "totals") as
      | "uniques"
      | "totals";
    const interval = parseInt(searchParams.get("interval") ?? "1");

    if (!event || !start || !end) {
      return NextResponse.json(
        { error: "Missing required params: event, start, end" },
        { status: 400 }
      );
    }

    const data = await fetchSegmentation({
      event,
      start,
      end,
      metric,
      interval,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
