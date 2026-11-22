"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Home,
  Loader2,
  MessageCircle,
  Package,
  Truck,
} from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { recommendVehicle } from "@/lib/vehicleRecommendation";
import { BookingFormSkeleton } from "./Skeletons";
import { VehicleSuggestionBanner } from "./VehicleSuggestionBanner";
import { VehicleComparisonModal } from "./VehicleComparisonModal";

const CARGO_ZONES = [
  "Kikubo Wholesale Market",
  "Owino Market / Kampala CBD",
  "Ntinda / Nakawa Industrial Area",
  "Kololo / Nakasero",
  "Muyenga / Munyonyo / Buziga",
  "Naalya / Kira / Namugongo",
  "Wakiso / Entebbe Road",
  "Upcountry (Jinja / Mbarara / Gulu / Mbale)",
];

const SERVICE_CARDS = [
  {
    id: "Home Moving",
    icon: Home,
    title: "Home & Apartment Moving",
    desc: "Safe relocation for 1–4 bedroom homes across Kampala, Wakiso, Entebbe, and suburbs with optional experienced loaders.",
  },
  {
    id: "Office Moving",
    icon: Building2,
    title: "Office Relocations",
    desc: "Structured weekend or after-hours moves for desks, IT equipment, archives, and corporate furniture with punctual arrival.",
  },
  {
    id: "SME & Market Cargo",
    icon: Package,
    title: "SME & Market Cargo Runs",
    desc: "Dependable daily or scheduled stock deliveries from Kikubo, Owino Market, and Ntinda / Nakawa Industrial Area.",
  },
];

export function MovingCargoForm({
  settings,
  cargoVehicles,
  isLoading = false,
}: {
  settings: SiteSettings;
  cargoVehicles: Vehicle[];
  isLoading?: boolean;
}) {
  const [movingCategory, setMovingCategory] = useState("Home Moving");
  const [selectedVehicle, setSelectedVehicle] = useState(
    cargoVehicles[0]?.name ?? "Cargo Vans (1–3 Tonne)"
  );
  const [manualTruckOverride, setManualTruckOverride] = useState(false);
  const [previewVehicles, setPreviewVehicles] = useState<Vehicle[]>([]);
  const [pickupLocation, setPickupLocation] = useState("Kikubo Wholesale Market");
  const [dropoffLocation, setDropoffLocation] = useState("Ntinda / Nakawa Industrial Area");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("08:30");
  const [loadDescription, setLoadDescription] = useState("");
  const [helpersNeeded, setHelpersNeeded] = useState("Yes — 1–2 Loaders");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    whatsappUrl: string;
  } | null>(null);

  const recommendation = useMemo(
    () =>
      recommendVehicle(cargoVehicles, {
        serviceType: "Moving & Cargo",
        pickupLocation,
        dropoffLocation,
        movingCategory,
        helpersNeeded,
        loadDescription,
      }),
    [
      cargoVehicles,
      pickupLocation,
      dropoffLocation,
      movingCategory,
      helpersNeeded,
      loadDescription,
    ]
  );

  const recommendedTruckName = recommendation?.vehicle.name ?? "";
  const selectedTruckObj = useMemo(
    () => cargoVehicles.find((v) => v.name === selectedVehicle),
    [cargoVehicles, selectedVehicle]
  );

  useEffect(() => {
    if (!manualTruckOverride && recommendedTruckName) {
      setSelectedVehicle(recommendedTruckName);
    }
  }, [manualTruckOverride, recommendedTruckName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const matchedVehicle = cargoVehicles.find((v) => v.name === selectedVehicle);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: "Moving & Cargo",
          vehicle_id: matchedVehicle?.id ?? null,
          vehicle_name: selectedVehicle,
          vehicle_source: "Partner",
          drive_mode: "With Driver",
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          booking_date: bookingDate,
          booking_time: bookingTime,
          load_description: `[${movingCategory}] ${loadDescription.trim() || "Standard load"}`,
          helpers_needed: helpersNeeded,
          client_name: clientName,
          client_phone: clientPhone,
          client_type:
            movingCategory === "SME & Market Cargo"
              ? "SME / Wholesaler"
              : movingCategory === "Office Moving"
              ? "NGO / Corporate"
              : "Individual",
          promo_or_hotel_code: promoCode.trim(),
          marketing_opt_in: marketingOptIn,
          rate_shown:
            matchedVehicle?.price_display || "Custom Quote in 30 Mins on WhatsApp",
          currency: "UGX",
          client_total_ugx: 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit moving quote request.");
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
    return <BookingFormSkeleton variant="moving" />;
  }

  return (
    <div className="space-y-10">
      {/* Three Selectable Moving & Cargo Service Cards */}
      <div>
        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            Step 1 · Select Your Job Type
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-navy">
            Home Moves, Office Relocations &amp; Wholesale Cargo
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {SERVICE_CARDS.map((card) => {
            const Icon = card.icon;
            const active = movingCategory === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setMovingCategory(card.id);
                  setManualTruckOverride(false);
                }}
                className={`flex flex-col items-start rounded-2xl border p-6 text-left transition-colors ${
                  active
                    ? "border-navy bg-navy text-white shadow-md"
                    : "border-slate-200 bg-white text-navy hover:border-gold"
                }`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    active ? "bg-gold text-navy" : "bg-navy text-gold"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{card.title}</h3>
                <p
                  className={`mt-2 text-xs leading-relaxed ${
                    active ? "text-white/85" : "text-slate-600"
                  }`}
                >
                  {card.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Selector + Quote Form Split */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: 1–3 Tonne Van vs Fuso Canter Selector */}
        <div className="space-y-4 lg:col-span-5">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            Step 2 · Choose Truck Capacity
          </p>
          <h3 className="text-xl font-extrabold text-navy">
            5–8 Vetted Partner Vans &amp; Trucks
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            Every cargo vehicle is dispatched with an experienced, vetted
            partner driver. Select the right capacity for your load and get a
            firm UGX quote on WhatsApp within 30 minutes.
          </p>

          <div className="space-y-3 pt-2">
            {(cargoVehicles.length > 0
              ? cargoVehicles
              : [
                  {
                    id: 1,
                    name: "Cargo Vans (1–3 Tonne)",
                    luggage: "1–3 Tonnes",
                    best_uses:
                      "SME goods delivery, Kikubo & Owino Market runs, Industrial Area runs, small home moves.",
                    price_display: "Get Quote (Ref avg: UGX 350k)",
                  },
                  {
                    id: 2,
                    name: "Box Truck / Fuso Canter & Pickups",
                    luggage: "3–5+ Tonnes",
                    best_uses:
                      "Home moving, office moving, heavy bulk cargo & equipment transport.",
                    price_display: "Get Instant Quote",
                  },
                ]
            ).map((truck) => {
              const isSelected = selectedVehicle === truck.name;
              return (
                <button
                  key={truck.name}
                  type="button"
                  onClick={() => {
                    setSelectedVehicle(truck.name);
                    setManualTruckOverride(true);
                  }}
                  className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                    isSelected
                      ? "border-gold bg-gold-soft"
                      : "border-slate-200 bg-white hover:border-navy/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Truck className="h-5 w-5 shrink-0 text-navy" />
                      <span className="text-base font-extrabold text-navy">
                        {truck.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gold-hover whitespace-nowrap">
                      {truck.luggage}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {truck.best_uses}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-navy">
                    <span>Driver Included</span>
                    <span>{truck.price_display}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Structured Moving & Cargo Quote Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 sm:p-7">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-navy sm:text-xl">
              Request Moving / Cargo Quote
            </h3>
            <p className="text-xs text-slate-500">
              Selected: {movingCategory} · {selectedVehicle}
            </p>
          </div>

          {confirmation ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h4 className="mt-2 text-lg font-extrabold text-navy">
                Quote Request Logged · Ref {confirmation.jobId}
              </h4>
              <p className="mt-1 text-sm text-slate-700">
                Our logistics desk has received your load details and will reply
                with a firm UGX quote within 30 minutes.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={confirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open Quote Chat on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  className="text-xs font-bold text-navy underline"
                >
                  Submit another request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Pickup Area / Market *
                  </label>
                  <input
                    list="cargo-zones"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Kikubo, Ntinda, Bukoto"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Drop-off Destination *
                  </label>
                  <input
                    list="cargo-zones"
                    required
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="e.g. Kira, Naalya, Entebbe, Jinja"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  />
                </div>
                <datalist id="cargo-zones">
                  {CARGO_ZONES.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Preferred Date *
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
                    Start Time
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
                    Loading Helpers Needed?
                  </label>
                  <select
                    value={helpersNeeded}
                    onChange={(e) => setHelpersNeeded(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
                  >
                    <option value="No — Driver Only">No — Driver Only</option>
                    <option value="Yes — 1–2 Loaders">Yes — 1–2 Loaders</option>
                    <option value="Yes — 3–4 Loaders">Yes — 3–4 Loaders</option>
                    <option value="Yes — Full Moving Crew">
                      Yes — Full Moving Crew
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Load Description (Items, Weight &amp; Floor Level) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={loadDescription}
                  onChange={(e) => setLoadDescription(e.target.value)}
                  placeholder="e.g. 2-bedroom apartment furniture (fridge, sofa, 2 beds, 15 boxes) from 2nd floor, OR 35 wholesale cartons from Kikubo..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <VehicleSuggestionBanner
                recommendation={recommendation}
                selectedVehicleId={selectedTruckObj?.id ?? ""}
                isAutoApplied={!manualTruckOverride}
                onApplyVehicle={(vehicle) => {
                  setSelectedVehicle(vehicle.name);
                  setManualTruckOverride(
                    recommendation?.vehicle.id !== vehicle.id
                  );
                }}
                onPreviewVideo={(vehicle) => setPreviewVehicles([vehicle])}
              />

              <div className="grid gap-3 sm:grid-cols-3">
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
                    WhatsApp / Phone *
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
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Promo Code (Optional)
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

              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 accent-navy"
                />
                <span>
                  I agree to receive quote updates on WhatsApp and occasional
                  Mufasa Car Hire offers (opt out anytime).
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
                    <span>Saving Moving Request...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4" />
                    <span>Get Moving &amp; Cargo Quote on WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <VehicleComparisonModal
        vehicles={previewVehicles}
        allVehicles={cargoVehicles}
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
          setSelectedVehicle(vehicle.name);
          setManualTruckOverride(true);
        }}
      />
    </div>
  );
}
