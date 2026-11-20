"use client";

import React, { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  MessageCircle,
  Loader2,
  Tag,
} from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { formatUGX } from "@/lib/whatsapp";

interface QuickBookingCalculatorProps {
  vehicles: Vehicle[];
  settings: SiteSettings;
  defaultVehicleId?: number;
  defaultService?: string;
  compact?: boolean;
}

const SERVICE_ZONES = [
  "Entebbe International Airport",
  "Kololo / Nakasero",
  "Muyenga / Munyonyo",
  "Kampala Central / CBD",
  "Kikubo / Owino Market",
  "Ntinda / Nakawa Industrial Area",
  "Naalya / Kira / Namugongo",
  "Wakiso / Entebbe Road",
  "Upcountry (Specify Destination)",
];

/**
 * Interactive booking & instant-estimate form that saves every lead to the
 * Admin Dashboard database first, shows the Job ID (e.g. MCH-001), and opens WhatsApp.
 */
export function QuickBookingCalculator({
  vehicles,
  settings,
  defaultVehicleId,
  defaultService = "Car Hire",
  compact = false,
}: QuickBookingCalculatorProps) {
  const [serviceType, setServiceType] = useState(defaultService);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId ? String(defaultVehicleId) : String(vehicles[0]?.id ?? "")
  );
  const [driveMode, setDriveMode] = useState<"With Driver" | "Self-Drive">("With Driver");
  const [pickupLocation, setPickupLocation] = useState("Entebbe International Airport");
  const [dropoffLocation, setDropoffLocation] = useState("Kololo / Nakasero");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("09:00");
  const [daysCount, setDaysCount] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [currency, setCurrency] = useState<"UGX" | "USD">("UGX");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    whatsappUrl: string;
  } | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === selectedVehicleId) ?? vehicles[0],
    [vehicles, selectedVehicleId]
  );

  // Enforce Driver-Only vehicles when selected
  const allowsSelfDrive =
    selectedVehicle?.drive_option === "DRIVER_OR_SELF" ||
    selectedVehicle?.drive_option === "DRIVER_OR_REQUEST_SELF";
  const effectiveDriveMode = allowsSelfDrive ? driveMode : "With Driver";

  // Live instant estimate calculation
  const estimate = useMemo(() => {
    const promoMatches =
      settings.promo_banner_active === "true" &&
      promoCode.trim().toUpperCase() === settings.promo_code.toUpperCase();
    const discountRate = promoMatches
      ? Number(settings.promo_discount_percent || 15) / 100
      : 0;

    if (serviceType === "Airport Transfer") {
      const baseUgx = Number(settings.airport_rate_ugx || 80000);
      const finalUgx = Math.round(baseUgx * (1 - discountRate));
      const baseUsd = Number(settings.airport_rate_usd || 22);
      const finalUsd = Math.round(baseUsd * (1 - discountRate));
      return {
        isQuote: false,
        ugx: finalUgx,
        label:
          currency === "USD"
            ? `$${finalUsd} USD (${formatUGX(finalUgx)})`
            : formatUGX(finalUgx),
        promoApplied: promoMatches,
      };
    }

    if (selectedVehicle && !selectedVehicle.is_quote_only && selectedVehicle.rate_ugx) {
      const baseUgx = selectedVehicle.rate_ugx * Math.max(1, daysCount);
      const finalUgx = Math.round(baseUgx * (1 - discountRate));
      return {
        isQuote: false,
        ugx: finalUgx,
        label: `${formatUGX(finalUgx)} (${daysCount} ${daysCount === 1 ? "day" : "days"})`,
        promoApplied: promoMatches,
      };
    }

    return {
      isQuote: true,
      ugx: 0,
      label: "Quote Ready in 30 Mins on WhatsApp",
      promoApplied: promoMatches,
    };
  }, [serviceType, selectedVehicle, daysCount, promoCode, settings, currency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: serviceType,
          vehicle_id: selectedVehicle?.id ?? null,
          vehicle_name: selectedVehicle?.name ?? "Saloon / Standard",
          vehicle_source: selectedVehicle?.fleet_type.includes("OWNED")
            ? "Owned"
            : "Partner",
          drive_mode: effectiveDriveMode,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          booking_date: bookingDate,
          booking_time: bookingTime,
          client_name: clientName,
          client_phone: clientPhone,
          promo_or_hotel_code: promoCode.trim(),
          marketing_opt_in: marketingOptIn,
          rate_shown: estimate.label,
          currency,
          client_total_ugx: estimate.ugx,
          admin_notes: daysCount > 1 ? `Duration: ${daysCount} days` : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not submit booking.");
        setSubmitting(false);
        return;
      }

      setConfirmation({
        jobId: data.booking.job_id,
        whatsappUrl: data.whatsappUrl,
      });
      // Open pre-filled WhatsApp chat in a new tab
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gold/40 bg-white p-5 text-navy shadow-xl sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy sm:text-lg">
              Quick Booking &amp; Instant Estimate
            </h2>
            <p className="text-xs text-slate-500">
              Book in under 60 seconds • 30-min WhatsApp confirmation
            </p>
          </div>
        </div>
        {serviceType === "Airport Transfer" && (
          <div className="inline-flex rounded-full bg-slate-100 p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency("UGX")}
              className={`rounded-full px-2.5 py-1 ${
                currency === "UGX" ? "bg-navy text-gold" : "text-slate-600"
              }`}
            >
              UGX
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-full px-2.5 py-1 ${
                currency === "USD" ? "bg-navy text-gold" : "text-slate-600"
              }`}
            >
              USD
            </button>
          </div>
        )}
      </div>

      {confirmation ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h3 className="mt-2 text-lg font-extrabold text-navy">
            Booking Logged! Ref: {confirmation.jobId}
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Your request has been saved for our dispatch team. Click below if WhatsApp
            did not open automatically.
          </p>

          {settings.show_payment_publicly === "true" &&
            (settings.mtn_momo_code || settings.airtel_money_code || settings.bank_details) && (
              <div className="mt-4 rounded-lg border border-gold/30 bg-white p-3 text-left text-xs text-slate-700">
                <p className="font-bold text-navy">Payment Options (Upon Confirmation):</p>
                {settings.mtn_momo_code && <p>MTN MoMo: {settings.mtn_momo_code}</p>}
                {settings.airtel_money_code && (
                  <p>Airtel Money: {settings.airtel_money_code}</p>
                )}
                {settings.bank_details && <p>Bank: {settings.bank_details}</p>}
              </div>
            )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={confirmation.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Open WhatsApp Chat</span>
            </a>
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="text-xs font-semibold text-navy underline"
            >
              Make another booking
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Service & Vehicle */}
          <div className={`grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value="Car Hire">Passenger Car Hire</option>
                <option value="Airport Transfer">Entebbe Airport Transfer</option>
                <option value="Moving & Cargo">Moving &amp; Cargo</option>
                <option value="Corporate">Corporate / NGO</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Vehicle Category
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.fleet_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drive Mode & Days */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Drive Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriveMode("With Driver")}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    effectiveDriveMode === "With Driver"
                      ? "border-navy bg-navy text-gold"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  With Driver
                </button>
                <button
                  type="button"
                  disabled={!allowsSelfDrive}
                  onClick={() => setDriveMode("Self-Drive")}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                    !allowsSelfDrive
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : effectiveDriveMode === "Self-Drive"
                      ? "border-navy bg-navy text-gold"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                  title={
                    allowsSelfDrive
                      ? "Self-drive available"
                      : "Selected partner vehicle includes a trained driver"
                  }
                >
                  {allowsSelfDrive ? "Self-Drive" : "Driver Included"}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                {serviceType === "Airport Transfer" ? "Trips" : "Number of Days"}
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={daysCount}
                onChange={(e) => setDaysCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Pickup & Dropoff */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Pickup Zone / Area
              </label>
              <input
                list="kampala-zones"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Entebbe Airport or Kololo"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Drop-off Zone / Destination
              </label>
              <input
                list="kampala-zones"
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder="e.g. Munyonyo, Kikubo, Jinja"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <datalist id="kampala-zones">
              {SERVICE_ZONES.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </div>

          {/* Date, Time & Promo/Hotel Code */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Pickup Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Time
              </label>
              <input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Promo / Hotel Code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={`e.g. ${settings.promo_code}`}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Client Name & WhatsApp Phone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. 0708 854 302"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Live Estimate Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Instant Estimate
              </span>
              <span className="text-base font-extrabold text-navy">
                {estimate.label}
              </span>
            </div>
            {estimate.promoApplied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                <Tag className="h-3.5 w-3.5" />
                {settings.promo_discount_percent}% {settings.promo_code} Applied!
              </span>
            )}
          </div>

          {/* Marketing Opt-In (Uganda PDPA 2019 Compliance) */}
          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-navy"
            />
            <span>
              I agree to receive booking updates on WhatsApp and occasional Mufasa Car Hire
              loyalty offers (you can opt out anytime).
            </span>
          </label>

          {errorMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving &amp; Opening WhatsApp...</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                <span>
                  {estimate.isQuote
                    ? "Get Quote on WhatsApp"
                    : "Book on WhatsApp Now"}
                </span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
