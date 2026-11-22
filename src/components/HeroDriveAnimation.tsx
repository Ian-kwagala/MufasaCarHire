"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import { formatUGX } from "@/lib/whatsapp";

type VehicleMode = "saloon" | "suv" | "cargo";

interface ModeConfig {
  id: VehicleMode;
  label: string;
  route: string;
  badge: string;
  caption: string;
}

/**
 * Creative animated driving showcase depicting Mufasa Car Hire gliding across
 * the Entebbe–Kampala Expressway with rotating wheels, warm headlight beams,
 * parallax Kampala hills/skyline, and interactive vehicle switching.
 */
export function HeroDriveAnimation({
  airportRateUgx,
}: {
  airportRateUgx: string;
}) {
  const modes: ModeConfig[] = [
    {
      id: "saloon",
      label: "Airport & City",
      route: "Entebbe EBB → Kololo",
      badge: `Fixed ${formatUGX(airportRateUgx)}`,
      caption: "Toyota Premio / Fielder · Chauffeur or Self-Drive",
    },
    {
      id: "suv",
      label: "VIP 4x4 SUV",
      route: "Kampala → Upcountry",
      badge: "Executive & NGO",
      caption: "Toyota Land Cruiser · GPS-Tracked & Insured",
    },
    {
      id: "cargo",
      label: "Moving Van",
      route: "Kikubo → Ntinda",
      badge: "1–5 Tonne Fleet",
      caption: "Vetted Partner Vans & Fuso Canter · Driver Included",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const current = modes[activeIndex];

  // Gently cycle through the 3 fleet modes so visitors see the company's full mobility story
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modes.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [modes.length]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-navy-dark/90 p-5 shadow-2xl sm:p-6">
      {/* Subtle Top Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="inline-flex items-center gap-1.5 font-semibold text-white/90">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          <span>{current.route}</span>
        </div>
        <span className="font-bold text-gold tabular-nums">{current.badge}</span>
      </div>

      {/* Scenic Animated Road Viewport */}
      <div className="relative mt-4 h-48 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#09182E] via-[#0E2444] to-[#132E56] sm:h-56">
        {/* Soft Golden Moon / Horizon Glow */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.22, 0.36, 0.22], scale: [1, 1.06, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-10 right-10 h-36 w-36 rounded-full bg-gold/30 blur-2xl"
        />

        {/* Layer 1: Slow Parallax Kampala Hills & Skyline Silhouette */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-12 flex w-[200%]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1].map((copy) => (
            <svg
              key={copy}
              viewBox="0 0 600 90"
              className="h-20 w-1/2 shrink-0 text-white/[0.07]"
              preserveAspectRatio="none"
            >
              {/* Soft Kampala hills */}
              <path
                d="M0 90 Q80 42 170 65 T340 52 T510 66 T600 48 L600 90 Z"
                fill="currentColor"
              />
              {/* Minimalist city towers & acacia trees */}
              <rect x="115" y="42" width="16" height="48" fill="currentColor" />
              <rect x="136" y="30" width="22" height="60" fill="currentColor" />
              <rect x="163" y="48" width="14" height="42" fill="currentColor" />
              <rect x="380" y="38" width="18" height="52" fill="currentColor" />
              <rect x="404" y="24" width="24" height="66" fill="currentColor" />
              <rect x="434" y="44" width="15" height="46" fill="currentColor" />
            </svg>
          ))}
        </motion.div>

        {/* Subtle Wind / Speed Lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { top: "24%", width: "54px", delay: 0, duration: 1.8 },
            { top: "38%", width: "36px", delay: 0.7, duration: 1.5 },
            { top: "52%", width: "44px", delay: 1.2, duration: 1.9 },
          ].map((line, i) => (
            <motion.div
              key={i}
              style={{ top: line.top, width: line.width }}
              className="absolute right-0 h-[1.5px] rounded-full bg-gradient-to-l from-transparent via-gold/40 to-transparent"
              initial={{ x: "120%", opacity: 0 }}
              animate={{ x: "-650%", opacity: [0, 0.7, 0] }}
              transition={{
                duration: line.duration,
                delay: line.delay,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Asphalt Road Surface */}
        <div className="absolute inset-x-0 bottom-0 h-14 border-t border-gold/25 bg-[#081529]">
          {/* Animated Dashed Golden Highway Lane Markers */}
          <motion.div
            aria-hidden="true"
            className="mt-6 flex w-[200%] items-center gap-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          >
            {Array.from({ length: 24 }).map((_, idx) => (
              <span
                key={idx}
                className="h-1 w-10 shrink-0 rounded-full bg-gold/65"
              />
            ))}
          </motion.div>
        </div>

        {/* Moving Vehicle Stage */}
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ x: -160, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 220, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Soft Suspension Glide */}
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                {/* Headlight Beam Cone */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 bottom-3 h-10 w-28 rounded-r-full bg-gradient-to-r from-gold/45 via-gold/15 to-transparent blur-sm"
                />

                {/* Ground Shadow */}
                <div
                  aria-hidden="true"
                  className="mx-auto -mb-2 h-2.5 w-52 rounded-full bg-black/50 blur-xs"
                />

                <AnimatedVehicleSvg mode={current.id} />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Vehicle Mode Switcher + Animated Progress */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/75">{current.caption}</p>
        <div className="flex items-center gap-1.5">
          {modes.map((m, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap ${
                  active
                    ? "bg-gold text-navy"
                    : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnimatedVehicleSvg({ mode }: { mode: VehicleMode }) {
  // Wheel coordinates differ slightly per body silhouette
  const wheels =
    mode === "cargo"
      ? [
          { cx: 56, cy: 74 },
          { cx: 196, cy: 74 },
        ]
      : [
          { cx: 62, cy: 74 },
          { cx: 190, cy: 74 },
        ];

  return (
    <svg
      viewBox="0 0 256 92"
      className="h-24 w-64 sm:h-28 sm:w-72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Animated Mufasa Car Hire ${mode}`}
    >
      {mode === "saloon" && (
        <g>
          {/* Sleek Executive Saloon Body */}
          <path
            d="M22 66 L26 50 C30 44 46 42 62 40 L92 22 C100 18 112 17 148 17 C166 17 178 24 196 39 L226 44 C236 46 240 53 240 62 L238 69 H22 Z"
            fill="#FFFFFF"
          />
          {/* Gold Executive Trim Line */}
          <path
            d="M28 56 H232"
            stroke="#C59B3B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Tinted Cabin Windows */}
          <path
            d="M72 40 L96 24 H146 C158 24 168 29 182 40 H72 Z"
            fill="#0E2444"
          />
          <line
            x1="128"
            y1="24"
            x2="128"
            y2="40"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          {/* Headlight & Taillight */}
          <rect x="228" y="48" width="10" height="5" rx="2.5" fill="#FDE68A" />
          <rect x="23" y="49" width="7" height="5" rx="2" fill="#EF4444" />
        </g>
      )}

      {mode === "suv" && (
        <g>
          {/* Executive 4x4 Land Cruiser Silhouette */}
          <path
            d="M24 68 L26 30 C27 20 35 15 48 15 H156 C168 15 178 22 190 36 L226 40 C235 42 240 49 240 58 V68 H24 Z"
            fill="#FFFFFF"
          />
          {/* Roof Rack Accent */}
          <line
            x1="46"
            y1="12"
            x2="150"
            y2="12"
            stroke="#C59B3B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Gold Side Belt */}
          <path
            d="M28 54 H234"
            stroke="#C59B3B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Panoramic SUV Windows */}
          <path
            d="M38 38 V23 H152 C161 23 169 28 179 38 H38 Z"
            fill="#0E2444"
          />
          <line
            x1="88"
            y1="23"
            x2="88"
            y2="38"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <line
            x1="136"
            y1="23"
            x2="136"
            y2="38"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          {/* Headlight & Taillight */}
          <rect x="229" y="44" width="9" height="6" rx="2" fill="#FDE68A" />
          <rect x="24" y="44" width="6" height="8" rx="2" fill="#EF4444" />
        </g>
      )}

      {mode === "cargo" && (
        <g>
          {/* Box Cargo Container */}
          <rect
            x="22"
            y="14"
            width="142"
            height="54"
            rx="6"
            fill="#FFFFFF"
          />
          {/* Gold Brand Stripe on Cargo Box */}
          <rect x="22" y="45" width="142" height="7" fill="#C59B3B" />
          {/* Truck Cab */}
          <path
            d="M168 68 V24 H206 C214 24 222 30 228 42 L238 48 V68 H168 Z"
            fill="#F8FAFC"
          />
          {/* Cab Windshield */}
          <path d="M180 29 H205 L218 44 H180 V29 Z" fill="#0E2444" />
          {/* Headlight & Taillight */}
          <rect x="229" y="52" width="8" height="6" rx="2" fill="#FDE68A" />
          <rect x="22" y="54" width="5" height="7" rx="1.5" fill="#EF4444" />
        </g>
      )}

      {/* Rotating Wheels */}
      {wheels.map((w, idx) => (
        <g key={idx}>
          {/* Wheel Arch Cutout */}
          <circle cx={w.cx} cy={w.cy} r="17" fill="#081529" />
          <motion.g
            style={{ transformOrigin: `${w.cx}px ${w.cy}px` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
          >
            {/* Tire */}
            <circle
              cx={w.cx}
              cy={w.cy}
              r="14"
              fill="#1E293B"
              stroke="#0F172A"
              strokeWidth="2.5"
            />
            {/* Alloy Rim */}
            <circle cx={w.cx} cy={w.cy} r="7.5" fill="#C59B3B" />
            {/* Spokes so rotation is visibly crisp */}
            <line
              x1={w.cx - 7}
              y1={w.cy}
              x2={w.cx + 7}
              y2={w.cy}
              stroke="#0E2444"
              strokeWidth="2"
            />
            <line
              x1={w.cx}
              y1={w.cy - 7}
              x2={w.cx}
              y2={w.cy + 7}
              stroke="#0E2444"
              strokeWidth="2"
            />
            <circle cx={w.cx} cy={w.cy} r="2.5" fill="#FFFFFF" />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}

/**
 * Slim minimalist highway strip where a subtle golden car glides smoothly across,
 * reinforcing the brand's motion identity between page sections without adding clutter.
 */
export function RoadDividerAnimation() {
  return (
    <div
      aria-hidden="true"
      className="relative h-8 w-full overflow-hidden border-y border-slate-200/80 bg-slate-bg"
    >
      <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-gold/50" />
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        initial={{ x: "-60px" }}
        animate={{ x: "105vw" }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 64 24" className="h-5 w-14" fill="none">
          <path
            d="M6 17 L9 10 L21 5 H42 L51 11 L59 13 V17 H6 Z"
            fill="#0E2444"
          />
          <path d="M22 7 H40 L47 11 H18 L22 7 Z" fill="#C59B3B" />
          <circle cx="17" cy="18" r="3.5" fill="#C59B3B" />
          <circle cx="48" cy="18" r="3.5" fill="#C59B3B" />
        </svg>
      </motion.div>
    </div>
  );
}
