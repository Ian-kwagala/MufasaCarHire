import React from "react";

/**
 * Reusable skeleton components matching the exact card, filter bar, and booking form
 * geometry across FleetExplorer and all booking forms to prevent layout shift.
 */

export function FleetCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
    >
      <div>
        {/* Mirrors VehicleIllustration height */}
        <div className="h-44 w-full animate-pulse bg-slate-200/80" />
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200/80" />
          <div className="space-y-2 pt-1">
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-200/70" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-200/70" />
          </div>
          <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200/80" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200/80" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200/80" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-3 w-10 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-full bg-gold/40" />
      </div>
    </div>
  );
}

export function FleetExplorerSkeleton({ cardCount = 6 }: { cardCount?: number }) {
  return (
    <div role="status" aria-label="Loading fleet catalog">
      <span className="sr-only">Loading fleet vehicles...</span>
      {/* Filter Toolbar Skeleton */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-56 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Vehicle Grid Skeleton */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cardCount }).map((_, idx) => (
          <FleetCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export function BookingFormSkeleton({
  variant = "quick",
}: {
  variant?: "quick" | "airport" | "moving" | "corporate";
}) {
  return (
    <div
      role="status"
      aria-label="Loading booking form"
      className="rounded-2xl border border-gold/40 bg-white p-5 text-navy shadow-xl sm:p-6"
    >
      <span className="sr-only">Loading booking form...</span>
      {/* Form Header */}
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-200/80" />
          </div>
        </div>
        {variant === "airport" && (
          <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-3.5">
        {variant === "airport" || variant === "corporate" ? (
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-10 animate-pulse rounded-xl bg-slate-200" />
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
        </div>

        {variant === "moving" || variant === "corporate" ? (
          <div className="space-y-1.5">
            <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-20 w-full animate-pulse rounded-xl bg-slate-200/80" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/80" />
            </div>
          </div>
        )}

        {/* Estimate Strip Skeleton */}
        {(variant === "quick" || variant === "airport") && (
          <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold-soft px-4 py-3">
            <div className="space-y-1.5">
              <div className="h-3 w-24 animate-pulse rounded bg-gold/30" />
              <div className="h-5 w-40 animate-pulse rounded bg-navy/20" />
            </div>
          </div>
        )}

        {/* Submit CTA Skeleton */}
        <div className="h-12 w-full animate-pulse rounded-full bg-gold/50" />
      </div>
    </div>
  );
}
