import React, { Suspense } from "react";
import Link from "next/link";
import { Box, Car, Plane, Truck, ArrowRight } from "lucide-react";
import {
  getPackages,
  getReviews,
  getSiteSettings,
  getVehicles,
} from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { QuickBookingCalculator } from "@/components/QuickBookingCalculator";
import { HomeFaqSection } from "@/components/HomeFaqSection";
import { BookingFormSkeleton } from "@/components/Skeletons";
import {
  HeroDriveAnimation,
  RoadDividerAnimation,
} from "@/components/HeroDriveAnimation";
import { HomeShowcaseTabs } from "@/components/HomeShowcaseTabs";
import { KampalaRouteMap } from "@/components/KampalaRouteMap";
import { FadeInSection } from "@/components/MotionPrimitives";
import { formatUGX } from "@/lib/whatsapp";
import { getGoogleMapsApiKey } from "@/lib/mapsConfig";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSiteSettings();
  const mapsApiKey = getGoogleMapsApiKey();
  const vehicles = getVehicles({ activeOnly: true });
  const featuredVehicles = vehicles.filter((v) => v.featured === 1);
  const packages = getPackages({ activeOnly: true });
  const reviews = getReviews({ activeOnly: true }).slice(0, 3);

  const quickServices = [
    {
      href: "/fleet",
      icon: Car,
      title: "Car Hire & Self-Drive",
      desc: "Clean saloons, 7-seater MPVs, and 4x4 SUVs with chauffeur or Day-1 self-drive.",
    },
    {
      href: "/airport-transfers",
      icon: Plane,
      title: `Entebbe Airport (${formatUGX(settings.airport_rate_ugx)})`,
      desc: "Fixed-rate Kampala pickups with live flight tracking and Meet & Greet.",
    },
    {
      href: "/moving-cargo",
      icon: Truck,
      title: "Moving & Cargo Vans",
      desc: "1–5 tonne partner vans and Fuso trucks for homes, offices, and Kikubo cargo.",
    },
  ];

  return (
    <div>
      {/* 1. Calm Executive Hero + Creative Moving Car Showcase */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Focused Left Copy */}
            <FadeInSection immediate className="lg:col-span-6">
              {settings.promo_banner_active === "true" && (
                <p className="text-xs font-bold tracking-wider text-gold uppercase">
                  {settings.promo_discount_percent}% Off First 50 Clients · Code{" "}
                  {settings.promo_code}
                </p>
              )}

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-[1.12] text-balance">
                {settings.hero_title}
              </h1>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                {settings.hero_subtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#quick-book" className="btn-gold text-sm sm:text-base">
                  <span>Book a Ride</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/fleet"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-gold hover:text-gold"
                >
                  <span>Browse Fleet</span>
                </Link>
                <Link
                  href="/showroom-3d"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-navy"
                >
                  <Box className="h-4 w-4" />
                  <span>3D Showroom</span>
                </Link>
              </div>
            </FadeInSection>

            {/* Right Creative Moving Car Animation */}
            <FadeInSection immediate delay={0.1} className="lg:col-span-6">
              <HeroDriveAnimation airportRateUgx={settings.airport_rate_ugx} />
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 2. Quiet Single-Row Trust Ribbon */}
      <FadeInSection>
        <TrustBar />
      </FadeInSection>

      {/* 3. Focused Booking Desk + 3 Concise Service Links */}
      <section
        id="quick-book"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid items-start gap-10 lg:grid-cols-12">
          {/* Left: 3 Minimal Service Links */}
          <FadeInSection className="space-y-4 lg:col-span-5">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-gold-hover">
                One Trusted Kampala Partner
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-navy sm:text-3xl text-balance">
                Simple Booking in Under 60 Seconds
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Pick your ride or cargo truck below for an instant estimate and
                30-minute WhatsApp confirmation.
              </p>
            </div>

            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {quickServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link
                    key={svc.href}
                    href={svc.href}
                    className="group flex items-start gap-3.5 p-4 transition-colors hover:bg-slate-bg"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-navy group-hover:text-gold-hover transition-colors">
                          {svc.title}
                        </h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {svc.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </FadeInSection>

          {/* Right: 2-Step Quick Booking Card */}
          <FadeInSection delay={0.08} className="lg:col-span-7">
            <Suspense fallback={<BookingFormSkeleton variant="quick" />}>
              <QuickBookingCalculator vehicles={vehicles} settings={settings} />
            </Suspense>
          </FadeInSection>
        </div>
      </section>

      {/* Subtle Moving Car Road Divider */}
      <FadeInSection>
        <RoadDividerAnimation />
      </FadeInSection>

      {/* 4. Unified Tabbed Showcase: Fleet · Rates · Reviews (1 View Shown at Once) */}
      <HomeShowcaseTabs
        featuredVehicles={featuredVehicles}
        totalVehicleCount={vehicles.length}
        packages={packages}
        reviews={reviews}
        settings={settings}
      />

      {/* 5. Interactive Google Maps Platform Kampala & Entebbe Route Planner */}
      <FadeInSection className="border-t border-slate-200 bg-white">
        <KampalaRouteMap apiKey={mapsApiKey} settings={settings} />
      </FadeInSection>

      {/* 6. Focused 3-Question FAQ Switcher */}
      <HomeFaqSection settings={settings} />
    </div>
  );
}
