import React from "react";
import { BookingFormSkeleton } from "@/components/Skeletons";

export default function AirportTransfersLoading() {
  return (
    <section className="bg-navy py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-6">
            <div className="h-3.5 w-60 animate-pulse rounded bg-gold/40" />
            <div className="h-11 w-full animate-pulse rounded-xl bg-white/15" />
            <div className="h-5 w-5/6 animate-pulse rounded bg-white/10" />
            <div className="h-24 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-white/10" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <BookingFormSkeleton variant="airport" />
          </div>
        </div>
      </div>
    </section>
  );
}
