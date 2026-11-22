import React from "react";
import { FleetExplorerSkeleton } from "@/components/Skeletons";

export default function FleetLoading() {
  return (
    <div>
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="h-3.5 w-56 animate-pulse rounded bg-gold/40" />
          <div className="h-10 w-80 animate-pulse rounded-xl bg-white/15" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <FleetExplorerSkeleton cardCount={6} />
      </section>
    </div>
  );
}
