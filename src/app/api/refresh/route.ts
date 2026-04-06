import { NextRequest, NextResponse } from "next/server";
import { fetchSegmentation, fetchFunnel } from "@/lib/amplitude";
import { fetchMRRTimeSeries } from "@/lib/stripe";
import { getDb } from "@/lib/mongodb";
import type { DataPoint, FunnelStep } from "@/lib/types";

export const maxDuration = 60;

interface RefreshBody {
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
  months?: number;
}

async function fetchAccountGrowth(start: string, end: string) {
  const data = await fetchSegmentation({
    event: "Organization Created",
    start,
    end,
    metric: "totals",
    interval: 1,
  });

  // Parse Amplitude segmentation response
  const result = data?.data as Record<string, unknown> | undefined;
  const seriesCollections = result?.series as number[][][] | undefined;
  const xValues = result?.xValues as string[] | undefined;

  if (!seriesCollections || !xValues) {
    return { series: [], totalOrgs: 0 };
  }

  // seriesCollections[0] is the first segment, seriesCollections[0][0] is the values
  const values = seriesCollections[0]?.[0] ?? [];

  // Build cumulative series
  let cumulative = 0;
  const series: DataPoint[] = xValues.map((date, i) => {
    cumulative += values[i] ?? 0;
    return { date, value: cumulative };
  });

  return {
    series,
    totalOrgs: cumulative,
  };
}

async function fetchMRR(months: number) {
  const mrrData = await fetchMRRTimeSeries(months);
  const series: DataPoint[] = mrrData.map((d) => ({
    date: d.month,
    value: d.mrr / 100,
  }));
  const currentMRR = series.length > 0 ? series[series.length - 1].value : 0;

  return { series, currentMRR };
}

async function fetchSeats() {
  const db = await getDb();

  const orgs = await db
    .collection("organizations")
    .find({ isDeleted: { $ne: true } })
    .toArray();

  const orgIds = orgs.map((o) => o._id);

  const affiliations = await db
    .collection("organizationuseraffiliations")
    .find({ organizationId: { $in: orgIds } })
    .toArray();

  let totalPaidSeats = 0;
  let totalUnpaidSeats = 0;

  for (const aff of affiliations) {
    if (aff.seatType === "Member") totalPaidSeats++;
    else totalUnpaidSeats++;
  }

  const totalOrgs = orgs.length;
  const totalSeats = totalPaidSeats + totalUnpaidSeats;
  const avgSeatsPerOrg = totalOrgs > 0 ? totalSeats / totalOrgs : 0;

  // Cumulative time series
  const sorted = affiliations
    .filter((a) => a.createdAt)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const seriesMap = new Map<string, { paid: number; unpaid: number }>();
  let runPaid = 0;
  let runUnpaid = 0;
  for (const aff of sorted) {
    const key = new Date(aff.createdAt).toISOString().slice(0, 10);
    if (aff.seatType === "Member") runPaid++;
    else runUnpaid++;
    seriesMap.set(key, { paid: runPaid, unpaid: runUnpaid });
  }

  const series = Array.from(seriesMap.entries()).map(([date, d]) => ({
    date,
    "Paid Seats": d.paid,
    "Unpaid Seats": d.unpaid,
  }));

  return {
    summary: {
      totalOrgs,
      avgSeatsPerOrg: Math.round(avgSeatsPerOrg * 10) / 10,
      totalPaidSeats,
      totalUnpaidSeats,
    },
    series,
  };
}

async function fetchRetention(start: string, end: string) {
  const data = await fetchFunnel({
    events: ["Organization Created", "Project Created"],
    start,
    end,
    conversionWindowSeconds: 2592000, // 30 days
  });

  const result = data?.data as Record<string, unknown> | undefined;

  // Parse funnel steps
  const funnelData = result as Record<string, unknown> | undefined;
  const steps: FunnelStep[] = [];
  let overallRate = 0;

  if (funnelData) {
    // Amplitude funnel response has a specific structure
    // Try to extract the completion rate
    const formattedData = funnelData?.formattedSeries as Array<{
      name: string;
      count: number;
      percentage: number;
    }>;

    if (formattedData && formattedData.length >= 2) {
      for (const step of formattedData) {
        steps.push({
          name: step.name,
          count: step.count,
          conversionRate: step.percentage / 100,
        });
      }
      overallRate = (formattedData[formattedData.length - 1]?.percentage ?? 0) / 100;
    }
  }

  return {
    overallRate,
    funnel: steps,
    series: [] as DataPoint[], // Time series requires more complex parsing
    orgsInWindow: 0,
    orgsOnTrack: 0,
    orgsFailed: 0,
    avgTimeToSecondProject: null,
  };
}

async function fetchActivation(start: string, end: string) {
  const data = await fetchFunnel({
    events: ["Organization Created", "Storyboard Created"],
    start,
    end,
    conversionWindowSeconds: 259200, // 3 days
  });

  const result = data?.data as Record<string, unknown> | undefined;
  let rate = 0;

  if (result) {
    const formattedData = result?.formattedSeries as Array<{
      percentage: number;
    }>;
    if (formattedData && formattedData.length >= 2) {
      rate = (formattedData[formattedData.length - 1]?.percentage ?? 0) / 100;
    }
  }

  return {
    rate,
    series: [] as DataPoint[],
  };
}

async function fetchOrgTable() {
  const db = await getDb();

  const orgs = await db
    .collection("organizations")
    .find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .toArray();

  const orgIds = orgs.map((o) => o._id);

  const [projectCounts, seatCounts] = await Promise.all([
    db
      .collection("projects")
      .aggregate([
        {
          $match: {
            organizationId: { $in: orgIds },
            isDeleted: { $ne: true },
          },
        },
        { $group: { _id: "$organizationId", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection("organizationuseraffiliations")
      .aggregate([
        { $match: { organizationId: { $in: orgIds } } },
        {
          $group: {
            _id: { orgId: "$organizationId", seatType: "$seatType" },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  const projectMap = new Map(
    projectCounts.map((p) => [p._id.toString(), p.count])
  );

  const seatMap = new Map<string, { paid: number; unpaid: number }>();
  for (const s of seatCounts) {
    const orgId = s._id.orgId.toString();
    if (!seatMap.has(orgId)) seatMap.set(orgId, { paid: 0, unpaid: 0 });
    const entry = seatMap.get(orgId)!;
    if (s._id.seatType === "Member") entry.paid = s.count;
    else entry.unpaid = s.count;
  }

  const rows = orgs.map((org) => {
    const orgId = org._id.toString();
    const seats = seatMap.get(orgId) ?? { paid: 0, unpaid: 0 };
    return {
      orgId,
      name: org.name ?? "Unnamed",
      createdAt: org.createdAt
        ? new Date(org.createdAt).toISOString().slice(0, 10)
        : "Unknown",
      projectCount: projectMap.get(orgId) ?? 0,
      paidSeats: seats.paid,
      unpaidSeats: seats.unpaid,
      hitD30: null,
      hitD30Ever: null,
    };
  });

  return { rows, total: rows.length };
}

export async function POST(request: NextRequest) {
  try {
    const body: RefreshBody = await request.json();
    const { startDate, endDate, months } = body;

    // Fan out to all data sources
    // Amplitude calls serialized (rate limit: 5 concurrent)
    // MongoDB + Stripe in parallel with Amplitude
    const [accountGrowth, mrr, seats, retention, activation, orgTable] =
      await Promise.allSettled([
        fetchAccountGrowth(startDate, endDate),
        fetchMRR(months ?? 12),
        fetchSeats(),
        fetchRetention(startDate, endDate),
        fetchActivation(startDate, endDate),
        fetchOrgTable(),
      ]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      accountGrowth:
        accountGrowth.status === "fulfilled"
          ? { ...accountGrowth.value, status: "ok" }
          : {
              series: [],
              totalOrgs: 0,
              status: "error",
              error:
                accountGrowth.status === "rejected"
                  ? String(accountGrowth.reason)
                  : "Unknown error",
            },
      mrr:
        mrr.status === "fulfilled"
          ? { ...mrr.value, status: "ok" }
          : {
              series: [],
              currentMRR: 0,
              status: "error",
              error:
                mrr.status === "rejected"
                  ? String(mrr.reason)
                  : "Unknown error",
            },
      seats:
        seats.status === "fulfilled"
          ? { ...seats.value, status: "ok" }
          : {
              summary: {
                totalOrgs: 0,
                avgSeatsPerOrg: 0,
                totalPaidSeats: 0,
                totalUnpaidSeats: 0,
              },
              series: [],
              status: "error",
              error:
                seats.status === "rejected"
                  ? String(seats.reason)
                  : "Unknown error",
            },
      retention:
        retention.status === "fulfilled"
          ? { ...retention.value, status: "ok" }
          : {
              overallRate: 0,
              funnel: [],
              series: [],
              orgsInWindow: 0,
              orgsOnTrack: 0,
              orgsFailed: 0,
              avgTimeToSecondProject: null,
              status: "error",
              error:
                retention.status === "rejected"
                  ? String(retention.reason)
                  : "Unknown error",
            },
      activation:
        activation.status === "fulfilled"
          ? { ...activation.value, status: "ok" }
          : {
              rate: 0,
              series: [],
              status: "error",
              error:
                activation.status === "rejected"
                  ? String(activation.reason)
                  : "Unknown error",
            },
      orgTable:
        orgTable.status === "fulfilled"
          ? { ...orgTable.value, status: "ok" }
          : {
              rows: [],
              total: 0,
              status: "error",
              error:
                orgTable.status === "rejected"
                  ? String(orgTable.reason)
                  : "Unknown error",
            },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
