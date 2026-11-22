"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Tag,
} from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { formatUGX } from "@/lib/whatsapp";
import {
  recommendVehicle,
  type LuggageLoadLevel,
} from "@/lib/vehicleRecommendation";
import { BookingFormSkeleton } from "./Skeletons";
import { EASE_SMOOTH } from "./MotionPrimitives";
import { VehicleSuggestionBanner } from "./VehicleSuggestionBanner";
import { VehicleComparisonModal } from "./VehicleComparisonModal";

interface QuickBookingCalculatorProps {
  vehicles: Vehicle[];
  settings: SiteSettings;
  defaultVehicleId?: number;
  defaultService?: string;
  compact?: boolean;
  isLoading?: boolean;
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
  "Upcountry (Jinja / Mbarara / Gulu / Safari)",
];

/**
 * Calm 2-step progressive-disclosure booking card with live Smart Vehicle Auto-Suggestion:
 * Step 1 captures trip details (service, passengers, luggage/load, route, drive mode),
 * auto-suggests the ideal vehicle class, and calculates an instant UGX/USD estimate.
 * Step 2 captures contact details and logs to SQLite + WhatsApp.
 */
export function QuickBookingCalculator({
  vehicles,
  settings,
  defaultVehicleId,
  defaultService = "Car Hire",
  compact = false,
  isLoading = false,
}: QuickBookingCalculatorProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceType, setServiceType] = useState(defaultService);
  const [passengers, setPassengers] = useState<number>(2);
  const [luggageLevel, setLuggageLevel] = useState<LuggageLoadLevel>(
    defaultService === "Moving & Cargo" ? "cargo_small" : "medium"
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    defaultVehicleId ? String(defaultVehicleId) : String(vehicles[0]?.id ?? "")
  );
  // If user opened booking for a specific vehicle, respect that choice until they ask to switch
  const [manualOverride, setManualOverride] = useState<boolean>(
    Boolean(defaultVehicleId)
  );
  const [driveMode, setDriveMode] = useState<"With Driver" | "Self-Drive">(
    "With Driver"
  );
  const [pickupLocation, setPickupLocation] = useState(
    "Entebbe International Airport"
  );
  const [dropoffLocation, setDropoffLocation] = useState("Kololo / Nakasero");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("09:00");
  const [daysCount, setDaysCount] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [currency, setCurrency] = useState<"UGX" | "USD">("UGX");
  const [previewVehicles, setPreviewVehicles] = useState<Vehicle[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    whatsappUrl: string;
  } | null>(null);

  // Live Smart Vehicle Auto-Suggestion based on entered trip details
  const recommendation = useMemo(
    () =>
      recommendVehicle(vehicles, {
        serviceType,
        passengers,
        luggageLevel,
        pickupLocation,
        dropoffLocation,
        driveMode,
        daysCount,
      }),
    [
      vehicles,
      serviceType,
      passengers,
      luggageLevel,
      pickupLocation,
      dropoffLocation,
      driveMode,
      daysCount,
    ]
  );

  const recommendedVehicleId = recommendation?.vehicle.id ?? 0;

  // Automatically sync selected vehicle when trip details change (unless manually overridden)
  useEffect(() => {
    if (!manualOverride && recommendedVehicleId > 0) {
      setSelectedVehicleId(String(recommendedVehicleId));
    }
  }, [manualOverride, recommendedVehicleId]);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === selectedVehicleId) ?? vehicles[0],
    [vehicles, selectedVehicleId]
  );

  const allowsSelfDrive =
    selectedVehicle?.drive_option === "DRIVER_OR_SELF" ||
    selectedVehicle?.drive_option === "DRIVER_OR_REQUEST_SELF";
  const effectiveDriveMode = allowsSelfDrive ? driveMode : "With Driver";

  const estimate = useMemo(() => {
    const promoMatches =
      settings.promo_banner_active === "true" &&
      promoCode.trim().toUpperCase() === settings.promo_code.toUpperCase();
    const discountRate = promoMatches
      ? Number(settings.promo_discount_percent || 15) / 100
      : 0;

    const isSaloon =
      !selectedVehicle ||
      selectedVehicle.name.toLowerCase().includes("premio") ||
      selectedVehicle.name.toLowerCase().includes("fielder");

    if (serviceType === "Airport Transfer" && isSaloon) {
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
        label: `${formatUGX(finalUgx)} (${daysCount} ${
          daysCount === 1 ? "day" : "days"
        })`,
        promoApplied: promoMatches,
      };
    }

    return {
      isQuote: true,
      ugx: 0,
      label: "Custom Quote in 30 Mins",
      promoApplied: promoMatches,
    };
  }, [serviceType, selectedVehicle, daysCount, promoCode, settings, currency]);

  function handleServiceChange(nextService: string) {
    setServiceType(nextService);
    setManualOverride(false);
    if (nextService === "Moving & Cargo" && !luggageLevel.startsWith("cargo")) {
      setLuggageLevel("cargo_small");
    } else if (nextService !== "Moving & Cargo" && luggageLevel.startsWith("cargo")) {
      setLuggageLevel("medium");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const luggageLabelMap: Record<LuggageLoadLevel, string> = {
      light: "Light bags (1–2)",
      medium: "Standard (3–4 suitcases)",
      heavy: "Heavy luggage (5+ bags)",
      cargo_small: "Cargo 1–3 tonnes",
      cargo_heavy: "Bulk cargo 3–5+ tonnes",
    };

    const noteParts = [
      `Passengers: ${passengers}`,
      `Luggage/Load: ${luggageLabelMap[luggageLevel]}`,
      daysCount > 1 ? `Duration: ${daysCount} days` : "",
    ].filter(Boolean);

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
          admin_notes: noteParts.join(" | "),
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
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return <BookingFormSkeleton variant="quick" />;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-navy shadow-sm sm:p-7">
      {/* Header + Step Indicator */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-navy sm:text-lg">
              Quick Trip Estimate &amp; Booking
            </h2>
            <p className="text-xs text-slate-500">
              {confirmation
                ? "Confirmed in dispatch register"
                : step === 1
                ? "Step 1 of 2 · Enter trip details for auto car match"
                : "Step 2 of 2 · Your WhatsApp contact"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {serviceType === "Airport Transfer" && !confirmation && (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrency("UGX")}
                className={`rounded-md px-2.5 py-1 ${
                  currency === "UGX" ? "bg-navy text-gold" : "text-slate-600"
                }`}
              >
                UGX
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`rounded-md px-2.5 py-1 ${
                  currency === "USD" ? "bg-navy text-gold" : "text-slate-600"
                }`}
              >
                USD
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmation ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
        >
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h3 className="mt-2 text-lg font-extrabold text-navy">
            Booking Logged · Ref {confirmation.jobId}
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Your trip is saved with our Kampala dispatch desk. Tap below to open
            your pre-filled WhatsApp chat.
          </p>

          {settings.show_payment_publicly === "true" &&
            (settings.mtn_momo_code ||
              settings.airtel_money_code ||
              settings.bank_details) && (
              <div className="mt-4 rounded-lg border border-gold/30 bg-white p-3 text-left text-xs text-slate-700">
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
              <span>Open WhatsApp Chat</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setConfirmation(null);
                setStep(1);
              }}
              className="text-xs font-bold text-navy underline"
            >
              New booking
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                className="space-y-4"
              >
                {/* Row 1: Service + Passengers + Luggage/Load (drives auto-suggestion) */}
                <div
                  className={`grid gap-3 ${
                    compact ? "sm:grid-cols-2" : "sm:grid-cols-3"
                  }`}
                >
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Service
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    >
                      <option value="Car Hire">Passenger Car Hire</option>
                      <option value="Airport Transfer">
                        Entebbe Airport Transfer
                      </option>
                      <option value="Moving & Cargo">Moving &amp; Cargo</option>
                      <option value="Corporate">Corporate / NGO</option>
                    </select>
                  </div>

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
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    >
                      <option value={2}>1–4 Passengers</option>
                      <option value={6}>5–7 Passengers</option>
                      <option value={12}>8–14 Passengers</option>
                      <option value={25}>15–30 Passengers</option>
                    </select>
                  </div>

                  <div className={compact ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Luggage / Load Size
                    </label>
                    <select
                      value={luggageLevel}
                      onChange={(e) => {
                        setLuggageLevel(e.target.value as LuggageLoadLevel);
                        setManualOverride(false);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    >
                      <option value="light">Light (1–2 Bags)</option>
                      <option value="medium">Standard (3–4 Suitcases)</option>
                      <option value="heavy">Heavy Luggage (5+ Bags)</option>
                      <option value="cargo_small">Cargo / Moving (1–3 Tonnes)</option>
                      <option value="cargo_heavy">
                        Bulk Move / Heavy Cargo (3–5+ Tonnes)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Pickup & Drop-off Areas */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Pickup Area
                    </label>
                    <input
                      list="kampala-zones"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Entebbe Airport"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Drop-off / Destination
                    </label>
                    <input
                      list="kampala-zones"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      placeholder="e.g. Kololo, Jinja, Mbarara"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <datalist id="kampala-zones">
                    {SERVICE_ZONES.map((z) => (
                      <option key={z} value={z} />
                    ))}
                  </datalist>
                </div>

                {/* Row 3: Date, Time/Days, Drive Mode */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      {serviceType === "Airport Transfer" ? "Time" : "Days"}
                    </label>
                    {serviceType === "Airport Transfer" ? (
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                      />
                    ) : (
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={daysCount}
                        onChange={(e) =>
                          setDaysCount(Math.max(1, Number(e.target.value) || 1))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm tabular-nums focus:border-gold focus:outline-none"
                      />
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Drive Mode
                    </label>
                    <select
                      value={effectiveDriveMode}
                      disabled={!allowsSelfDrive}
                      onChange={(e) => {
                        setDriveMode(
                          e.target.value as "With Driver" | "Self-Drive"
                        );
                        setManualOverride(false);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm disabled:bg-slate-100 disabled:text-slate-500 focus:border-gold focus:outline-none"
                    >
                      <option value="With Driver">With Driver</option>
                      {allowsSelfDrive && (
                        <option value="Self-Drive">Self-Drive</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Smart Auto-Suggested Vehicle Card */}
                <VehicleSuggestionBanner
                  recommendation={recommendation}
                  selectedVehicleId={selectedVehicleId}
                  isAutoApplied={!manualOverride}
                  onApplyVehicle={(vehicle) => {
                    setSelectedVehicleId(String(vehicle.id));
                    setManualOverride(
                      recommendation?.vehicle.id !== vehicle.id
                    );
                  }}
                  onPreviewVideo={(vehicle) => setPreviewVehicles([vehicle])}
                />

                {/* Vehicle Selector Dropdown (always editable by customer) */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-bold text-navy">
                      Selected Vehicle
                    </label>
                    {manualOverride && (
                      <button
                        type="button"
                        onClick={() => setManualOverride(false)}
                        className="text-[11px] font-bold text-gold-hover hover:underline"
                      >
                        Reset to auto-suggest
                      </button>
                    )}
                  </div>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      setManualOverride(true);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.seats} · {v.luggage})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Estimate + Continue CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Instant Estimate
                    </span>
                    <span className="text-base font-extrabold text-navy tabular-nums">
                      {estimate.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-gold px-5! py-2.5! text-xs sm:text-sm"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                className="space-y-4"
              >
                {/* Compact Trip Recap */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-bg px-4 py-3 text-xs">
                  <div>
                    <span className="font-bold text-navy">
                      {selectedVehicle?.name || serviceType}
                    </span>
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span className="text-slate-600">
                      {pickupLocation} → {dropoffLocation}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 font-bold text-navy hover:text-gold-hover"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

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
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
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
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Promo / Hotel Code (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={`Use ${settings.promo_code} for ${settings.promo_discount_percent}% off`}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase focus:border-gold focus:outline-none"
                    />
                    {estimate.promoApplied && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 whitespace-nowrap">
                        <Tag className="h-3.5 w-3.5" />
                        -{settings.promo_discount_percent}% Applied
                      </span>
                    )}
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 accent-navy"
                  />
                  <span>
                    Send booking updates &amp; loyalty offers via WhatsApp (opt
                    out anytime).
                  </span>
                </label>

                {errorMsg && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="block text-[11px] font-bold uppercase text-slate-500">
                      Estimated Total
                    </span>
                    <span className="text-base font-extrabold text-navy tabular-nums">
                      {estimate.label}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold text-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Logging Booking...</span>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}

      {/* Inline Video Preview & Comparison Modal for Suggested Car */}
      <VehicleComparisonModal
        vehicles={previewVehicles}
        allVehicles={vehicles}
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
