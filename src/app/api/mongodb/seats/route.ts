import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const maxDuration = 30;

export async function GET() {
  try {
    const db = await getDb();

    // Get all active organizations
    const orgs = await db
      .collection("organizations")
      .find({ isDeleted: { $ne: true } })
      .toArray();

    const orgIds = orgs.map((o) => o._id);

    // Get all affiliations for active orgs
    const affiliations = await db
      .collection("organizationuseraffiliations")
      .find({ organizationId: { $in: orgIds } })
      .toArray();

    // Count paid (Member) vs unpaid (Guest) seats
    let totalPaidSeats = 0;
    let totalUnpaidSeats = 0;
    const seatsByOrg: Record<string, { paid: number; unpaid: number }> = {};

    for (const aff of affiliations) {
      const orgId = aff.organizationId.toString();
      if (!seatsByOrg[orgId]) seatsByOrg[orgId] = { paid: 0, unpaid: 0 };

      if (aff.seatType === "Member") {
        totalPaidSeats++;
        seatsByOrg[orgId].paid++;
      } else {
        totalUnpaidSeats++;
        seatsByOrg[orgId].unpaid++;
      }
    }

    const totalOrgs = orgs.length;
    const totalSeats = totalPaidSeats + totalUnpaidSeats;
    const avgSeatsPerOrg = totalOrgs > 0 ? totalSeats / totalOrgs : 0;

    // Build time series: cumulative seats over time (by affiliation createdAt)
    const sortedAffiliations = affiliations
      .filter((a) => a.createdAt)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const seriesMap = new Map<string, { paid: number; unpaid: number }>();
    let runningPaid = 0;
    let runningUnpaid = 0;

    for (const aff of sortedAffiliations) {
      const dateKey = new Date(aff.createdAt).toISOString().slice(0, 10);
      if (aff.seatType === "Member") runningPaid++;
      else runningUnpaid++;
      seriesMap.set(dateKey, { paid: runningPaid, unpaid: runningUnpaid });
    }

    const series = Array.from(seriesMap.entries()).map(
      ([date, { paid, unpaid }]) => ({
        date,
        "Paid Seats": paid,
        "Unpaid Seats": unpaid,
      })
    );

    return NextResponse.json({
      summary: {
        totalOrgs,
        avgSeatsPerOrg: Math.round(avgSeatsPerOrg * 10) / 10,
        totalPaidSeats,
        totalUnpaidSeats,
      },
      series,
      seatsByOrg,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
