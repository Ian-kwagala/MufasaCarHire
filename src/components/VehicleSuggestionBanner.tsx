"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Compass, Play, RefreshCw } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import type { VehicleRecommendation } from "@/lib/vehicleRecommendation";
import { EASE_SMOOTH } from "./MotionPrimitives";

interface VehicleSuggestionBannerProps {
  recommendation: VehicleRecommendation | null;
  selectedVehicleId: string | number;
  isAutoApplied: boolean;
  onApplyVehicle: (vehicle: Vehicle) => void;
  onPreviewVideo?: (vehicle: Vehicle) => void;
}

/**
 * Clean inline smart-match card displayed during booking.
 * Explains why a car type matches the client's entered details, lets them
 * switch in one click if they chose another vehicle, or preview its video.
 */
export function VehicleSuggestionBanner({
  recommendation,
  selectedVehicleId,
  isAutoApplied,
  onApplyVehicle,
  onPreviewVideo,
}: VehicleSuggestionBannerProps) {
  if (!recommendation) return null;

  const { vehicle, alternative, headline, reasons, driveNote } = recommendation;
  const isAlreadySelected = String(selectedVehicleId) === String(vehicle.id);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${vehicle.id}-${headline}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: EASE_SMOOTH }}
        className="rounded-xl border border-gold/45 bg-gold-soft/75 p-3.5 text-navy"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Thumbnail + Recommendation Summary */}
          <div className="flex items-start gap-3 min-w-0">
            {vehicle.image_url ? (
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-navy/10 bg-navy-dark">
                <img
                  src={vehicle.image_url}
                  alt={vehicle.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                <Compass className="h-5 w-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold text-gold-hover">
                <span className="inline-flex items-center gap-1">
                  <Compass className="h-3 w-3" />
                  Auto-Suggested Match
                </span>
                {isAlreadySelected && isAutoApplied && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    · <Check className="h-3 w-3" /> Selected
                  </span>
                )}
              </div>

              <div className="mt-0.5 text-sm font-extrabold text-navy">
                {vehicle.name}
                <span className="ml-2 text-xs font-bold text-slate-600 tabular-nums">
                  {vehicle.price_display}
                </span>
              </div>

              <p className="mt-0.5 text-xs font-semibold text-navy/85">
                {headline}
              </p>

              <ul className="mt-1 space-y-0.5 text-[11px] leading-snug text-slate-700">
                {reasons.slice(0, 2).map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>

              {driveNote && (
                <p className="mt-1 text-[11px] font-semibold text-navy/80">
                  Note: {driveNote}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            {!isAlreadySelected && (
              <button
                type="button"
                onClick={() => onApplyVehicle(vehicle)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-gold transition-colors hover:bg-navy-light whitespace-nowrap"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Use Suggested Car</span>
              </button>
            )}

            {onPreviewVideo && vehicle.video_url && (
              <button
                type="button"
                onClick={() => onPreviewVideo(vehicle)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-xs font-bold text-navy transition-colors hover:border-gold hover:bg-white whitespace-nowrap"
              >
                <Play className="h-3 w-3 text-gold-hover fill-gold-hover" />
                <span>Watch Video</span>
              </button>
            )}

            {alternative && isAlreadySelected && (
              <button
                type="button"
                onClick={() => onApplyVehicle(alternative)}
                className="text-[11px] font-bold text-navy/75 underline decoration-gold/70 hover:text-navy whitespace-nowrap"
              >
                Or try {alternative.name.split(" /")[0]}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
