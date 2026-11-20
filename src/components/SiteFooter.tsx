"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, MessageCircle, ExternalLink } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { formatDisplayPhone, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { BrandLogo } from "./BrandLogo";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Positioning */}
          <div>
            <BrandLogo
              logoUrl={settings.logo_url}
              companyName={settings.company_name}
              slogan={settings.slogan}
            />
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Kampala&apos;s most trustworthy, punctual, and professional car hire,
              Entebbe Airport transfer, and moving &amp; cargo partner.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-gold/40 bg-white/5 px-2.5 py-1 text-gold">
                URSB Registered
              </span>
              <span className="rounded-full border border-gold/40 bg-white/5 px-2.5 py-1 text-gold">
                KCCA Licensed
              </span>
              <span className="rounded-full border border-gold/40 bg-white/5 px-2.5 py-1 text-gold">
                GPS-Tracked
              </span>
            </div>
          </div>

          {/* 6-Page Quick Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
              Services &amp; Pages
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home &amp; Quick Calculator
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-gold transition-colors">
                  Fleet &amp; Self-Drive Hire
                </Link>
              </li>
              <li>
                <Link href="/airport-transfers" className="hover:text-gold transition-colors">
                  Entebbe Airport Transfers
                </Link>
              </li>
              <li>
                <Link href="/moving-cargo" className="hover:text-gold transition-colors">
                  Moving &amp; Cargo Logistics
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-gold transition-colors">
                  Corporate, NGO &amp; Hotels
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About, Safety &amp; Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Zones */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
              Coverage Areas
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>Entebbe Airport &amp; Corridor Hotels</li>
              <li>Kampala Central, Kikubo &amp; Owino</li>
              <li>Kololo, Nakasero, Muyenga &amp; Munyonyo</li>
              <li>Ntinda, Naalya, Kira, Wakiso &amp; Namugongo</li>
              <li>Upcountry Routes Nationwide (Uganda)</li>
            </ul>
          </div>

          {/* Office & Direct Contacts */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
              Contact Dispatch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{settings.office_address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`tel:+${normalizeWhatsAppNumber(settings.primary_whatsapp)}`}
                  className="hover:text-gold"
                >
                  {formatDisplayPhone(settings.primary_whatsapp)}
                </a>
                {settings.secondary_whatsapp && (
                  <>
                    <span>/</span>
                    <a
                      href={`tel:+${normalizeWhatsAppNumber(settings.secondary_whatsapp)}`}
                      className="hover:text-gold"
                    >
                      {formatDisplayPhone(settings.secondary_whatsapp)}
                    </a>
                  </>
                )}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a
                  href={`mailto:${settings.official_email}`}
                  className="hover:text-gold"
                >
                  {settings.official_email}
                </a>
              </li>
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${normalizeWhatsAppNumber(settings.primary_whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-xs px-4 py-2!"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Dispatch</span>
              </a>
              {settings.google_maps_url && (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-white/25 px-3 py-2 text-xs font-semibold text-white hover:border-gold hover:text-gold"
                >
                  <span>Directions</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {(settings.facebook_url || settings.instagram_url) && (
              <div className="mt-4 flex items-center gap-3 text-xs text-white/75">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold underline"
                  >
                    Facebook
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold underline"
                  >
                    Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/65 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {settings.company_name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about#privacy" className="hover:text-gold">
              Privacy Policy (Uganda PDPA 2019)
            </Link>
            <Link href="/admin" className="hover:text-gold">
              Staff Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
