import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteBooking, updateBooking } from "@/lib/db";

/**
 * PATCH /api/bookings/[id]
 * Protected endpoint for admins to update booking status, assigned vehicle source,
 * payment method, and driver/partner/hotel payout splits.
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
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  const body = await request.json();
  const updated = updateBooking(bookingId, body);
  if (!updated) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking: updated });
}

/**
 * DELETE /api/bookings/[id]
 * Protected endpoint to remove a booking record.
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
  const bookingId = Number(id);
  if (Number.isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  deleteBooking(bookingId);
  return NextResponse.json({ ok: true });
}
