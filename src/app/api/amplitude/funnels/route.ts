import { NextRequest, NextResponse } from "next/server";
import { fetchFunnel } from "@/lib/amplitude";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const eventsRaw = searchParams.get("events");
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const cs = searchParams.get("cs");

    if (!eventsRaw || !start || !end || !cs) {
      return NextResponse.json(
        { error: "Missing required params: events (JSON array), start, end, cs" },
        { status: 400 }
      );
    }

    const events: string[] = JSON.parse(eventsRaw);
    const data = await fetchFunnel({
      events,
      start,
      end,
      conversionWindowSeconds: parseInt(cs),
    });

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
