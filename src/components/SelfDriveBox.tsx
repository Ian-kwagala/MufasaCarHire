import React from "react";
import { CheckCircle2, FileCheck2, CreditCard, ShieldAlert } from "lucide-react";
import { formatUGX } from "@/lib/whatsapp";

interface SelfDriveBoxProps {
  dailyRateUgx: string;
  depositUgx: string;
}

/**
 * Self-Drive Requirements Box required on the Fleet & Booking pages (Page 3 of Brief).
 * Reads live daily rate and refundable security deposit from site settings.
 */
export function SelfDriveBox({ dailyRateUgx, depositUgx }: SelfDriveBoxProps) {
  const items = [
    {
      icon: FileCheck2,
      title: "Valid Driving Permit",
      desc: "Ugandan Class B Driving Permit (or valid International Driving Permit for international visitors).",
    },
    {
      icon: CheckCircle2,
      title: "Original Identification",
      desc: "Original National ID (Ugandans) or valid Passport + Visa / Entry stamp (visitors).",
    },
    {
      icon: CreditCard,
      title: `Refundable Security Deposit (${formatUGX(depositUgx)}) & Agreement`,
      desc: `Self-drive starts from ${formatUGX(dailyRateUgx)} / day on owned vehicles. Signed hire agreement + refundable deposit via MTN MoMo, Airtel Money, Cash, or Bank before handover.`,
    },
    {
      icon: ShieldAlert,
      title: "Active GPS Safety Notice",
      desc: "All company-owned vehicles are fitted with active 24/7 GPS tracking for theft protection and roadside assistance.",
    },
  ];

  return (
    <div className="rounded-2xl border border-navy/15 bg-slate-bg p-6 shadow-xs sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-navy">
            Available From Day 1 on Owned Vehicles
          </span>
          <h3 className="mt-2 text-xl font-extrabold text-navy">
            Self-Drive Requirements Checklist
          </h3>
        </div>
        <div className="rounded-xl bg-navy px-4 py-2 text-right text-white">
          <div className="text-[11px] uppercase tracking-wider text-gold">
            Self-Drive Rate
          </div>
          <div className="text-base font-extrabold">
            From {formatUGX(dailyRateUgx)} / day
          </div>
        </div>
      </div>

      <p className="mb-5 text-sm text-slate-600">
        Please bring the items below before vehicle handover so pickup takes under 10 minutes:
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-navy">{item.title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
