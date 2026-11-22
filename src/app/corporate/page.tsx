import React, { Suspense } from "react";
import type { Metadata } from "next";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getSiteSettings } from "@/lib/db";
import { TrustBar } from "@/components/TrustBar";
import { CorporateInquiryForm } from "@/components/CorporateInquiryForm";
import { BookingFormSkeleton } from "@/components/Skeletons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate, NGO Car Hire Retainers & Hotel Partnerships",
  description:
    "Monthly corporate & NGO car hire retainers in Kampala with SLA reliability, plus 10% referral commissions for Entebbe & Kampala partner hotels.",
};

export default function CorporatePage() {
  const settings = getSiteSettings();

  const retainerBenefits = [
    {
      icon: FileText,
      title: "Structured Monthly Invoicing",
      desc: "Consolidated monthly statements with URA-compliant receipts, trip logs, and clear cost allocation for NGOs, embassies, and companies.",
    },
    {
      icon: Users,
      title: "Dedicated Driver & Vehicle Allocation",
      desc: "Consistent, vetted, professionally dressed chauffeurs familiar with diplomatic protocols, Kololo/Nakasero offices, and upcountry routes.",
    },
    {
      icon: ShieldCheck,
      title: "SLA Reliability & Backup Fleet",
      desc: "GPS-tracked, comprehensively insured vehicles with immediate replacement vehicles so executive schedules never slip.",
    },
    {
      icon: Briefcase,
      title: "Predictable Retainer Tiers",
      desc: "Monthly retainers starting from UGX 1,500,000 – 2,200,000 / month depending on vehicle class, mileage, and fuel scope.",
    },
  ];

  const hotelPerks = [
    "10% referral commission paid transparently on every confirmed guest booking",
    "Printed, branded concierge rate cards ready for your front desk & bell staff",
    "Fixed UGX 80,000 ($22 USD) Entebbe Airport transfers with live flight tracking",
    "Dedicated Hotel Partner Code tracked in every booking for automatic monthly payouts",
    "Priority 30-minute WhatsApp dispatch for VIP guests, groups, and upcountry tours",
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-navy py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
                B2B Mobility &amp; Concierge Partnerships
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl text-balance">
                Corporate, NGO Retainers &amp; Hotel Partnerships
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/85">
                Partner with Kampala&apos;s most trustworthy transport team. From
                monthly NGO field mobility and executive retainers to 10%
                commission hotel guest transfers, we deliver on-time reliability
                backed by full URSB, KCCA, and URA compliance.
              </p>

              {/* Retainer Rate Highlight */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gold/40 bg-white/5 p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-gold">
                    Corporate / NGO Retainer
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-white tabular-nums">
                    UGX 1.5M – 2.2M / mo
                  </div>
                  <p className="mt-1 text-xs text-white/75">
                    Dedicated saloon or MPV + priority dispatch &amp; monthly invoice
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-gold">
                    Hotel Referral Program
                  </div>
                  <div className="mt-1 text-xl font-extrabold text-white tabular-nums">
                    10% Commission
                  </div>
                  <p className="mt-1 text-xs text-white/75">
                    Per confirmed guest booking · Printed concierge rate cards
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Suspense fallback={<BookingFormSkeleton variant="corporate" />}>
                <CorporateInquiryForm settings={settings} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <TrustBar compact />

      {/* Corporate & NGO Retainer Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">
            For NGOs, Embassies &amp; Companies
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
            Why Operations Teams Choose Mufasa Car Hire
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {retainerBenefits.map((item) => {
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
      </section>

      {/* Hotel Partnership Pitch */}
      <section className="bg-slate-bg py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-gold-hover">
                <Handshake className="h-4 w-4" />
                <span>Hotel &amp; Lodge Concierge Program</span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">
                Turn Guest Transport Requests into Reliable Revenue
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Designed for Kampala &amp; Entebbe hospitality teams—including
                boutique hotels, lodges, and business hotels around Serena,
                Mestil, Protea, DoubleTree, and Munyonyo. Give your guests
                punctual, executive rides while earning a transparent 10%
                referral fee.
              </p>

              <ul className="mt-5 space-y-2.5">
                {hotelPerks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-navy p-6 text-white sm:p-7">
                <Building2 className="h-8 w-8 text-gold" />
                <h3 className="mt-4 text-lg font-extrabold">
                  How Hotel Referral Codes Work
                </h3>
                <ol className="mt-4 space-y-3 text-xs leading-relaxed text-white/85">
                  <li>
                    <strong className="text-gold">1. Get Your Code:</strong> We
                    assign your hotel a unique concierge referral code and
                    deliver printed front-desk rate cards.
                  </li>
                  <li>
                    <strong className="text-gold">
                      2. Book in 60 Seconds:
                    </strong>{" "}
                    Front desk or guests enter your hotel code on any booking
                    form or WhatsApp message.
                  </li>
                  <li>
                    <strong className="text-gold">3. Automatic Tracking:</strong>{" "}
                    Every confirmed booking logs your 10% referral fee in our
                    register for transparent weekly or monthly settlement.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
