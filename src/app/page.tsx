import React from "react";
import Link from "next/link";
import {
  Car,
  Plane,
  Truck,
  ArrowRight,
  Star,
  Gift,
  Sparkles,
  Users,
  Wind,
  Luggage,
} from "lucide-react";
import {
  getPackages,
  getReviews,
  getSiteSettings,
  getVehicles,
} from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { QuickBookingCalculator } from "@/components/QuickBookingCalculator";
import { VehicleIllustration } from "@/components/VehicleIllustration";
import { formatUGX } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSiteSettings();
  const vehicles = getVehicles({ activeOnly: true });
  const featuredVehicles = vehicles.filter((v) => v.featured === 1).slice(0, 4);
  const packages = getPackages({ activeOnly: true });
  const reviews = getReviews({ activeOnly: true }).slice(0, 3);

  return (
    <div>
      {/* 1. Executive Hero Section + Quick Booking Calculator */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #C59B3B 0%, transparent 45%), radial-gradient(circle at 80% 80%, #C59B3B 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Hero Copy */}
            <div className="lg:col-span-6">
              {settings.promo_banner_active === "true" && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-bold text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>
                    {settings.promo_discount_percent}% OFF First 50 Clients • Use Code{" "}
                    {settings.promo_code}
                  </span>
                </div>
              )}

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
                {settings.hero_title}
              </h1>

              <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
                {settings.hero_subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/fleet" className="btn-gold text-sm sm:text-base">
                  <span>Browse Full Fleet</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/airport-transfers"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:border-gold hover:text-gold transition-colors"
                >
                  <Plane className="h-4 w-4 text-gold" />
                  <span>
                    Entebbe Airport ({formatUGX(settings.airport_rate_ugx)})
                  </span>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-center sm:text-left">
                <div>
                  <div className="text-xl font-extrabold text-gold sm:text-2xl">
                    30 Mins
                  </div>
                  <div className="text-xs text-white/75">WhatsApp Reply</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gold sm:text-2xl">
                    Owned + 5–8
                  </div>
                  <div className="text-xs text-white/75">Vetted Partner Trucks</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gold sm:text-2xl">
                    100% GPS
                  </div>
                  <div className="text-xs text-white/75">Tracked &amp; Insured</div>
                </div>
              </div>
            </div>

            {/* Right Quick Booking Calculator */}
            <div className="lg:col-span-6">
              <QuickBookingCalculator vehicles={vehicles} settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Five Key Trust Promises Strip */}
      <TrustBar />

      {/* 3. Three Core Service Cards */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
            One Trusted Kampala Partner
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
            Passenger Rides, Airport Pickups &amp; Cargo Moving
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">
            Whether you need a daily town saloon, a reliable Entebbe Airport transfer, or a
            3-tonne cargo van for Kikubo &amp; moving day — book everything in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Card 1: Passenger Car Hire */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-gold/60 transition-colors">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-navy">
                Passenger Car Hire
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Clean, air-conditioned Toyota Premio, Fielder, Wish, Noah &amp; Land
                Cruisers. Available with a trained chauffeur or verified Day-1 Self-Drive.
              </p>
            </div>
            <Link
              href="/fleet"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-gold"
            >
              <span>Explore Fleet &amp; Rates</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Card 2: Corporate & Airport */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-gold/60 transition-colors">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-navy">
                Corporate &amp; Airport Transfers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Fixed {formatUGX(settings.airport_rate_ugx)} Entebbe ↔ Kampala pickups with
                live flight tracking, plus monthly NGO/Corporate retainers and 10% hotel
                referral partnerships.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/airport-transfers"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-gold"
              >
                <span>Airport Pickup</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/corporate"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-gold hover:text-navy"
              >
                <span>Corporate &amp; Hotels</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Moving & Cargo */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-gold/60 transition-colors">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-gold">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-navy">
                Moving &amp; Cargo Logistics
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Home moves, office relocations, and SME/wholesale cargo runs from Kikubo,
                Owino, and Industrial Area using our 5–8 vetted van &amp; Fuso Canter
                partners.
              </p>
            </div>
            <Link
              href="/moving-cargo"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-gold"
            >
              <span>Request Moving Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Fleet Preview */}
      <section className="bg-slate-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
                Hybrid Owned &amp; Partner Fleet
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">
                Featured Vehicles Ready Today
              </h2>
            </div>
            <Link href="/fleet" className="btn-navy-outline text-sm">
              <span>View All {vehicles.length} Vehicle Categories</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <VehicleIllustration
                    imageUrl={vehicle.image_url}
                    name={vehicle.name}
                    category={vehicle.category}
                  />
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          vehicle.fleet_type.includes("OWNED")
                            ? "bg-sky-100 text-sky-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {vehicle.fleet_type}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        {vehicle.drive_option === "DRIVER_OR_SELF"
                          ? "Driver or Self-Drive"
                          : vehicle.drive_option === "DRIVER_OR_REQUEST_SELF"
                          ? "Driver / Request Self"
                          : "Driver Included"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-extrabold text-navy">
                      {vehicle.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {vehicle.best_uses}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gold" />
                        {vehicle.seats}
                      </span>
                      {vehicle.ac === 1 && (
                        <span className="inline-flex items-center gap-1">
                          <Wind className="h-3.5 w-3.5 text-gold" />
                          A/C
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Luggage className="h-3.5 w-3.5 text-gold" />
                        {vehicle.luggage}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-navy">
                    {vehicle.price_display}
                  </span>
                  <Link
                    href={`/fleet?vehicle=${vehicle.id}`}
                    className="btn-gold px-3.5! py-1.5! text-xs"
                  >
                    {vehicle.is_quote_only ? "Get Quote" : "Book"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Transparent Rates Table + Loyalty Banner */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
              No Hidden Fees
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-navy sm:text-3xl">
              Transparent Pricing &amp; Packages
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold-soft px-4 py-2 text-xs font-bold text-navy">
            <Gift className="h-4 w-4 text-gold" />
            <span>{settings.loyalty_banner_text}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Package / Service</th>
                  <th className="px-5 py-3.5 font-bold">Website Rate</th>
                  <th className="px-5 py-3.5 font-bold">Details &amp; Inclusions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-bold text-navy">{pkg.name}</td>
                    <td className="px-5 py-3.5 font-extrabold text-gold-hover whitespace-nowrap">
                      {pkg.price_display}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{pkg.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Client Reviews */}
      <section className="bg-navy py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Trusted Across Kampala
            </span>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              What Our Clients Say
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-2xl border border-white/15 bg-white/5 p-6"
              >
                <div>
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/90">
                    &ldquo;{r.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-5 border-t border-white/10 pt-3">
                  <div className="text-sm font-bold text-white">{r.client_name}</div>
                  <div className="text-xs text-gold">{r.client_role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
