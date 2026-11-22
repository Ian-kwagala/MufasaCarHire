import React from "react";
import { BookingFormSkeleton } from "@/components/Skeletons";

export default function MovingCargoLoading() {
  return (
    <div>
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="h-3.5 w-60 animate-pulse rounded bg-gold/40" />
          <div className="h-10 w-96 max-w-full animate-pulse rounded-xl bg-white/15" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          </div>
          <div className="lg:col-span-7">
            <BookingFormSkeleton variant="moving" />
          </div>
        </div>
      </section>
    </div>
  );
}
