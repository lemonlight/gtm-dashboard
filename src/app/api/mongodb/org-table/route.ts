import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const db = await getDb();

    // Get all active organizations
    const orgs = await db
      .collection("organizations")
      .find({ isDeleted: { $ne: true } })
      .sort({ [sortBy]: sortDir })
      .toArray();

    const orgIds = orgs.map((o) => o._id);

    // Get project counts per org
    const projectCounts = await db
      .collection("projects")
      .aggregate([
        { $match: { organizationId: { $in: orgIds }, isDeleted: { $ne: true } } },
        { $group: { _id: "$organizationId", count: { $sum: 1 } } },
      ])
      .toArray();

    const projectCountMap = new Map(
      projectCounts.map((p) => [p._id.toString(), p.count])
    );

    // Get seat counts per org
    const seatCounts = await db
      .collection("organizationuseraffiliations")
      .aggregate([
        { $match: { organizationId: { $in: orgIds } } },
        {
          $group: {
            _id: {
              orgId: "$organizationId",
              seatType: "$seatType",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

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
        projectCount: projectCountMap.get(orgId) ?? 0,
        paidSeats: seats.paid,
        unpaidSeats: seats.unpaid,
        hitD30: null, // Will be enriched from Amplitude data
        hitD30Ever: null,
      };
    });

    return NextResponse.json({
      rows,
      total: rows.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
