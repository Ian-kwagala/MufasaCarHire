import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBookings } from "@/lib/db";

/**
 * Escapes a single CSV field cleanly so commas, quotes, and line breaks don't break Excel/Sheets.
 */
function csvCell(val: unknown): string {
  const str = String(val ?? "");
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * GET /api/bookings/export
 * Protected endpoint that downloads the booking register as a CSV file
 * matching all columns from Page 5 of the Master Brief.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = getBookings();
  const headers = [
    "Job ID",
    "Created At",
    "Booking Date",
    "Booking Time",
    "Service Type",
    "Vehicle Assigned",
    "Vehicle Source",
    "Drive Mode",
    "Pickup Location",
    "Drop-off Location",
    "Flight Number",
    "Meet & Greet",
    "Client Name",
    "Phone / WhatsApp",
    "Client Email",
    "Client Type",
    "Promo / Hotel Code",
    "Marketing Opt-In",
    "Client Total (UGX)",
    "Payment Method",
    "Driver Commission (UGX)",
    "Partner Payout (UGX)",
    "Hotel Fee (UGX)",
    "Mufasa Net (UGX)",
    "Status",
    "Admin Notes",
  ];

  const rows = bookings.map((b) =>
    [
      b.job_id,
      b.created_at,
      b.booking_date,
      b.booking_time,
      b.service_type,
      b.vehicle_name,
      b.vehicle_source,
      b.drive_mode,
      b.pickup_location,
      b.dropoff_location,
      b.flight_number,
      b.meet_and_greet ? "Yes" : "No",
      b.client_name,
      b.client_phone,
      b.client_email,
      b.client_type,
      b.promo_or_hotel_code,
      b.marketing_opt_in ? "Yes" : "No",
      b.client_total_ugx,
      b.payment_method,
      b.driver_commission_ugx,
      b.partner_payout_ugx,
      b.hotel_fee_ugx,
      b.mufasa_net_ugx,
      b.status,
      b.admin_notes,
    ]
      .map(csvCell)
      .join(",")
  );

  const csvContent = [headers.map(csvCell).join(","), ...rows].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mufasa-bookings-register.csv"`,
    },
  });
}
