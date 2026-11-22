"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Cog,
  GitCompare,
  Luggage,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
  Wind,
  X,
} from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { formatUGX } from "@/lib/whatsapp";
import { VehicleIllustration } from "./VehicleIllustration";
import { VehicleComparisonModal } from "./VehicleComparisonModal";
import { QuickBookingCalculator } from "./QuickBookingCalculator";
import { FleetCardSkeleton, FleetExplorerSkeleton } from "./Skeletons";
import { EASE_SMOOTH } from "./MotionPrimitives";

// Simplified to 3 clear tabs
const FILTER_TABS = [
  { key: "all", label: "All Vehicles" },
  { key: "passenger", label: "Passenger & VIP" },
  { key: "moving_cargo", label: "Moving & Cargo" },
] as const;

export function FleetExplorer({
  vehicles: initialVehicles,
  settings,
  initialVehicleId,
  isLoading = false,
}: {
  vehicles: Vehicle[];
  settings: SiteSettings;
  initialVehicleId?: number;
  isLoading?: boolean;
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selfDriveOnly, setSelfDriveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [videoModalVehicles, setVideoModalVehicles] = useState<Vehicle[]>([]);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(
    initialVehicleId
      ? initialVehicles.find((v) => v.id === initialVehicleId) ?? null
      : null
  );

  // Compute dynamic UGX daily rate slider bounds from live fleet rates
  const priceBounds = useMemo(() => {
    const numericRates = vehicles
      .map((v) => v.rate_ugx)
      .filter((r): r is number => typeof r === "number" && r > 0);
    if (numericRates.length === 0) {
      return { min: 60000, max: 400000, step: 10000 };
    }
    const rawMin = Math.min(...numericRates);
    const rawMax = Math.max(...numericRates);
    const min = Math.max(0, Math.floor(rawMin / 20000) * 20000 - 20000);
    const max = Math.max(min + 50000, Math.ceil(rawMax / 50000) * 50000);
    return { min, max, step: 10000 };
  }, [vehicles]);

  const [minPrice, setMinPrice] = useState<number>(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState<number>(priceBounds.max);
  const [includeQuoteOnly, setIncludeQuoteOnly] = useState<boolean>(false);

  const clampedMinPrice = Math.max(
    priceBounds.min,
    Math.min(minPrice, priceBounds.max - priceBounds.step)
  );
  const clampedMaxPrice = Math.min(
    priceBounds.max,
    Math.max(maxPrice, clampedMinPrice + priceBounds.step)
  );
  const isPriceFilterActive =
    clampedMinPrice > priceBounds.min || clampedMaxPrice < priceBounds.max;

  async function handleRefreshFleet() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      }
    } finally {
      setRefreshing(false);
    }
  }

  const filteredVehicles = useMemo(() => {
    const tokens = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return vehicles.filter((v) => {
      if (activeTab === "passenger" && v.filter_group === "moving_cargo") {
        return false;
      }
      if (activeTab === "moving_cargo" && v.filter_group !== "moving_cargo") {
        return false;
      }
      if (selfDriveOnly) {
        const supportsSelfDrive =
          v.drive_option === "DRIVER_OR_SELF" ||
          v.drive_option === "DRIVER_OR_REQUEST_SELF";
        if (!supportsSelfDrive) return false;
      }
      if (isPriceFilterActive) {
        if (typeof v.rate_ugx === "number" && v.rate_ugx > 0) {
          if (v.rate_ugx < clampedMinPrice || v.rate_ugx > clampedMaxPrice) {
            return false;
          }
        } else if (!includeQuoteOnly) {
          return false;
        }
      }
      if (tokens.length > 0) {
        const driveText =
          v.drive_option === "DRIVER_OR_SELF"
            ? "driver chauffeur self-drive self drive"
            : v.drive_option === "DRIVER_OR_REQUEST_SELF"
            ? "driver chauffeur request self-drive self drive"
            : "driver included chauffeur";
        const featureText = v.ac === 1 ? "a/c ac air conditioning" : "cargo commercial";
        const searchable = [
          v.name,
          v.category,
          v.fleet_type,
          v.transmission,
          v.seats,
          v.luggage,
          v.best_uses,
          v.price_display,
          driveText,
          featureText,
        ]
          .join(" ")
          .toLowerCase();

        return tokens.every((token) => searchable.includes(token));
      }
      return true;
    });
  }, [
    vehicles,
    activeTab,
    selfDriveOnly,
    searchQuery,
    isPriceFilterActive,
    clampedMinPrice,
    clampedMaxPrice,
    includeQuoteOnly,
  ]);

  const compareVehicles = useMemo(
    () =>
      compareIds
        .map((id) => vehicles.find((v) => v.id === id))
        .filter((v): v is Vehicle => Boolean(v)),
    [compareIds, vehicles]
  );

  function toggleCompare(vehicleId: number) {
    setCompareIds((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, vehicleId];
    });
  }

  function handleAddToVideoModal(vehicle: Vehicle) {
    setVideoModalVehicles((prev) => {
      if (prev.some((v) => v.id === vehicle.id) || prev.length >= 3) return prev;
      return [...prev, vehicle];
    });
    setCompareIds((prev) =>
      prev.includes(vehicle.id) || prev.length >= 3 ? prev : [...prev, vehicle.id]
    );
  }

  function handleRemoveFromVideoModal(vehicleId: number) {
    setVideoModalVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    setCompareIds((prev) => prev.filter((id) => id !== vehicleId));
  }

  if (isLoading) {
    return <FleetExplorerSkeleton cardCount={6} />;
  }

  return (
    <div>
      {/* Streamlined Filter & Real-Time Search Controls */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-bg p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* 3 Clean Category Tabs */}
          <div className="inline-flex flex-wrap gap-1 rounded-xl bg-white p-1 border border-slate-200">
            {FILTER_TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap sm:text-sm ${
                    active ? "text-gold" : "text-slate-600 hover:text-navy"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="fleetTabPill"
                      transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                      className="absolute inset-0 rounded-lg bg-navy"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input + Self-Drive Toggle + Refresh */}
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2.5">
            <div className="relative min-w-56 flex-1 sm:max-w-xs lg:max-w-sm">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model, category, or feature (e.g. 4x4, 7-seater, cargo)..."
                aria-label="Search fleet vehicles by model name, category, or features"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-navy placeholder:text-slate-400 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear vehicle search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelfDriveOnly((prev) => !prev)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                selfDriveOnly
                  ? "border-navy bg-navy text-gold"
                  : "border-slate-200 bg-white text-navy hover:border-navy/40"
              }`}
            >
              {selfDriveOnly ? "Self-Drive Only: On" : "Self-Drive Only"}
            </button>

            <button
              type="button"
              onClick={handleRefreshFleet}
              disabled={refreshing}
              aria-label="Refresh live fleet availability"
              title="Refresh live fleet availability"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-navy hover:border-navy/40 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Daily Hire Rate Price Range Slider */}
        <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gold-hover" />
              <span className="text-xs font-bold text-navy whitespace-nowrap">
                Daily Rate:
              </span>
              <span className="text-xs font-extrabold text-navy tabular-nums whitespace-nowrap">
                {formatUGX(clampedMinPrice)} – {formatUGX(clampedMaxPrice)}
              </span>
            </div>

            {/* Accessible Dual-Thumb Range Slider */}
            <div className="relative flex h-7 flex-1 items-center sm:max-w-xs lg:max-w-sm">
              {/* Base Track */}
              <div className="h-1.5 w-full rounded-full bg-slate-200" />
              {/* Active Gold Range Fill */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-1.5 rounded-full bg-gold"
                style={{
                  left: `${
                    ((clampedMinPrice - priceBounds.min) /
                      Math.max(1, priceBounds.max - priceBounds.min)) *
                    100
                  }%`,
                  right: `${
                    100 -
                    ((clampedMaxPrice - priceBounds.min) /
                      Math.max(1, priceBounds.max - priceBounds.min)) *
                      100
                  }%`,
                }}
              />
              {/* Min Rate Handle */}
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={priceBounds.step}
                value={clampedMinPrice}
                aria-label="Minimum daily hire rate in UGX"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setMinPrice(Math.min(next, clampedMaxPrice - priceBounds.step));
                }}
                className="pointer-events-none absolute inset-x-0 h-7 w-full appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-navy [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-navy"
              />
              {/* Max Rate Handle */}
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={priceBounds.step}
                value={clampedMaxPrice}
                aria-label="Maximum daily hire rate in UGX"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setMaxPrice(Math.max(next, clampedMinPrice + priceBounds.step));
                }}
                className="pointer-events-none absolute inset-x-0 h-7 w-full appearance-none bg-transparent focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold [&::-webkit-slider-thumb]:bg-navy [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold [&::-moz-range-thumb]:bg-navy"
              />
            </div>

            {isPriceFilterActive && (
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={includeQuoteOnly}
                    onChange={(e) => setIncludeQuoteOnly(e.target.checked)}
                    className="rounded border-slate-300 accent-navy"
                  />
                  <span>Include quote-only</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(priceBounds.min);
                    setMaxPrice(priceBounds.max);
                    setIncludeQuoteOnly(false);
                  }}
                  className="text-xs font-bold text-gold-hover hover:underline whitespace-nowrap"
                >
                  Reset price
                </button>
              </div>
            )}
          </div>

          {/* Quiet Context Bar: Result Count */}
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
            <span className="tabular-nums font-medium text-slate-600 whitespace-nowrap">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
              {searchQuery.trim() ? ` for "${searchQuery.trim()}"` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Grid or Loading Skeleton */}
      {refreshing ? (
        <div
          role="status"
          aria-label="Refreshing fleet vehicles"
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <span className="sr-only">Refreshing fleet vehicles...</span>
          {Array.from({ length: Math.max(3, filteredVehicles.length || 6) }).map(
            (_, idx) => (
              <FleetCardSkeleton key={idx} />
            )
          )}
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-bg p-10 text-center">
          <p className="text-base font-extrabold text-navy">
            No vehicles match your search or filter
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {isPriceFilterActive
              ? `No priced vehicles found between ${formatUGX(
                  clampedMinPrice
                )} and ${formatUGX(
                  clampedMaxPrice
                )} / day. Try widening the price range or enabling "Include quote-only".`
              : searchQuery.trim()
              ? `Try searching for another model (Premio, Noah, Land Cruiser, HiAce, Coaster, Fuso) or clearing "${searchQuery.trim()}".`
              : "Self-drive is offered on company-owned saloons, MPVs, and select executive SUVs. Cargo vans and buses always include a driver."}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setSelfDriveOnly(false);
              setSearchQuery("");
              setMinPrice(priceBounds.min);
              setMaxPrice(priceBounds.max);
              setIncludeQuoteOnly(false);
            }}
            className="btn-navy-outline mt-4 text-xs"
          >
            Show All Vehicles
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle, index) => {
              const isHovered = hoveredCardId === vehicle.id;
              const isCompared = compareIds.includes(vehicle.id);

              return (
                <motion.article
                  layout
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 22, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  whileHover={{ y: -6 }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.055, 0.28),
                    ease: EASE_SMOOTH,
                  }}
                  onMouseEnter={() => setHoveredCardId(vehicle.id)}
                  onMouseLeave={() =>
                    setHoveredCardId((curr) => (curr === vehicle.id ? null : curr))
                  }
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 ${
                    isCompared
                      ? "border-gold shadow-md ring-1 ring-gold/40"
                      : "border-slate-200 shadow-xs hover:border-gold/70 hover:shadow-xl hover:shadow-navy/10"
                  }`}
                >
                  {/* Animated Top Gold Illumination Line on Hover / Compare */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 bg-gold origin-left"
                    initial={false}
                    animate={{
                      scaleX: isHovered || isCompared ? 1 : 0,
                      opacity: isHovered || isCompared ? 1 : 0,
                    }}
                    transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                  />

                  <div>
                    <VehicleIllustration
                      imageUrl={vehicle.image_url}
                      videoUrl={vehicle.video_url}
                      name={vehicle.name}
                      category={vehicle.category}
                      isHovered={isHovered}
                      onOpenVideo={() => setVideoModalVehicles([vehicle])}
                    />

                    <div className="p-6">
                      {/* Clean Unboxed Metadata Row */}
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span className="font-bold text-navy">
                            {vehicle.fleet_type}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">
                            {vehicle.drive_option === "DRIVER_OR_SELF"
                              ? "Driver or Self-Drive"
                              : vehicle.drive_option === "DRIVER_OR_REQUEST_SELF"
                              ? "Driver / Request Self-Drive"
                              : "Driver Included"}
                          </span>
                        </div>
                      </div>

                      <h3 className="mt-2 text-lg font-extrabold text-navy group-hover:text-navy-light transition-colors">
                        {vehicle.name}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                        {vehicle.best_uses}
                      </p>

                      {/* Spec Row */}
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3.5 text-xs font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-gold-hover" />
                          {vehicle.seats}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Cog className="h-3.5 w-3.5 text-gold-hover" />
                          {vehicle.transmission || "Automatic"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Wind className="h-3.5 w-3.5 text-gold-hover" />
                          {vehicle.ac === 1 ? "A/C" : "Cargo"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Luggage className="h-3.5 w-3.5 text-gold-hover" />
                          {vehicle.luggage}
                        </span>
                      </div>

                      {/* Quick Video & Compare Controls */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoModalVehicles([vehicle])}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-bg px-3 py-2 text-xs font-bold text-navy transition-colors hover:border-navy/40 hover:bg-white whitespace-nowrap"
                        >
                          <Play className="h-3.5 w-3.5 text-gold-hover fill-gold-hover" />
                          <span>Watch Video</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCompare(vehicle.id)}
                          disabled={!isCompared && compareIds.length >= 3}
                          aria-pressed={isCompared}
                          title={
                            !isCompared && compareIds.length >= 3
                              ? "Maximum 3 vehicles selected — remove one to add another"
                              : isCompared
                              ? "Remove from side-by-side comparison"
                              : "Select to compare side-by-side (up to 3)"
                          }
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 ${
                            isCompared
                              ? "border-navy bg-navy text-gold"
                              : "border-slate-200 bg-white text-slate-700 hover:border-gold hover:text-navy"
                          }`}
                        >
                          {isCompared ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Selected</span>
                            </>
                          ) : compareIds.length >= 3 ? (
                            <span>Max 3 Selected</span>
                          ) : (
                            <>
                              <GitCompare className="h-3.5 w-3.5" />
                              <span>Compare</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price & Book Action Footer */}
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <div className="text-sm font-extrabold text-navy tabular-nums">
                      {vehicle.price_display}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => setModalVehicle(vehicle)}
                      className="btn-gold px-4! py-2! text-xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{vehicle.is_quote_only ? "Get Quote" : "Book"}</span>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating Bottom Comparison Tray (when 1+ cars selected) */}
      <AnimatePresence>
        {compareVehicles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            className="fixed bottom-4 left-4 right-20 z-30 mx-auto max-w-3xl rounded-2xl border border-gold/50 bg-navy p-3 text-white shadow-2xl sm:left-6 sm:right-24 sm:px-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-gold whitespace-nowrap">
                  Compare ({compareVehicles.length}/3):
                </span>
                {compareVehicles.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    <span className="max-w-32 truncate">{v.name.split(" /")[0]}</span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(v.id)}
                      aria-label={`Remove ${v.name} from comparison`}
                      className="text-white/70 hover:text-gold"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="text-xs font-semibold text-white/70 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModalVehicles(compareVehicles)}
                  className="btn-gold px-4! py-2! text-xs whitespace-nowrap"
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>
                    {compareVehicles.length >= 2
                      ? `Compare Side-by-Side (${compareVehicles.length})`
                      : "View Specs & Add More"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Walkaround & Side-by-Side Comparison Modal */}
      <VehicleComparisonModal
        vehicles={videoModalVehicles}
        allVehicles={vehicles}
        onClose={() => setVideoModalVehicles([])}
        onAddCompare={handleAddToVideoModal}
        onRemoveCompare={handleRemoveFromVideoModal}
        onBookVehicle={(vehicle) => setModalVehicle(vehicle)}
      />

      {/* Animated Booking Modal */}
      <AnimatePresence>
        {modalVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-xs overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: EASE_SMOOTH }}
              className="relative my-8 w-full max-w-xl"
            >
              <button
                type="button"
                onClick={() => setModalVehicle(null)}
                className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white shadow-lg border border-gold hover:bg-gold hover:text-navy"
                aria-label="Close booking form"
              >
                <X className="h-5 w-5" />
              </button>
              <QuickBookingCalculator
                vehicles={vehicles}
                settings={settings}
                defaultVehicleId={modalVehicle.id}
                defaultService={
                  modalVehicle.filter_group === "moving_cargo"
                    ? "Moving & Cargo"
                    : "Car Hire"
                }
                compact
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
