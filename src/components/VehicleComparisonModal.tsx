"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  Cog,
  GitCompare,
  Luggage,
  MessageCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Tag,
  Users,
  Wind,
  X,
} from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { EASE_SMOOTH } from "./MotionPrimitives";

interface VehicleComparisonModalProps {
  /** Vehicles currently open in the modal (1 = single walkaround, 2-3 = side-by-side comparison) */
  vehicles: Vehicle[];
  /** Full catalog so user can add another car to compare directly from the modal */
  allVehicles: Vehicle[];
  onClose: () => void;
  onAddCompare?: (vehicle: Vehicle) => void;
  onRemoveCompare?: (vehicleId: number) => void;
  onBookVehicle?: (vehicle: Vehicle) => void;
}

function formatDriveOption(option: Vehicle["drive_option"]): string {
  if (option === "DRIVER_OR_SELF") return "Chauffeur or Day-1 Self-Drive";
  if (option === "DRIVER_OR_REQUEST_SELF") return "Chauffeur / Self-Drive on Request";
  return "Professional Driver Included";
}

function resolveTransmission(vehicle: Vehicle): string {
  if (vehicle.transmission && vehicle.transmission.trim()) {
    return vehicle.transmission;
  }
  const text = `${vehicle.name} ${vehicle.category}`.toLowerCase();
  if (text.includes("cruiser") || text.includes("4x4")) return "Automatic (4x4)";
  if (text.includes("fuso") || text.includes("truck")) return "Manual (Heavy Duty)";
  if (text.includes("coaster") || text.includes("cargo")) return "Manual (Commercial)";
  if (text.includes("hiace")) return "Manual / Automatic";
  return "Automatic";
}

/**
 * Interactive Video Walkaround & Side-by-Side Comparison Modal.
 * - Single car (1 selected): Full-width 16:9 video showcase + detailed spec list.
 * - Comparison (2–3 selected): Synchronized side-by-side video players + aligned
 *   comparison matrix table covering Rate, Transmission, Capacity, Luggage, Drive Option,
 *   Climate Control, Fleet Type, and Best Uses.
 */
export function VehicleComparisonModal({
  vehicles,
  allVehicles,
  onClose,
  onAddCompare,
  onRemoveCompare,
  onBookVehicle,
}: VehicleComparisonModalProps) {
  const [playingAll, setPlayingAll] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const isOpen = vehicles.length > 0;
  const isComparing = vehicles.length > 1;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    Object.values(videoRefs.current).forEach((el) => {
      if (!el) return;
      el.playbackRate = playbackRate;
      if (playingAll) {
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [playingAll, playbackRate, vehicles.length, isOpen]);

  function handleRestartAll() {
    Object.values(videoRefs.current).forEach((el) => {
      if (!el) return;
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    });
    setPlayingAll(true);
  }

  const availableToAdd = allVehicles.filter(
    (candidate) => !vehicles.some((v) => v.id === candidate.id)
  );

  // Identify lowest numeric rate among compared vehicles for subtle "Best Daily Value" callout
  const lowestFixedRate = vehicles.reduce<number | null>((min, v) => {
    if (typeof v.rate_ugx === "number" && v.rate_ugx > 0 && v.is_quote_only === 0) {
      return min === null ? v.rate_ugx : Math.min(min, v.rate_ugx);
    }
    return min;
  }, null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={
            isComparing ? "Side-by-side vehicle comparison" : "Vehicle video preview"
          }
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            onClick={(e) => e.stopPropagation()}
            className={`relative my-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${
              vehicles.length >= 3
                ? "max-w-6xl"
                : vehicles.length === 2
                ? "max-w-5xl"
                : "max-w-3xl"
            }`}
          >
            {/* Modal Header + Synchronized Video Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-navy px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-gold">
                  <GitCompare className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">
                    {isComparing
                      ? `Side-by-Side Vehicle Comparison (${vehicles.length} Selected)`
                      : `${vehicles[0].name} — Video Showcase`}
                  </h2>
                  <p className="text-xs text-white/75">
                    {isComparing
                      ? "Compare videos, transmission, capacity, luggage room & daily rates side-by-side"
                      : "Watch the showcase video or add up to 2 more vehicles to compare side-by-side"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlayingAll((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-gold hover:text-gold whitespace-nowrap"
                >
                  {playingAll ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-gold" />
                      <span>{isComparing ? "Pause All" : "Pause"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-gold fill-gold" />
                      <span>{isComparing ? "Play All" : "Play"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRestartAll}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:border-gold hover:text-gold whitespace-nowrap"
                  title="Restart videos from beginning"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Replay</span>
                </button>

                <div className="hidden sm:inline-flex rounded-lg border border-white/15 bg-white/5 p-0.5 text-[11px] font-bold">
                  {[0.75, 1, 1.25].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackRate(speed)}
                      className={`rounded-md px-2 py-1 transition-colors ${
                        playbackRate === speed
                          ? "bg-gold text-navy"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close comparison modal"
                  className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-gold hover:text-navy"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
              {isComparing ? (
                /* Side-by-Side Comparison View (2–3 Vehicles) */
                <div className="space-y-6">
                  {/* Top Row: Synchronized Video Cards */}
                  <div
                    className={`grid gap-4 ${
                      vehicles.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-3"
                    }`}
                  >
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-bg/60"
                      >
                        <div className="relative aspect-video w-full overflow-hidden bg-navy-dark">
                          {vehicle.video_url ? (
                            <video
                              ref={(el) => {
                                videoRefs.current[vehicle.id] = el;
                              }}
                              src={vehicle.video_url}
                              poster={vehicle.image_url || undefined}
                              muted
                              loop
                              autoPlay
                              playsInline
                              className="h-full w-full object-cover"
                            />
                          ) : vehicle.image_url ? (
                            <img
                              src={vehicle.image_url}
                              alt={vehicle.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-semibold text-white/70">
                              Preview Unavailable
                            </div>
                          )}

                          {onRemoveCompare && (
                            <button
                              type="button"
                              onClick={() => onRemoveCompare(vehicle.id)}
                              aria-label={`Remove ${vehicle.name} from comparison`}
                              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-navy/80 text-white backdrop-blur-xs hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-slate-500 truncate">
                              {vehicle.category} · {vehicle.fleet_type}
                            </div>
                            <h3 className="text-sm font-extrabold text-navy truncate">
                              {vehicle.name}
                            </h3>
                          </div>
                          {onBookVehicle && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onBookVehicle(vehicle);
                              }}
                              className="btn-gold px-3.5! py-1.5! text-xs shrink-0 whitespace-nowrap"
                            >
                              {vehicle.is_quote_only ? "Quote" : "Book"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Aligned Side-by-Side Feature Comparison Matrix */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] border-collapse text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="w-40 px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                              Feature
                            </th>
                            {vehicles.map((vehicle) => (
                              <th
                                key={vehicle.id}
                                className="px-4 py-3 font-extrabold text-navy"
                              >
                                {vehicle.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* Daily Rate */}
                          <tr className="bg-gold-soft/40">
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Tag className="h-3.5 w-3.5 text-gold-hover" />
                                Daily Rate
                              </span>
                            </td>
                            {vehicles.map((vehicle) => {
                              const isBestValue =
                                lowestFixedRate !== null &&
                                vehicle.rate_ugx === lowestFixedRate &&
                                vehicle.is_quote_only === 0;
                              return (
                                <td
                                  key={vehicle.id}
                                  className="px-4 py-3 font-extrabold text-navy tabular-nums"
                                >
                                  <div>{vehicle.price_display}</div>
                                  {isBestValue && (
                                    <div className="mt-0.5 text-[11px] font-bold text-emerald-700">
                                      Lowest daily rate
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Transmission */}
                          <tr>
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Cog className="h-3.5 w-3.5 text-gold-hover" />
                                Transmission
                              </span>
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 font-bold text-navy"
                              >
                                {resolveTransmission(vehicle)}
                              </td>
                            ))}
                          </tr>

                          {/* Passenger Capacity */}
                          <tr className="bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-gold-hover" />
                                Capacity
                              </span>
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 font-bold text-navy"
                              >
                                {vehicle.seats}
                              </td>
                            ))}
                          </tr>

                          {/* Luggage / Payload */}
                          <tr>
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Luggage className="h-3.5 w-3.5 text-gold-hover" />
                                Luggage / Load
                              </span>
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 font-semibold text-navy"
                              >
                                {vehicle.luggage}
                              </td>
                            ))}
                          </tr>

                          {/* Drive Option */}
                          <tr className="bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-gold-hover" />
                                Drive Option
                              </span>
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 font-semibold text-navy"
                              >
                                {formatDriveOption(vehicle.drive_option)}
                              </td>
                            ))}
                          </tr>

                          {/* Climate Control */}
                          <tr>
                            <td className="px-4 py-3 font-bold text-slate-600">
                              <span className="inline-flex items-center gap-1.5">
                                <Wind className="h-3.5 w-3.5 text-gold-hover" />
                                Climate Control
                              </span>
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 font-semibold text-navy"
                              >
                                {vehicle.ac === 1
                                  ? "Full A/C Cabin"
                                  : "Commercial Cargo Bay"}
                              </td>
                            ))}
                          </tr>

                          {/* Best Uses */}
                          <tr className="bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-600 align-top">
                              Best For
                            </td>
                            {vehicles.map((vehicle) => (
                              <td
                                key={vehicle.id}
                                className="px-4 py-3 text-xs leading-relaxed text-slate-600 align-top"
                              >
                                {vehicle.best_uses}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Single Vehicle Video Walkaround View */
                (() => {
                  const vehicle = vehicles[0];
                  return (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-bg/60">
                      <div className="relative aspect-video w-full overflow-hidden bg-navy-dark">
                        {vehicle.video_url ? (
                          <video
                            ref={(el) => {
                              videoRefs.current[vehicle.id] = el;
                            }}
                            src={vehicle.video_url}
                            poster={vehicle.image_url || undefined}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : vehicle.image_url ? (
                          <img
                            src={vehicle.image_url}
                            alt={vehicle.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold text-white/70">
                            Video Preview Unavailable
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-slate-500">
                              <span className="font-bold text-navy">
                                {vehicle.fleet_type}
                              </span>{" "}
                              · {vehicle.category}
                            </div>
                            <h3 className="mt-1 text-lg font-extrabold text-navy">
                              {vehicle.name}
                            </h3>
                          </div>
                          <div className="text-base font-extrabold text-gold-hover tabular-nums">
                            {vehicle.price_display}
                          </div>
                        </div>

                        <dl className="mt-4 grid gap-3 border-t border-slate-200/80 pt-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                              <Cog className="h-3.5 w-3.5 text-gold-hover" />
                              Transmission
                            </dt>
                            <dd className="mt-0.5 font-bold text-navy">
                              {resolveTransmission(vehicle)}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                              <Users className="h-3.5 w-3.5 text-gold-hover" />
                              Capacity
                            </dt>
                            <dd className="mt-0.5 font-bold text-navy">
                              {vehicle.seats}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                              <Luggage className="h-3.5 w-3.5 text-gold-hover" />
                              Luggage / Load
                            </dt>
                            <dd className="mt-0.5 font-bold text-navy">
                              {vehicle.luggage}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                              <Wind className="h-3.5 w-3.5 text-gold-hover" />
                              Climate Control
                            </dt>
                            <dd className="mt-0.5 font-bold text-navy">
                              {vehicle.ac === 1 ? "Full A/C Cabin" : "Commercial Cargo"}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="inline-flex items-center gap-1.5 text-slate-500">
                              <ShieldCheck className="h-3.5 w-3.5 text-gold-hover" />
                              Drive Option
                            </dt>
                            <dd className="mt-0.5 font-bold text-navy">
                              {formatDriveOption(vehicle.drive_option)}
                            </dd>
                          </div>
                        </dl>

                        <p className="mt-4 text-xs leading-relaxed text-slate-600">
                          <span className="font-bold text-navy">Best for: </span>
                          {vehicle.best_uses}
                        </p>

                        {onBookVehicle && (
                          <div className="mt-5">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onBookVehicle(vehicle);
                              }}
                              className="btn-gold w-full py-2.5! text-sm"
                            >
                              <MessageCircle className="h-4 w-4" />
                              <span>
                                {vehicle.is_quote_only
                                  ? `Request Quote — ${vehicle.name}`
                                  : `Book ${vehicle.name}`}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Quick Add Another Vehicle to Compare Bar (when < 3 selected) */}
              {onAddCompare && vehicles.length < 3 && availableToAdd.length > 0 && (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-bg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-navy">
                      Add another vehicle to compare side-by-side ({vehicles.length}/3):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableToAdd.slice(0, 4).map((candidate) => (
                        <button
                          key={candidate.id}
                          type="button"
                          onClick={() => onAddCompare(candidate)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-navy transition-colors hover:border-gold hover:bg-gold-soft whitespace-nowrap"
                        >
                          <Plus className="h-3.5 w-3.5 text-gold-hover" />
                          <span>{candidate.name.split(" /")[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Footnote */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold-hover" />
                  All vehicles are GPS-tracked, insured &amp; inspected before every trip.
                </span>
                <span>WhatsApp confirmation within 30 minutes</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
