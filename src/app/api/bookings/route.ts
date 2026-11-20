import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createBooking, getBookings, getSiteSettings } from "@/lib/db";
import { buildBookingWhatsAppUrl } from "@/lib/whatsapp";

/**
 * GET /api/bookings
 * Protected endpoint used by the Admin Dashboard to view and filter customer orders.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "All";
  const serviceType = searchParams.get("serviceType") ?? "All";
  const search = searchParams.get("search") ?? "";

  const bookings = getBookings({ status, serviceType, search });
  return NextResponse.json({ bookings });
}

/**
 * POST /api/bookings
 * Public endpoint called when a customer submits any booking, airport transfer,
 * moving/cargo quote, or corporate inquiry form. Saves to SQLite first,
 * then returns the Job ID and pre-filled WhatsApp URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const clientName = String(body.client_name ?? "").trim();
    const clientPhone = String(body.client_phone ?? "").trim();
    const serviceType = String(body.service_type ?? "Car Hire").trim();

    if (!clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Please provide your name and phone/WhatsApp number." },
        { status: 400 }
      );
    }

    const settings = getSiteSettings();

    // Auto-calculate estimated UGX total if a base rate is given and KING15 promo is applied
    let estimatedTotal = Number(body.client_total_ugx ?? 0) || 0;
    const code = String(body.promo_or_hotel_code ?? "").trim();
    if (
      estimatedTotal > 0 &&
      settings.promo_banner_active === "true" &&
      code.toUpperCase() === settings.promo_code.toUpperCase()
    ) {
      const discount = Number(settings.promo_discount_percent || 15);
      estimatedTotal = Math.round(estimatedTotal * (1 - discount / 100));
    }

    const booking = createBooking({
      booking_date: String(body.booking_date ?? ""),
      booking_time: String(body.booking_time ?? ""),
      service_type: serviceType,
      vehicle_id: body.vehicle_id ? Number(body.vehicle_id) : null,
      vehicle_name: String(body.vehicle_name ?? ""),
      vehicle_source: String(body.vehicle_source ?? "Unassigned"),
      drive_mode: String(body.drive_mode ?? "With Driver"),
      pickup_location: String(body.pickup_location ?? ""),
      dropoff_location: String(body.dropoff_location ?? ""),
      flight_number: String(body.flight_number ?? ""),
      meet_and_greet: body.meet_and_greet ? 1 : 0,
      load_description: String(body.load_description ?? ""),
      helpers_needed: String(body.helpers_needed ?? "N/A"),
      company_hotel_name: String(body.company_hotel_name ?? ""),
      monthly_needs: String(body.monthly_needs ?? ""),
      client_name: clientName,
      client_phone: clientPhone,
      client_email: String(body.client_email ?? ""),
      client_type: String(body.client_type ?? "Individual"),
      promo_or_hotel_code: code,
      marketing_opt_in: body.marketing_opt_in ? 1 : 0,
      rate_shown: String(body.rate_shown ?? "Get Quote"),
      currency: String(body.currency ?? "UGX"),
      client_total_ugx: estimatedTotal,
      admin_notes: String(body.admin_notes ?? ""),
    });

    const pickupDropoff =
      booking.pickup_location || booking.dropoff_location
        ? `${booking.pickup_location || "Kampala"} -> ${booking.dropoff_location || "TBD"}`
        : "To be confirmed";

    const dateTime =
      booking.booking_date || booking.booking_time
        ? `${booking.booking_date || "Flexible"} at ${booking.booking_time || "TBD"}`
        : "To be confirmed";

    const extraNotesParts = [
      booking.meet_and_greet ? "Meet & Greet with Name Sign requested" : null,
      booking.load_description ? `Cargo/Load: ${booking.load_description}` : null,
      booking.helpers_needed && booking.helpers_needed !== "N/A"
        ? `Helpers needed: ${booking.helpers_needed}`
        : null,
      booking.company_hotel_name ? `Company/Hotel: ${booking.company_hotel_name}` : null,
      booking.monthly_needs ? `Monthly Needs: ${booking.monthly_needs}` : null,
    ].filter(Boolean);

    const whatsappUrl = buildBookingWhatsAppUrl(settings.primary_whatsapp, {
      jobId: booking.job_id,
      service: booking.service_type,
      vehicle: booking.vehicle_name || "Recommend best vehicle",
      driveOption: booking.drive_mode,
      pickupDropoff,
      dateTime,
      flightNo: booking.flight_number || undefined,
      promoOrHotelCode: booking.promo_or_hotel_code || undefined,
      rateShown: booking.rate_shown,
      clientName: booking.client_name,
      clientPhone: booking.client_phone,
      extraNotes: extraNotesParts.join(" | ") || undefined,
    });

    return NextResponse.json({ booking, whatsappUrl }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Unable to save booking. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }
}
