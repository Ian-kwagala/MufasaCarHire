import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Box, Gift, Sparkles } from "lucide-react";
import { getSiteSettings, getVehicles } from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { FleetExplorer } from "@/components/FleetExplorer";
import { SelfDriveBox } from "@/components/SelfDriveBox";
import { FleetExplorerSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampala Car Hire Fleet & Self-Drive Catalog",
  description:
    "Browse GPS-tracked, insured Kampala car hire vehicles: Toyota Premio, Fielder, Wish, Noah, Land Cruiser SUVs, HiAce vans, Coaster buses & cargo trucks.",
};

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const settings = getSiteSettings();
  const vehicles = getVehicles({ activeOnly: true });
  const params = await searchParams;
  const initialVehicleId = params.vehicle ? Number(params.vehicle) : undefined;

  return (
    <div>
      {/* Page Header */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Company-Owned + Vetted Partner Network
            </span>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Fleet &amp; Car Hire Catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
              Pick your exact vehicle — from daily Toyota Premio saloons and 7-seater MPVs
              to executive Land Cruisers, Coaster buses, and 1–5 tonne cargo trucks.
            </p>
          </div>

          <Link
            href="/showroom-3d"
            className="inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/5 px-5 py-2.5 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
          >
            <Box className="h-4 w-4" />
            <span>Open 3D Showroom</span>
          </Link>
        </div>
      </section>

      <TrustBar compact />

      {/* Main Fleet Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        {/* Promo + Loyalty Banner */}
        <div className="grid gap-4 md:grid-cols-2">
          {settings.promo_banner_active === "true" && (
            <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-navy">
                  First 50 Clients Promo — {settings.promo_discount_percent}% OFF
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {settings.promo_description}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-navy/15 bg-slate-bg p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-navy">
                Monthly Loyalty Reward (4+ Trips)
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                {settings.loyalty_banner_text}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Fleet Filter & Cards */}
        <Suspense fallback={<FleetExplorerSkeleton cardCount={6} />}>
          <FleetExplorer
            vehicles={vehicles}
            settings={settings}
            initialVehicleId={initialVehicleId}
          />
        </Suspense>

        {/* Required Self-Drive Checklist */}
        <SelfDriveBox
          dailyRateUgx={settings.self_drive_daily_ugx}
          depositUgx={settings.self_drive_deposit_ugx}
        />
      </section>
    </div>
  );
}
