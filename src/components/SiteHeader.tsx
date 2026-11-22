"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Box,
  Briefcase,
  ChevronDown,
  Menu,
  MessageCircle,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { BrandLogo } from "./BrandLogo";
import { EASE_SMOOTH } from "./MotionPrimitives";

const PRIMARY_LINKS = [
  { href: "/fleet", label: "Fleet" },
  { href: "/airport-transfers", label: "Airport" },
];

const SERVICES_DROPDOWN_LINKS = [
  {
    href: "/showroom-3d",
    label: "3D Fleet Showroom",
    desc: "Interactive 360° Three.js vehicle inspector",
    icon: Box,
  },
  {
    href: "/moving-cargo",
    label: "Moving & Cargo",
    desc: "1–5 tonne vans & Fuso trucks",
    icon: Truck,
  },
  {
    href: "/corporate",
    label: "Corporate & Hotels",
    desc: "Monthly retainers & 10% hotel referrals",
    icon: Briefcase,
  },
  {
    href: "/about",
    label: "About & Safety",
    desc: "URSB/KCCA compliance, GPS & privacy",
    icon: ShieldCheck,
  },
];

function buildQuickQuoteMessage(pathname: string): string {
  if (pathname.startsWith("/airport-transfers")) {
    return "Hello Mufasa Car Hire! I would like a quick quote for an Entebbe Airport transfer. Pickup/Drop-off:";
  }
  if (pathname.startsWith("/moving-cargo")) {
    return "Hello Mufasa Car Hire! I would like a quick quote for a moving van or cargo truck in Kampala.";
  }
  if (pathname.startsWith("/corporate")) {
    return "Hello Mufasa Car Hire! I would like a quick quote for corporate car hire or hotel partner transfers.";
  }
  if (pathname.startsWith("/fleet") || pathname.startsWith("/showroom-3d")) {
    return "Hello Mufasa Car Hire! I am browsing your fleet and would like a quick booking quote.";
  }
  return "Hello Mufasa Car Hire! I would like a quick quote to book a vehicle in Kampala.";
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDropdownRouteActive = SERVICES_DROPDOWN_LINKS.some(
    (item) => pathname === item.href
  );

  // Close dropdown on outside click or Escape key & track scroll depth for floating quote button
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    }
    function handleScroll() {
      setScrolled(window.scrollY > 16);
    }
    handleScroll();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const quickQuoteWaUrl = `https://wa.me/${normalizeWhatsAppNumber(
    settings.primary_whatsapp
  )}?text=${encodeURIComponent(buildQuickQuoteMessage(pathname))}`;

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 transition-shadow duration-200 ${
        scrolled
          ? "bg-navy/98 shadow-lg shadow-navy/30"
          : "bg-navy/95"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (links Home) */}
        <Link
          href="/"
          onClick={() => {
            setMobileOpen(false);
            setDropdownOpen(false);
          }}
          className="shrink-0 whitespace-nowrap"
        >
          <BrandLogo
            logoUrl={settings.logo_url}
            companyName={settings.company_name}
            slogan={settings.slogan}
          />
        </Link>

        {/* Zone 2: Simplified 3-Item Desktop Navigation (Fleet · Airport · Services & Info) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7"
        >
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDropdownOpen(false)}
                className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active ? "text-gold" : "text-white/85 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="activeHeaderLink"
                    transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gold"
                  />
                )}
              </Link>
            );
          })}

          {/* Consolidated "Services & Info" Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`relative inline-flex items-center gap-1.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isDropdownRouteActive || dropdownOpen
                  ? "text-gold"
                  : "text-white/85 hover:text-white"
              }`}
            >
              <span>Services &amp; Info</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
              {isDropdownRouteActive && (
                <motion.span
                  layoutId="activeHeaderLink"
                  transition={{ duration: 0.25, ease: EASE_SMOOTH }}
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gold"
                />
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE_SMOOTH }}
                  className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-navy shadow-xl"
                >
                  {SERVICES_DROPDOWN_LINKS.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        role="menuitem"
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                          active
                            ? "bg-gold-soft text-navy"
                            : "hover:bg-slate-bg text-navy"
                        }`}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-navy">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Zone 3: Floating "Get Quick Quote" WhatsApp CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.a
            href={quickQuoteWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            aria-label="Get Quick Quote on WhatsApp"
            className={`btn-gold px-4! py-2! text-xs sm:text-sm whitespace-nowrap shrink-0 ring-1 ring-white/25 transition-shadow ${
              scrolled
                ? "shadow-[0_8px_24px_rgba(197,155,59,0.5)]"
                : "shadow-[0_4px_16px_rgba(197,155,59,0.35)]"
            }`}
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Get Quick Quote</span>
          </motion.a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_SMOOTH }}
            className="overflow-hidden border-t border-white/10 bg-navy-dark md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {[
                { href: "/", label: "Home" },
                ...PRIMARY_LINKS,
              ].map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                      active
                        ? "bg-gold/15 text-gold"
                        : "text-white/90 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-2 border-t border-white/10 pt-2">
                <p className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold/80">
                  Services &amp; Info
                </p>
                {SERVICES_DROPDOWN_LINKS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                        active
                          ? "bg-gold/15 text-gold"
                          : "text-white/85 hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/65 hover:bg-white/5 hover:text-gold"
                >
                  Staff Admin Portal
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
