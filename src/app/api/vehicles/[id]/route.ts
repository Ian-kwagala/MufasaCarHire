import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteVehicle, upsertVehicle } from "@/lib/db";

/**
 * PATCH /api/vehicles/[id]
 * Protected endpoint to edit a vehicle's specs, price, photo, or visibility.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const vehicleId = Number(id);
  if (Number.isNaN(vehicleId)) {
    return NextResponse.json({ error: "Invalid vehicle ID" }, { status: 400 });
  }

  const body = await request.json();
  const vehicle = upsertVehicle({ ...body, id: vehicleId });
  return NextResponse.json({ vehicle });
}

/**
 * DELETE /api/vehicles/[id]
 * Protected endpoint to remove a vehicle from the fleet.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const vehicleId = Number(id);
  if (Number.isNaN(vehicleId)) {
    return NextResponse.json({ error: "Invalid vehicle ID" }, { status: 400 });
  }

  deleteVehicle(vehicleId);
  return NextResponse.json({ ok: true });
}
