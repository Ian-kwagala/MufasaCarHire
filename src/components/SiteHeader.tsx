"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, MessageCircle, Shield } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { formatDisplayPhone, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { BrandLogo } from "./BrandLogo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/fleet", label: "Fleet & Car Hire" },
  { href: "/airport-transfers", label: "Entebbe Airport" },
  { href: "/moving-cargo", label: "Moving & Cargo" },
  { href: "/corporate", label: "Corporate & Hotels" },
  { href: "/about", label: "About & Safety" },
];

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Do not show the public site header inside the /admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const waUrl = `https://wa.me/${normalizeWhatsAppNumber(settings.primary_whatsapp)}`;

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Executive Utility Bar */}
      <div className="bg-navy-dark text-xs text-white/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href={`tel:+${normalizeWhatsAppNumber(settings.primary_whatsapp)}`}
              className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-gold" />
              <span>{formatDisplayPhone(settings.primary_whatsapp)}</span>
            </a>
            {settings.secondary_whatsapp && (
              <a
                href={`tel:+${normalizeWhatsAppNumber(settings.secondary_whatsapp)}`}
                className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-gold" />
                <span>{formatDisplayPhone(settings.secondary_whatsapp)}</span>
              </a>
            )}
            <a
              href={`mailto:${settings.official_email}`}
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-gold" />
              <span>{settings.official_email}</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            {settings.promo_banner_active === "true" && (
              <span className="hidden md:inline-flex items-center rounded-full bg-gold/20 px-2.5 py-0.5 font-semibold text-gold">
                {settings.promo_discount_percent}% OFF First 50 Clients — Code:{" "}
                {settings.promo_code}
              </span>
            )}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-white/75 hover:text-gold transition-colors"
            >
              <Shield className="h-3 w-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-navy border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <BrandLogo
              logoUrl={settings.logo_url}
              companyName={settings.company_name}
              slogan={settings.slogan}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white/10 text-gold"
                      : "text-white/90 hover:bg-white/5 hover:text-gold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Primary WhatsApp CTA + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-xs sm:text-sm px-4 py-2!"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Book on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileOpen && (
          <nav className="border-t border-white/10 bg-navy-dark px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      active
                        ? "bg-gold/15 text-gold"
                        : "text-white/90 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
