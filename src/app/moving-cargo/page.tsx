import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ShieldCheck, Clock, MapPin } from "lucide-react";
import { getSiteSettings, getVehicles } from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { MovingCargoForm } from "@/components/MovingCargoForm";
import { BookingFormSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampala Moving Vans & Cargo Logistics",
  description:
    "Hire 1–3 tonne cargo vans and Fuso Canter box trucks in Kampala for home moving, office relocations, and Kikubo/Owino SME deliveries.",
};

export default function MovingCargoPage() {
  const settings = getSiteSettings();
  const allVehicles = getVehicles({ activeOnly: true });
  const cargoVehicles = allVehicles.filter((v) => v.filter_group === "moving_cargo");

  return (
    <div>
      {/* Page Header */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            5–8 Vetted Van &amp; Truck Partners · Driver Included
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl text-balance">
            Moving &amp; Cargo Logistics Across Kampala &amp; Uganda
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Reliable home moves, office relocations, and SME wholesale cargo
            deliveries from Kikubo, Owino Market, and Industrial Area—quoted
            clearly within 30 minutes.
          </p>

          <div className="mt-6 flex flex-wrap gap-6 text-xs text-white/85">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              30-Minute WhatsApp Quotes
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold" />
              Vetted Partner Drivers &amp; Optional Loaders
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              Greater Kampala &amp; Upcountry Routes
            </span>
          </div>
        </div>
      </section>

      <TrustBar compact />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<BookingFormSkeleton variant="moving" />}>
          <MovingCargoForm settings={settings} cargoVehicles={cargoVehicles} />
        </Suspense>
      </section>
    </div>
  );
}
