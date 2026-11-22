"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Gift,
  GitCompare,
  Luggage,
  Play,
  Star,
  Users,
} from "lucide-react";
import type { PackageItem, Review, SiteSettings, Vehicle } from "@/lib/types";
import { VehicleIllustration } from "./VehicleIllustration";
import { VehicleComparisonModal } from "./VehicleComparisonModal";
import { EASE_SMOOTH, FadeInSection } from "./MotionPrimitives";

type ShowcaseTab = "fleet" | "rates" | "reviews";

const TABS: { id: ShowcaseTab; label: string }[] = [
  { id: "fleet", label: "Featured Fleet" },
  { id: "rates", label: "Transparent Rates" },
  { id: "reviews", label: "Client Reviews" },
];

/**
 * Consolidates Featured Fleet (with hover-to-play video showcase & side-by-side compare),
 * Rates Table, and Reviews into a single calm, animated switcher.
 */
export function HomeShowcaseTabs({
  featuredVehicles,
  totalVehicleCount,
  packages,
  reviews,
  settings,
}: {
  featuredVehicles: Vehicle[];
  totalVehicleCount: number;
  packages: PackageItem[];
  reviews: Review[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("fleet");
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [videoModalVehicles, setVideoModalVehicles] = useState<Vehicle[]>([]);

  const visibleFeatured = featuredVehicles.slice(0, 3);

  function handleAddCompare(vehicle: Vehicle) {
    setVideoModalVehicles((prev) =>
      prev.some((v) => v.id === vehicle.id) || prev.length >= 3
        ? prev
        : [...prev, vehicle]
    );
  }

  function handleRemoveCompare(vehicleId: number) {
    setVideoModalVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
  }

  return (
    <section className="bg-slate-bg py-16">
      <FadeInSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header + 3-Tab Switcher */}
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-gold-hover">
              Explore At Your Pace
            </p>
            <h2 className="mt-1.5 text-2xl font-extrabold text-navy sm:text-3xl">
              Fleet, Rates &amp; Verified Feedback
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Home showcase sections"
            className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
          >
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-lg px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap sm:text-sm ${
                    active ? "text-gold" : "text-slate-600 hover:text-navy"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="homeShowcaseTab"
                      transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                      className="absolute inset-0 rounded-lg bg-navy"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Single-View Panel */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === "fleet" && (
              <motion.div
                key="fleet"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE_SMOOTH }}
              >
                <div className="grid gap-6 md:grid-cols-3">
                  {visibleFeatured.map((vehicle, index) => {
                    const isHovered = hoveredCardId === vehicle.id;
                    return (
                      <motion.article
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ y: -6 }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.07,
                          ease: EASE_SMOOTH,
                        }}
                        onMouseEnter={() => setHoveredCardId(vehicle.id)}
                        onMouseLeave={() =>
                          setHoveredCardId((curr) =>
                            curr === vehicle.id ? null : curr
                          )
                        }
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-300 hover:border-gold/70 hover:shadow-xl hover:shadow-navy/10"
                      >
                        {/* Top Gold Hover Accent Bar */}
                        <motion.div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.5 bg-gold origin-left"
                          initial={false}
                          animate={{
                            scaleX: isHovered ? 1 : 0,
                            opacity: isHovered ? 1 : 0,
                          }}
                          transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                        />

                        <div>
                          <VehicleIllustration
                            imageUrl={vehicle.image_url}
                            videoUrl={vehicle.video_url}
                            name={vehicle.name}
                            category={vehicle.category}
                            isHovered={isHovered}
                            onOpenVideo={() => setVideoModalVehicles([vehicle])}
                          />

                          <div className="p-5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <span className="text-navy font-bold">
                                {vehicle.fleet_type}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {vehicle.drive_option === "DRIVER_OR_SELF"
                                  ? "Driver or Self-Drive"
                                  : "Driver Included"}
                              </span>
                            </div>

                            <h3 className="mt-2 text-lg font-extrabold text-navy">
                              {vehicle.name}
                            </h3>

                            <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1">
                                <Users className="h-3.5 w-3.5 text-gold-hover" />
                                {vehicle.seats}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Luggage className="h-3.5 w-3.5 text-gold-hover" />
                                {vehicle.luggage}
                              </span>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setVideoModalVehicles([vehicle])}
                                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-bg px-3 py-1.5 text-xs font-bold text-navy transition-colors hover:border-navy/40 hover:bg-white whitespace-nowrap"
                              >
                                <Play className="h-3 w-3 text-gold-hover fill-gold-hover" />
                                <span>Watch Video</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                          <span className="text-sm font-extrabold text-navy tabular-nums">
                            {vehicle.price_display}
                          </span>
                          <Link
                            href={`/fleet?vehicle=${vehicle.id}`}
                            className="btn-gold px-4! py-1.5! text-xs"
                          >
                            {vehicle.is_quote_only ? "Get Quote" : "Book"}
                          </Link>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  {visibleFeatured.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setVideoModalVehicles(visibleFeatured)}
                      className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold-soft px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-gold hover:text-navy"
                    >
                      <GitCompare className="h-4 w-4" />
                      <span>Compare Top {visibleFeatured.length} Videos Side-by-Side</span>
                    </button>
                  )}

                  <Link href="/fleet" className="btn-navy-outline text-sm">
                    <span>Explore All {totalVehicleCount} Vehicles</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )}

            {activeTab === "rates" && (
              <motion.div
                key="rates"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE_SMOOTH }}
                className="space-y-4"
              >
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-navy text-white">
                        <tr>
                          <th className="px-5 py-3.5 font-bold">Service</th>
                          <th className="px-5 py-3.5 font-bold">Rate</th>
                          <th className="px-5 py-3.5 font-bold">Key Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {packages.map((pkg) => (
                          <tr key={pkg.id} className="hover:bg-slate-50">
                            <td className="px-5 py-3.5 font-bold text-navy">
                              {pkg.name}
                            </td>
                            <td className="px-5 py-3.5 font-extrabold text-gold-hover whitespace-nowrap tabular-nums">
                              {pkg.price_display}
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">
                              {pkg.details}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-gold/35 bg-gold-soft px-4 py-3 text-xs font-semibold text-navy">
                  <Gift className="h-4 w-4 shrink-0 text-gold-hover" />
                  <span>{settings.loyalty_banner_text}</span>
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE_SMOOTH }}
                className="grid gap-6 md:grid-cols-3"
              >
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div>
                      <div className="flex gap-1 text-gold">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-gold" />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-slate-700">
                        &ldquo;{r.quote}&rdquo;
                      </p>
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-3">
                      <div className="text-sm font-extrabold text-navy">
                        {r.client_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.client_role}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeInSection>

      {/* Video Walkaround & Side-by-Side Comparison Modal */}
      <VehicleComparisonModal
        vehicles={videoModalVehicles}
        allVehicles={featuredVehicles}
        onClose={() => setVideoModalVehicles([])}
        onAddCompare={handleAddCompare}
        onRemoveCompare={handleRemoveCompare}
        onBookVehicle={(vehicle) => router.push(`/fleet?vehicle=${vehicle.id}`)}
      />
    </section>
  );
}
