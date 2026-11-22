"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  PlaneLanding,
  PlaneTakeoff,
  Tag,
} from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { formatUGX } from "@/lib/whatsapp";
import {
  recommendVehicle,
  type LuggageLoadLevel,
} from "@/lib/vehicleRecommendation";
import { BookingFormSkeleton } from "./Skeletons";
import { VehicleSuggestionBanner } from "./VehicleSuggestionBanner";
import { VehicleComparisonModal } from "./VehicleComparisonModal";

const KAMPALA_DESTINATIONS = [
  "Kololo / Nakasero",
  "Kampala Serena Hotel",
  "Mestil Hotel & Residences (Nsambya)",
  "Protea Hotel by Marriott (Kololo)",
  "DoubleTree by Hilton / Acacias",
  "Speke Resort Munyonyo / Muyenga",
  "Kampala Central / CBD",
  "Ntinda / Naalya / Kira / Namugongo",
  "Entebbe Hotel / Corridor",
  "Upcountry Destination (Specify on WhatsApp)",
];

type TransferDirection = "arrival" | "departure" | "return";

export function AirportTransferForm({
  settings,
  vehicles,
  isLoading = false,
}: {
  settings: SiteSettings;
  vehicles: Vehicle[];
  isLoading?: boolean;
}) {
  const passengerVehicles = useMemo(
    () => vehicles.filter((v) => v.filter_group !== "moving_cargo"),
    [vehicles]
  );

  const [currency, setCurrency] = useState<"UGX" | "USD">("UGX");
  const [direction, setDirection] = useState<TransferDirection>("arrival");
  const [location, setLocation] = useState("Kololo / Nakasero");
  const [passengers, setPassengers] = useState<number>(2);
  const [luggageLevel, setLuggageLevel] = useState<LuggageLoadLevel>("medium");
  const [manualOverride, setManualOverride] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    String(passengerVehicles[0]?.id ?? "")
  );
  const [previewVehicles, setPreviewVehicles] = useState<Vehicle[]>([]);
  const [flightNumber, setFlightNumber] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("14:00");
  const [meetAndGreet, setMeetAndGreet] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    whatsappUrl: string;
  } | null>(null);

  const recommendation = useMemo(
    () =>
      recommendVehicle(passengerVehicles, {
        serviceType: "Airport Transfer",
        passengers,
        luggageLevel,
        pickupLocation:
          direction === "departure" ? location : "Entebbe International Airport",
        dropoffLocation:
          direction === "departure" ? "Entebbe International Airport" : location,
        driveMode: "With Driver",
      }),
    [passengerVehicles, passengers, luggageLevel, direction, location]
  );

  const recommendedVehicleId = recommendation?.vehicle.id ?? 0;

  useEffect(() => {
    if (!manualOverride && recommendedVehicleId > 0) {
      setSelectedVehicleId(String(recommendedVehicleId));
    }
  }, [manualOverride, recommendedVehicleId]);

  const selectedVehicle = useMemo(
    () =>
      passengerVehicles.find((v) => String(v.id) === selectedVehicleId) ??
      passengerVehicles[0],
    [passengerVehicles, selectedVehicleId]
  );

  const isStandardSaloon =
    !selectedVehicle ||
    selectedVehicle.name.toLowerCase().includes("premio") ||
    selectedVehicle.name.toLowerCase().includes("fielder");

  const pricing = useMemo(() => {
    const promoMatches =
      settings.promo_banner_active === "true" &&
      promoCode.trim().toUpperCase() === settings.promo_code.toUpperCase();
    const discountRate = promoMatches
      ? Number(settings.promo_discount_percent || 15) / 100
      : 0;
    const multiplier = direction === "return" ? 2 : 1;

    if (isStandardSaloon) {
      const baseUgx = Number(settings.airport_rate_ugx || 80000) * multiplier;
      const baseUsd = Number(settings.airport_rate_usd || 22) * multiplier;
      const finalUgx = Math.round(baseUgx * (1 - discountRate));
      const finalUsd = Math.round(baseUsd * (1 - discountRate));
      return {
        isFixed: true,
        ugx: finalUgx,
        display:
          currency === "USD"
            ? `$${finalUsd} USD (${formatUGX(finalUgx)})`
            : `${formatUGX(finalUgx)} (≈ $${finalUsd} USD)`,
        promoApplied: promoMatches,
      };
    }

    return {
      isFixed: false,
      ugx: 0,
      display: "Custom Airport Quote Ready in 30 Mins",
      promoApplied: promoMatches,
    };
  }, [settings, promoCode, direction, isStandardSaloon, currency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const pickup =
      direction === "departure" ? location : "Entebbe International Airport (EBB)";
    const dropoff =
      direction === "departure"
        ? "Entebbe International Airport (EBB)"
        : direction === "return"
        ? `${location} (Return Trip)`
        : location;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: "Airport Transfer",
          vehicle_id: selectedVehicle?.id ?? null,
          vehicle_name: selectedVehicle?.name ?? "Toyota Premio / Fielder",
          vehicle_source: selectedVehicle?.fleet_type.includes("OWNED")
            ? "Owned"
            : "Partner",
          drive_mode: "With Driver",
          pickup_location: pickup,
          dropoff_location: dropoff,
          booking_date: bookingDate,
          booking_time: bookingTime,
          flight_number: flightNumber.trim().toUpperCase(),
          meet_and_greet: meetAndGreet,
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail,
          client_type: "Individual",
          promo_or_hotel_code: promoCode.trim(),
          marketing_opt_in: marketingOptIn,
          rate_shown: pricing.display,
          currency,
          client_total_ugx: pricing.ugx,
          admin_notes:
            direction === "return"
              ? "Return Airport Transfer"
              : direction === "departure"
              ? "Airport Drop-off (Departure)"
              : "Airport Pickup (Arrival)",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit airport transfer request.");
        setSubmitting(false);
        return;
      }

      setConfirmation({
        jobId: data.booking.job_id,
        whatsappUrl: data.whatsappUrl,
      });
    } catch {
      setErrorMsg("Network error. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return <BookingFormSkeleton variant="airport" />;
  }

  return (
    <div className="rounded-2xl border border-gold/40 bg-white p-6 text-navy shadow-lg sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-navy sm:text-xl">
            Book Your Entebbe Transfer
          </h2>
          <p className="text-xs text-slate-500">
            Live flight tracking included · Confirmed in 30 mins
          </p>
        </div>

        {/* UGX / USD Currency Switch */}
        <div
          role="group"
          aria-label="Currency toggle"
          className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold"
        >
          <button
            type="button"
            onClick={() => setCurrency("UGX")}
            className={`rounded-md px-3 py-1.5 transition-colors whitespace-nowrap ${
              currency === "UGX"
                ? "bg-navy text-gold"
                : "text-slate-600 hover:text-navy"
            }`}
          >
            UGX
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`rounded-md px-3 py-1.5 transition-colors whitespace-nowrap ${
              currency === "USD"
                ? "bg-navy text-gold"
                : "text-slate-600 hover:text-navy"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      {confirmation ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h3 className="mt-2 text-lg font-extrabold text-navy">
            Transfer Logged · Ref {confirmation.jobId}
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Your flight and transfer details are saved with our dispatch team. Tap
            below to open WhatsApp and receive driver plate details immediately.
          </p>

          {settings.show_payment_publicly === "true" &&
            (settings.mtn_momo_code ||
              settings.airtel_money_code ||
              settings.bank_details) && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-white p-3.5 text-left text-xs text-slate-700">
                <p className="font-bold text-navy">Payment Options:</p>
                {settings.mtn_momo_code && <p>MTN MoMo: {settings.mtn_momo_code}</p>}
                {settings.airtel_money_code && (
                  <p>Airtel Money: {settings.airtel_money_code}</p>
                )}
                {settings.bank_details && <p>Bank: {settings.bank_details}</p>}
              </div>
            )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={confirmation.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Confirm on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="text-xs font-bold text-navy underline"
            >
              Book another transfer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-navy">
              Transfer Direction
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDirection("arrival")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-bold transition-colors ${
                  direction === "arrival"
                    ? "border-navy bg-navy text-gold"
                    : "border-slate-300 bg-white text-slate-700 hover:border-navy/50"
                }`}
              >
                <PlaneLanding className="h-3.5 w-3.5 shrink-0" />
                <span>Airport → City</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection("departure")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-bold transition-colors ${
                  direction === "departure"
                    ? "border-navy bg-navy text-gold"
                    : "border-slate-300 bg-white text-slate-700 hover:border-navy/50"
                }`}
              >
                <PlaneTakeoff className="h-3.5 w-3.5 shrink-0" />
                <span>City → Airport</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection("return")}
                className={`inline-flex items-center justify-center rounded-xl border px-2.5 py-2.5 text-xs font-bold transition-colors ${
                  direction === "return"
                    ? "border-navy bg-navy text-gold"
                    : "border-slate-300 bg-white text-slate-700 hover:border-navy/50"
                }`}
              >
                Return Trip
              </button>
            </div>
          </div>

          {/* Passengers & Luggage (Drives Auto Car Suggestion) */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Passengers
              </label>
              <select
                value={passengers}
                onChange={(e) => {
                  setPassengers(Number(e.target.value));
                  setManualOverride(false);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value={2}>1–4 Passengers</option>
                <option value={6}>5–7 Passengers</option>
                <option value={12}>8–14 Passengers</option>
                <option value={25}>15–30 Passengers</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Luggage Load
              </label>
              <select
                value={luggageLevel}
                onChange={(e) => {
                  setLuggageLevel(e.target.value as LuggageLoadLevel);
                  setManualOverride(false);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value="light">Light (1–2 Carry-ons)</option>
                <option value="medium">Standard (2–3 Suitcases)</option>
                <option value="heavy">Heavy Luggage (4–6+ Suitcases)</option>
              </select>
            </div>
          </div>

          {/* Kampala Destination / Hotel & Vehicle */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                {direction === "departure"
                  ? "Kampala Pickup Hotel / Area *"
                  : "Kampala Drop-off Hotel / Area *"}
              </label>
              <input
                list="airport-destinations"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Serena Hotel, Kololo, Munyonyo"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
              <datalist id="airport-destinations">
                {KAMPALA_DESTINATIONS.map((dest) => (
                  <option key={dest} value={dest} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Vehicle Class
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  setManualOverride(true);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                {passengerVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.seats})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Smart Auto-Suggestion Banner */}
          <VehicleSuggestionBanner
            recommendation={recommendation}
            selectedVehicleId={selectedVehicleId}
            isAutoApplied={!manualOverride}
            onApplyVehicle={(vehicle) => {
              setSelectedVehicleId(String(vehicle.id));
              setManualOverride(recommendation?.vehicle.id !== vehicle.id);
            }}
            onPreviewVideo={(vehicle) => setPreviewVehicles([vehicle])}
          />

          {/* Flight Number, Date & Time */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Flight Number (Live Tracking)
              </label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="e.g. KQ410 / QR1383"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Date *
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Arrival / Pickup Time *
              </label>
              <input
                type="time"
                required
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Meet & Greet Option */}
          <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-bg p-3 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={meetAndGreet}
              onChange={(e) => setMeetAndGreet(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-navy"
            />
            <span>
              <strong className="text-navy">
                Include &ldquo;Meet &amp; Greet with Name Sign&rdquo; at Arrivals
              </strong>{" "}
              — Driver waits outside Entebbe Arrivals holding your printed name
              sign and helps with luggage.
            </span>
          </label>

          {/* Passenger Info & Promo/Hotel Code */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Passenger Full Name *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Name for driver & sign"
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
                placeholder="e.g. +256 708 854 302"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Email (Optional for Receipt)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Promo / Hotel Referral Code
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={`e.g. ${settings.promo_code} or Hotel Name`}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Live Rate Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {pricing.isFixed ? "Fixed Transfer Rate" : "Estimate"}
              </span>
              <span className="text-base font-extrabold text-navy tabular-nums">
                {pricing.display}
              </span>
            </div>
            {pricing.promoApplied && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                <Tag className="h-3.5 w-3.5" />
                {settings.promo_discount_percent}% {settings.promo_code} Applied
              </span>
            )}
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-navy"
            />
            <span>
              Send booking confirmation &amp; flight pickup updates on WhatsApp
              (opt out anytime under Uganda PDPA 2019).
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
                <span>Logging Airport Transfer...</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                <span>Reserve Airport Pickup on WhatsApp</span>
              </>
            )}
          </button>
        </form>
      )}

      <VehicleComparisonModal
        vehicles={previewVehicles}
        allVehicles={passengerVehicles}
        onClose={() => setPreviewVehicles([])}
        onAddCompare={(vehicle) =>
          setPreviewVehicles((prev) =>
            prev.some((v) => v.id === vehicle.id) || prev.length >= 3
              ? prev
              : [...prev, vehicle]
          )
        }
        onRemoveCompare={(vehicleId) =>
          setPreviewVehicles((prev) => prev.filter((v) => v.id !== vehicleId))
        }
        onBookVehicle={(vehicle) => {
          setSelectedVehicleId(String(vehicle.id));
          setManualOverride(true);
        }}
      />
    </div>
  );
}
