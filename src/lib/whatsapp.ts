/**
 * Utility helpers for formatting currency, Ugandan phone numbers,
 * and generating the pre-filled WhatsApp booking URLs specified in the Master Brief.
 */

export function formatUGX(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  if (Number.isNaN(num)) return "UGX 0";
  return `UGX ${num.toLocaleString("en-UG")}`;
}

/**
 * Converts a local Ugandan number like "0708 854 302" into "256708854302"
 * so wa.me links work reliably from any country or device.
 */
export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `256${digits.slice(1)}`;
  }
  if (digits.startsWith("256")) {
    return digits;
  }
  return digits || "256708854302";
}

/**
 * Formats "256708854302" for human reading: "0708 854 302".
 */
export function formatDisplayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  let local = digits;
  if (digits.startsWith("256") && digits.length === 12) {
    local = `0${digits.slice(3)}`;
  }
  if (local.length === 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return phone;
}

export interface WhatsAppBookingPayload {
  jobId?: string;
  service: string;
  vehicle: string;
  driveOption: string;
  pickupDropoff: string;
  dateTime: string;
  flightNo?: string;
  promoOrHotelCode?: string;
  rateShown: string;
  clientName?: string;
  clientPhone?: string;
  extraNotes?: string;
}

/**
 * Builds the exact WhatsApp message template from Page 5 of the Master Brief,
 * plus optional job reference ID so dispatch can match it in the Admin Dashboard.
 */
export function buildBookingWhatsAppUrl(
  targetPhone: string,
  payload: WhatsAppBookingPayload
): string {
  const normalized = normalizeWhatsAppNumber(targetPhone);
  const lines = [
    "Hello Mufasa Car Hire! I would like to book / request a quote:",
    payload.jobId ? `- Reference ID: ${payload.jobId}` : null,
    payload.clientName ? `- Client: ${payload.clientName}${payload.clientPhone ? ` (${payload.clientPhone})` : ""}` : null,
    `- Service: ${payload.service}`,
    `- Vehicle: ${payload.vehicle}`,
    `- Drive Option: ${payload.driveOption}`,
    `- Pickup & Drop-off: ${payload.pickupDropoff}`,
    `- Date & Time: ${payload.dateTime}${payload.flightNo ? ` | Flight No.: ${payload.flightNo}` : ""}`,
    `- Promo / Hotel Referral Code: ${payload.promoOrHotelCode || "None"} | Rate Shown: ${payload.rateShown}`,
    payload.extraNotes ? `- Notes: ${payload.extraNotes}` : null,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${normalized}?text=${text}`;
}

/**
 * Builds a pre-filled WhatsApp reply from the Admin Dashboard back to the customer,
 * optionally including payment details (MTN MoMo / Airtel Money / Bank).
 */
export function buildAdminReplyWhatsAppUrl(params: {
  clientPhone: string;
  clientName: string;
  jobId: string;
  status: string;
  vehicleName: string;
  clientTotalUgx: number;
  mtnMomo?: string;
  airtelMoney?: string;
  bankDetails?: string;
}): string {
  const normalized = normalizeWhatsAppNumber(params.clientPhone);
  const lines = [
    `Hello ${params.clientName}, thank you for contacting Mufasa Car Hire (Travel Like a KING)!`,
    `Booking Reference: ${params.jobId}`,
    `Status: ${params.status}`,
    `Vehicle: ${params.vehicleName}`,
    params.clientTotalUgx > 0
      ? `Confirmed Total: ${formatUGX(params.clientTotalUgx)}`
      : null,
    params.mtnMomo ? `MTN MoMo: ${params.mtnMomo}` : null,
    params.airtelMoney ? `Airtel Money: ${params.airtelMoney}` : null,
    params.bankDetails ? `Bank Transfer: ${params.bankDetails}` : null,
    "Please let us know if you need any adjustments. We are here to serve you!",
  ].filter(Boolean);

  return `https://wa.me/${normalized}?text=${encodeURIComponent(lines.join("\n"))}`;
}
