"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { formatUGX, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { EASE_SMOOTH, FadeInSection } from "./MotionPrimitives";

type FaqCategory = "payment" | "self_drive" | "airport";

interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

const CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: "payment", label: "Payments" },
  { id: "self_drive", label: "Self-Drive" },
  { id: "airport", label: "Airport" },
];

export function HomeFaqSection({ settings }: { settings: SiteSettings }) {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("payment");
  const [openId, setOpenId] = useState<string>("pay-methods");

  const faqs: FaqItem[] = useMemo(
    () => [
      {
        id: "pay-methods",
        category: "payment",
        question: "What payment methods do you accept and when do I pay?",
        answer:
          "We accept MTN Mobile Money (MoMo), Airtel Money, Cash (UGX or USD), Bank Transfer, and monthly invoicing for Corporate/NGO retainers. Payment details are shared on WhatsApp once dispatch confirms your booking within 30 minutes.",
      },
      {
        id: "pay-fuel",
        category: "payment",
        question: "Are fuel and driver fees included in the quoted rate?",
        answer:
          "Chauffeur-driven hires always include a trained Mufasa driver. Daily Kampala hires (UGX 120,000 / day for saloons) confirm fuel terms clearly upfront, while fixed-rate Entebbe Airport transfers cover your full Entebbe ↔ Kampala trip with zero hidden fees.",
      },
      {
        id: "pay-discounts",
        category: "payment",
        question: "How do the launch promo code and Monthly Loyalty Reward work?",
        answer: `Enter code ${settings.promo_code} on any booking form for ${settings.promo_discount_percent}% off (first 50 clients). Clients who book 4+ times in a month automatically earn 1 complimentary half-day saloon hire (UGX 60,000 value).`,
      },
      {
        id: "sd-docs",
        category: "self_drive",
        question: "What documents do I need for Day-1 Self-Drive?",
        answer:
          "Bring a valid Ugandan Class B Driving Permit (or International Driving Permit for visitors) plus your original National ID (Ugandans) or valid Passport with Visa/Entry stamp (visitors).",
      },
      {
        id: "sd-deposit",
        category: "self_drive",
        question: "How much is the security deposit and when is it refunded?",
        answer: `Self-drive starts from ${formatUGX(settings.self_drive_daily_ugx)} / day with a signed agreement and refundable deposit of ${formatUGX(settings.self_drive_deposit_ugx)} via Mobile Money, Cash, or Bank. The deposit is refunded promptly upon vehicle return.`,
      },
      {
        id: "sd-gps",
        category: "self_drive",
        question: "Which vehicles allow self-drive and are they GPS-tracked?",
        answer:
          "Company-owned saloons and 7-seater MPVs support Day-1 self-drive; HiAce vans, Coaster buses, and cargo trucks include a vetted driver. Every owned vehicle is insured and equipped with active 24/7 GPS tracking.",
      },
      {
        id: "air-rate",
        category: "airport",
        question: "How much is an Entebbe Airport transfer and can I pay in USD?",
        answer: `Entebbe International Airport ↔ Kampala transfers are a fixed ${formatUGX(settings.airport_rate_ugx)} ($${settings.airport_rate_usd} USD) for standard saloons, with an instant UGX/USD toggle on the Airport Transfers page.`,
      },
      {
        id: "air-delay",
        category: "airport",
        question: "What happens if my flight into Entebbe is delayed?",
        answer:
          "Include your flight number (e.g., KQ410 or QR1383) when booking. Dispatch tracks your landing live so your driver adjusts automatically and waits at arrivals without stressful waiting surcharges.",
      },
      {
        id: "air-meet",
        category: "airport",
        question: "Do you offer Meet & Greet and larger vehicles for heavy luggage?",
        answer:
          "Yes—select 'Meet & Greet with Name Sign' so your chauffeur greets you outside arrivals. For families or extra bags, easily upgrade to a 7-seater Toyota Wish/Noah, Land Cruiser, or 14-seater HiAce.",
      },
    ],
    [settings]
  );

  const visibleFaqs = useMemo(
    () => faqs.filter((item) => item.category === activeCategory),
    [faqs, activeCategory]
  );

  const waSupportUrl = `https://wa.me/${normalizeWhatsAppNumber(
    settings.primary_whatsapp
  )}?text=${encodeURIComponent(
    "Hello Mufasa Car Hire! I have a quick question before booking."
  )}`;

  return (
    <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <FadeInSection>
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold-hover">
              Quick Answers
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-navy sm:text-3xl">
              Common Questions
            </h2>
          </div>

          {/* Compact 3-Topic Segmented Switcher */}
          <div
            role="tablist"
            aria-label="FAQ topics"
            className="inline-flex rounded-xl border border-slate-200 bg-slate-bg p-1"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const first = faqs.find((f) => f.category === cat.id);
                    if (first) setOpenId(first.id);
                  }}
                  className={`relative rounded-lg px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive ? "text-gold" : "text-slate-600 hover:text-navy"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="faqCategoryTab"
                      transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                      className="absolute inset-0 rounded-lg bg-navy"
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focused 3-Question Accordion */}
        <div className="mt-7 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE_SMOOTH }}
              className="divide-y divide-slate-200"
            >
              {visibleFaqs.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div key={faq.id} className="px-5 py-4 sm:px-6 sm:py-5">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? "" : faq.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <span className="text-sm font-bold text-navy sm:text-base">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-navy transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-gold-hover" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: EASE_SMOOTH }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 pr-6 text-sm leading-relaxed text-slate-600">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quiet Direct Help Line */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-bg px-5 py-4">
          <p className="text-xs font-medium text-slate-600 sm:text-sm">
            Need a custom upcountry or group quote? Dispatch replies in 30 minutes.
          </p>
          <a
            href={waSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold px-4! py-2! text-xs"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Ask on WhatsApp</span>
          </a>
        </div>
      </FadeInSection>
    </section>
  );
}
