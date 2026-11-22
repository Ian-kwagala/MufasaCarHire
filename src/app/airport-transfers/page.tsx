import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Plane,
  ShieldCheck,
  UserCheck,
  Luggage,
  Building2,
  ArrowRight,
} from "lucide-react";
import { getSiteSettings, getVehicles } from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { AirportTransferForm } from "@/components/AirportTransferForm";
import { KampalaRouteMap } from "@/components/KampalaRouteMap";
import { BookingFormSkeleton } from "@/components/Skeletons";
import { formatUGX } from "@/lib/whatsapp";
import { getGoogleMapsApiKey } from "@/lib/mapsConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entebbe Airport Transfers (UGX 80,000 Fixed Rate)",
  description:
    "Book fixed-rate Entebbe airport transfers to Kampala hotels, Kololo, Nakasero & Munyonyo. Live flight tracking, Meet & Greet, and UGX/USD payment options.",
};

export default function AirportTransfersPage() {
  const settings = getSiteSettings();
  const vehicles = getVehicles({ activeOnly: true });
  const mapsApiKey = getGoogleMapsApiKey();

  const highlights = [
    {
      icon: Clock,
      title: "Live Flight Tracking",
      desc: "Share your flight number (KQ, QR, ET, EK, SN) and our dispatch monitors your landing time so your driver waits if your flight is delayed.",
    },
    {
      icon: UserCheck,
      title: "Meet & Greet at Arrivals",
      desc: "Uniformed, English-speaking chauffeurs greet you right outside Entebbe arrivals with a printed name sign and assist with luggage.",
    },
    {
      icon: ShieldCheck,
      title: "Fixed Upfront Pricing",
      desc: `No airport taxi haggling. Standard Kampala transfers are fixed at ${formatUGX(
        settings.airport_rate_ugx
      )} ($${settings.airport_rate_usd} USD) with zero surprise charges.`,
    },
    {
      icon: Luggage,
      title: "Vehicles for Solo to Groups",
      desc: "Choose a clean Toyota Premio/Fielder saloon, 7-seater Toyota Wish/Noah for extra suitcases, VIP Land Cruiser, or 14-seater HiAce van.",
    },
  ];

  const hotelCorridor = [
    "Kampala Serena Hotel",
    "Mestil Hotel & Residences",
    "Protea Hotel by Marriott Kololo",
    "Speke Resort Munyonyo",
    "DoubleTree & Sheraton Kampala",
    "Kololo, Nakasero & Muyenga Residences",
  ];

  return (
    <div>
      {/* Hero + Direct Transfer Booking Form */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
                Entebbe International Airport (EBB) ↔ Kampala
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl text-balance">
                Fixed-Rate Entebbe Airport Transfers
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Arrive in Uganda without negotiation stress. Enjoy punctual,
                GPS-tracked pickups with live flight monitoring and clean
                air-conditioned vehicles direct to your hotel, embassy, or
                residence.
              </p>

              {/* Fixed Rate Highlight Card */}
              <div className="mt-6 rounded-2xl border border-gold/40 bg-white/5 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gold">
                      Standard Saloon Fixed Rate
                    </div>
                    <div className="mt-1 text-3xl font-extrabold text-white tabular-nums">
                      {formatUGX(settings.airport_rate_ugx)}
                      <span className="ml-2 text-base font-semibold text-gold">
                        / ${settings.airport_rate_usd} USD
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-white/80">
                    Entebbe ↔ Central Kampala · One-Way
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <Icon className="h-5 w-5 text-gold" />
                      <h2 className="mt-2 text-sm font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed text-white/75">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6">
              <Suspense fallback={<BookingFormSkeleton variant="airport" />}>
                <AirportTransferForm settings={settings} vehicles={vehicles} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <TrustBar compact />

      {/* Popular Hotels & Corridor Coverage */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Direct Door-to-Door Service
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
              Seamless Pickups for Kampala Hotels, Embassies &amp; Diplomats
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Whether you are flying in for a conference in Munyonyo, an NGO
              mission in Kololo, or a family visit in Ntinda, our dispatch
              confirms your driver&apos;s name, photo, and number plate on
              WhatsApp before your flight lands.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {hotelCorridor.map((place) => (
                <div
                  key={place}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-bg px-4 py-3 text-sm font-semibold text-navy"
                >
                  <Plane className="h-4 w-4 shrink-0 text-gold-hover" />
                  <span>{place}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-navy/15 bg-navy p-6 text-white sm:p-8">
              <Building2 className="h-8 w-8 text-gold" />
              <h3 className="mt-4 text-xl font-extrabold">
                Are You a Hotel Concierge or Travel Desk?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Partner hotels earn a{" "}
                <strong className="text-gold">10% referral commission</strong>{" "}
                on every confirmed guest airport transfer and car hire booking,
                with printed front-desk rate cards and 24/7 priority dispatch.
              </p>
              <Link
                href="/corporate"
                className="btn-gold mt-6 text-sm"
              >
                <span>Join Our Hotel Partner Program</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Entebbe Airport Route Planner */}
      <div className="border-t border-slate-200 bg-slate-bg/60">
        <KampalaRouteMap
          apiKey={mapsApiKey}
          settings={settings}
          heading="Entebbe Airport ↔ Kampala Live Route Preview"
          subheading="Search your Kampala hotel, embassy, or residence to preview the live driving distance and transfer time from Entebbe International Airport (EBB)."
        />
      </div>
    </div>
  );
}
