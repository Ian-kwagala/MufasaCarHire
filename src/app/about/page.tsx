import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle2,
  Lock,
  Radio,
  Award,
  FileCheck2,
  MessageCircle,
} from "lucide-react";
import { getSiteSettings } from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { KampalaRouteMap } from "@/components/KampalaRouteMap";
import { formatDisplayPhone, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { getGoogleMapsApiKey } from "@/lib/mapsConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us, Fleet Safety & Uganda PDPA Privacy Policy",
  description:
    "URSB-registered, KCCA-licensed, GPS-tracked Kampala car hire and Entebbe airport transfer provider compliant with Uganda PDPA 2019.",
};

export default function AboutPage() {
  const settings = getSiteSettings();
  const mapsApiKey = getGoogleMapsApiKey();

  const coreValues = [
    {
      title: "01. Reliability",
      desc: "On time, every time—backed by live flight tracking at Entebbe and proactive WhatsApp dispatch updates.",
    },
    {
      title: "02. Transparency",
      desc: "Clear upfront pricing in UGX and USD with zero hidden fees, surprise waiting charges, or unclear fuel terms.",
    },
    {
      title: "03. Safety First",
      desc: "Every company-owned vehicle is comprehensively insured, road-fitness certified, and equipped with active 24/7 GPS tracking.",
    },
    {
      title: "04. Professionalism",
      desc: "Vetted, trained, courteous chauffeurs who understand diplomatic etiquette, corporate schedules, and safe defensive driving.",
    },
  ];

  const complianceItems = [
    {
      icon: Award,
      title: "URSB Registered Business",
      desc: "Legally incorporated with the Uganda Registration Services Bureau for full corporate and NGO contracting.",
    },
    {
      icon: FileCheck2,
      title: "KCCA Licensed & URA Compliant",
      desc: "Operating with valid Kampala Capital City Authority trade licensing and official URA tax documentation for institutional billing.",
    },
    {
      icon: ShieldCheck,
      title: "Comprehensive Insurance & Road Fitness",
      desc: "Commercial passenger vehicle insurance coverage and scheduled preventive maintenance plus Ministry road-fitness inspections.",
    },
    {
      icon: Radio,
      title: "24/7 Active GPS Tracking",
      desc: "Real-time GPS telemetry across owned fleet vehicles for theft prevention, safety monitoring, and rapid roadside assistance.",
    },
  ];

  const serviceZones = [
    {
      zone: "Entebbe Road Corridor",
      areas: "Entebbe International Airport, corridor hotels, embassies, conference venues",
    },
    {
      zone: "Kampala Central & Commercial",
      areas: "CBD, Kikubo Wholesale Market, Owino Market, Ntinda & Nakawa Industrial Area",
    },
    {
      zone: "Diplomatic & Executive",
      areas: "Kololo, Nakasero, Muyenga, Munyonyo, Bugolobi, Bukoto",
    },
    {
      zone: "Greater Kampala Suburbs",
      areas: "Ntinda, Naalya, Kira, Namugongo, Wakiso, Gayaza, Mukono",
    },
    {
      zone: "Nationwide Upcountry Routes",
      areas: "Jinja, Mbarara, Fort Portal, Gulu, Mbale, Kabale, Hoima & safari gateways",
    },
  ];

  const optOutUrl = `https://wa.me/${normalizeWhatsAppNumber(
    settings.primary_whatsapp
  )}?text=${encodeURIComponent(
    "Hello Mufasa Car Hire, I would like to opt out of promotional WhatsApp messages / request a data update under Uganda PDPA 2019."
  )}`;

  return (
    <div>
      {/* Header */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            Not the Cheapest — The Most Trustworthy
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl text-balance">
            About {settings.company_name}, Safety &amp; Privacy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Built in Kampala to deliver punctual, tech-enabled car hire,
            corporate logistics, and vetted moving services across Uganda.
          </p>
        </div>
      </section>

      <TrustBar compact />

      {/* Company Story & Values */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Our Hybrid Model &amp; Mission
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
              {settings.slogan} — Every Journey, Every Load
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {settings.about_story}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Our mission is simple: reliable, affordable, tech-enabled
              transport and logistics powered by exceptional customer service.
              Whether you are landing at Entebbe at midnight, moving a family
              home across Kampala, or coordinating monthly NGO field vehicles,
              our dispatch responds within 30 minutes with clear, accountable
              service.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/fleet" className="btn-gold text-sm">
                Explore Our Fleet
              </Link>
              <Link href="/corporate" className="btn-navy-outline text-sm">
                Corporate &amp; Hotel Accounts
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-6">
            {coreValues.map((val) => (
              <div
                key={val.title}
                className="rounded-2xl border border-slate-200 bg-slate-bg p-5"
              >
                <h3 className="text-base font-extrabold text-navy">
                  {val.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance & Safety Grid */}
      <section className="bg-slate-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Institutional Credibility &amp; Fleet Safety
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
              Licensed, Insured &amp; GPS-Monitored Standards
            </h2>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {complianceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coverage Zones & Kampala Office */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
              Service Coverage Across Uganda
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
              Where We Operate Daily
            </h2>
            <div className="mt-6 space-y-3">
              {serviceZones.map((item) => (
                <div
                  key={item.zone}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-hover" />
                  <div>
                    <h3 className="text-sm font-extrabold text-navy">
                      {item.zone}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-600">{item.areas}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-navy p-6 text-white sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
                Kampala Dispatch Office
              </p>
              <h3 className="mt-2 text-xl font-extrabold">
                Visit or Contact Our Team
              </h3>

              <ul className="mt-6 space-y-4 text-sm text-white/90">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <span>{settings.office_address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-gold" />
                  <div className="flex flex-wrap gap-x-2">
                    <a
                      href={`tel:+${normalizeWhatsAppNumber(
                        settings.primary_whatsapp
                      )}`}
                      className="hover:text-gold"
                    >
                      {formatDisplayPhone(settings.primary_whatsapp)}
                    </a>
                    {settings.secondary_whatsapp && (
                      <>
                        <span>/</span>
                        <a
                          href={`tel:+${normalizeWhatsAppNumber(
                            settings.secondary_whatsapp
                          )}`}
                          className="hover:text-gold"
                        >
                          {formatDisplayPhone(settings.secondary_whatsapp)}
                        </a>
                      </>
                    )}
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-gold" />
                  <a
                    href={`mailto:${settings.official_email}`}
                    className="hover:text-gold"
                  >
                    {settings.official_email}
                  </a>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                {settings.google_maps_url && (
                  <a
                    href={settings.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold text-xs sm:text-sm"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Coverage & Route Map */}
      <div className="border-t border-slate-200 bg-white">
        <KampalaRouteMap
          apiKey={mapsApiKey}
          settings={settings}
          heading="Explore Our Kampala & Uganda Service Coverage"
          subheading="Test routes from our Namugongo Road dispatch hub or Entebbe International Airport to anywhere across Kampala and upcountry Uganda."
        />
      </div>

      {/* Privacy Policy & Marketing Opt-Out (Uganda PDPA 2019) */}
      <section id="privacy" className="border-t border-slate-200 bg-slate-bg py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold-hover">
            <Lock className="h-4 w-4" />
            <span>Legal &amp; Data Protection</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
            Privacy Policy &amp; Marketing Opt-Out (Uganda PDPA 2019)
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {settings.company_name} respects your personal data and operates in
            compliance with the{" "}
            <strong className="text-navy">
              Uganda Data Protection and Privacy Act, 2019
            </strong>
            .
          </p>

          <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700">
            <div>
              <h3 className="font-extrabold text-navy">
                1. Information We Collect
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                When you book a ride, airport transfer, or cargo truck, we
                collect your name, WhatsApp/phone number, optional email, trip
                route, date/time, and flight number. For Day-1 Self-Drive
                rentals, we also verify your valid Driving Permit and National
                ID or Passport at handover strictly for legal compliance and
                insurance verification.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-navy">
                2. How We Use &amp; Protect Your Data
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Your contact and route information is used exclusively to
                confirm bookings, assign your driver or vetted cargo partner,
                issue invoices/receipts, and provide roadside or flight-delay
                support. We never sell or rent customer phone numbers or ID
                records to third-party marketers.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-navy">
                3. Active GPS Safety Notice
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Company-owned vehicles use active GPS tracking exclusively for
                fleet security, theft recovery, and emergency roadside
                assistance during active hire periods.
              </p>
            </div>
            <div>
              <h3 className="font-extrabold text-navy">
                4. Marketing Opt-Out &amp; Data Rights
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Promotional messages (such as launch discounts or Monthly
                Loyalty Rewards) are only sent when you opt in. You may opt out
                or request deletion/correction of your records at any time by
                emailing{" "}
                <a
                  href={`mailto:${settings.official_email}`}
                  className="font-semibold text-navy underline"
                >
                  {settings.official_email}
                </a>{" "}
                or messaging our dispatch team directly.
              </p>
              <a
                href={optOutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-navy-outline mt-4 text-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Opt Out / Data Request via WhatsApp</span>
              </a>
            </div>
            <div>
              <h3 className="font-extrabold text-navy">
                5. Google Maps Platform Integration &amp; End User Terms
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Interactive route previews and pickup address autocomplete on
                this website are powered by Google Maps Platform. By using our
                interactive map and route search tools, you agree to be bound by
                the{" "}
                <a
                  href="https://maps.google.com/help/terms_maps/?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline"
                >
                  Google Maps/Google Earth Additional Terms of Service
                </a>{" "}
                and the{" "}
                <a
                  href="https://policies.google.com/privacy?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline"
                >
                  Google Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
