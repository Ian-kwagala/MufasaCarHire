import React from "react";
import { BookingFormSkeleton, FleetCardSkeleton } from "@/components/Skeletons";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero Skeleton */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <div className="h-7 w-64 animate-pulse rounded-full bg-white/15" />
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/15" />
              <div className="h-12 w-4/5 animate-pulse rounded-xl bg-white/15" />
              <div className="h-5 w-full animate-pulse rounded bg-white/10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="flex gap-3 pt-2">
                <div className="h-12 w-44 animate-pulse rounded-full bg-gold/50" />
                <div className="h-12 w-52 animate-pulse rounded-full bg-white/15" />
              </div>
            </div>
            <div className="lg:col-span-6">
              <BookingFormSkeleton variant="quick" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles Skeleton */}
      <section className="bg-slate-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-2">
            <div className="h-3.5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <FleetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
