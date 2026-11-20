"use client";

import React, { useMemo, useState } from "react";
import { Users, Wind, Luggage, MessageCircle, X } from "lucide-react";
import type { SiteSettings, Vehicle } from "@/lib/types";
import { VehicleIllustration } from "./VehicleIllustration";
import { QuickBookingCalculator } from "./QuickBookingCalculator";

const FILTER_TABS = [
  { key: "all", label: "All Vehicles" },
  { key: "saloons_mpvs", label: "Saloons & MPVs" },
  { key: "suvs_buses", label: "SUVs & Buses" },
  { key: "moving_cargo", label: "Moving & Cargo" },
] as const;

export function FleetExplorer({
  vehicles,
  settings,
  initialVehicleId,
}: {
  vehicles: Vehicle[];
  settings: SiteSettings;
  initialVehicleId?: number;
}) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [driveFilter, setDriveFilter] = useState<
    "all" | "with_driver" | "self_drive"
  >("all");
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(
    initialVehicleId
      ? vehicles.find((v) => v.id === initialVehicleId) ?? null
      : null
  );

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (activeTab !== "all" && v.filter_group !== activeTab) return false;
      if (driveFilter === "self_drive") {
        return (
          v.drive_option === "DRIVER_OR_SELF" ||
          v.drive_option === "DRIVER_OR_REQUEST_SELF"
        );
      }
      return true;
    });
  }, [vehicles, activeTab, driveFilter]);

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors sm:text-sm ${
                activeTab === tab.key
                  ? "bg-navy text-gold shadow-xs"
                  : "bg-white text-navy hover:bg-navy/5 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drive Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Drive Mode:</span>
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setDriveFilter("all")}
              className={`rounded-full px-3 py-1 ${
                driveFilter === "all" ? "bg-navy text-gold" : "text-slate-600"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDriveFilter("with_driver")}
              className={`rounded-full px-3 py-1 ${
                driveFilter === "with_driver"
                  ? "bg-navy text-gold"
                  : "text-slate-600"
              }`}
            >
              With Driver
            </button>
            <button
              type="button"
              onClick={() => setDriveFilter("self_drive")}
              className={`rounded-full px-3 py-1 ${
                driveFilter === "self_drive"
                  ? "bg-navy text-gold"
                  : "text-slate-600"
              }`}
            >
              Self-Drive
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-gold/60 hover:shadow-md transition-all"
          >
            <div>
              <VehicleIllustration
                imageUrl={vehicle.image_url}
                name={vehicle.name}
                category={vehicle.category}
              />
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      vehicle.fleet_type.includes("OWNED")
                        ? "bg-sky-100 text-sky-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {vehicle.fleet_type}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {vehicle.drive_option === "DRIVER_OR_SELF"
                      ? "Driver OR Self-Drive"
                      : vehicle.drive_option === "DRIVER_OR_REQUEST_SELF"
                      ? "Driver / Request Self-Drive"
                      : "Driver Included"}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-extrabold text-navy">
                  {vehicle.name}
                </h3>
                <p className="text-xs font-semibold text-gold-hover">
                  {vehicle.category}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {vehicle.best_uses}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gold" />
                    {vehicle.seats}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wind className="h-4 w-4 text-gold" />
                    {vehicle.ac === 1 ? "Air Conditioned" : "Cargo / Cabin"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Luggage className="h-4 w-4 text-gold" />
                    {vehicle.luggage}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 rounded-b-2xl">
              <div>
                <div className="text-[11px] font-semibold uppercase text-slate-500">
                  Rate
                </div>
                <div className="text-sm font-extrabold text-navy">
                  {vehicle.price_display}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalVehicle(vehicle)}
                className="btn-gold px-4! py-2! text-xs sm:text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{vehicle.is_quote_only ? "Get Quote" : "Book Now"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal when a client selects a vehicle */}
      {modalVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-8 w-full max-w-xl">
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
          </div>
        </div>
      )}
    </div>
  );
}
