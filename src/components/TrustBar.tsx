import React from "react";
import {
  Clock,
  ShieldCheck,
  Tag,
  CarFront,
  BadgeCheck,
} from "lucide-react";

const TRUST_PROMISES = [
  { icon: Clock, title: "30-Min WhatsApp Reply" },
  { icon: ShieldCheck, title: "GPS-Tracked & Insured" },
  { icon: Tag, title: "Upfront Pricing" },
  { icon: CarFront, title: "Driver or Self-Drive" },
  { icon: BadgeCheck, title: "URSB & KCCA Licensed" },
];

/**
 * Quiet, uncluttered horizontal trust ribbon showing the 5 core Mufasa Car Hire promises.
 */
export function TrustBar({ compact = false }: { compact?: boolean }) {
  return (
    <section
      aria-label="Mufasa Car Hire Trust Promises"
      className={`border-b border-slate-200 bg-white ${
        compact ? "py-3" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs font-semibold text-navy sm:justify-between">
          {TRUST_PROMISES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4 shrink-0 text-gold-hover" />
                <span>{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
