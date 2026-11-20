import React from "react";
import {
  Clock,
  ShieldCheck,
  Tag,
  CarFront,
  BadgeCheck,
} from "lucide-react";

const TRUST_PROMISES = [
  {
    icon: Clock,
    title: "30-Min WhatsApp Reply",
    subtitle: "Fast confirmation guarantee",
  },
  {
    icon: ShieldCheck,
    title: "GPS-Tracked & Insured",
    subtitle: "Road-fit & covered fleet",
  },
  {
    icon: Tag,
    title: "Upfront Pricing",
    subtitle: "Zero hidden fees",
  },
  {
    icon: CarFront,
    title: "Driver OR Self-Drive",
    subtitle: "Flexible Day-1 options",
  },
  {
    icon: BadgeCheck,
    title: "URSB & KCCA Licensed",
    subtitle: "Registered & compliant",
  },
];

/**
 * Displays the 5 Key Trust Promises required on every page of the website.
 */
export function TrustBar({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Mufasa Car Hire Trust Promises"
      className={`border-y border-gold/30 bg-gold-soft ${
        compact ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_PROMISES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2 shadow-xs border border-gold/20"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-gold">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-navy sm:text-sm">
                    {item.title}
                  </p>
                  {!compact && (
                    <p className="truncate text-[11px] text-slate-600">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
