import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getVehicles, upsertVehicle } from "@/lib/db";

/**
 * GET /api/vehicles
 * Returns active vehicles for public visitors, or all vehicles when ?all=1 and admin is logged in.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "1";

  if (includeAll) {
    const session = await getAdminSession();
    if (session) {
      return NextResponse.json({ vehicles: getVehicles({ activeOnly: false }) });
    }
  }

  return NextResponse.json({ vehicles: getVehicles({ activeOnly: true }) });
}

/**
 * POST /api/vehicles
 * Protected endpoint to add a new vehicle to the fleet catalog.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const vehicle = upsertVehicle(body);
  return NextResponse.json({ vehicle }, { status: 201 });
}
