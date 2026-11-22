"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { EASE_SMOOTH } from "./MotionPrimitives";

/**
 * Persistent bottom-right WhatsApp contact button with smooth motion entrance
 * and tactile hover scale. Hidden inside the staff /admin dashboard.
 */
export function FloatingWhatsAppButton({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const phone = normalizeWhatsAppNumber(settings.primary_whatsapp);
  const prefilledText = encodeURIComponent(
    "Hello Mufasa Car Hire! I would like to inquire about booking a vehicle."
  );
  const waUrl = `https://wa.me/${phone}?text=${prefilledText}`;

  return (
    <motion.a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mufasa Car Hire on WhatsApp"
      initial={{ opacity: 0, y: 20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.35, ease: EASE_SMOOTH }}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-[#09182E] shadow-lg ring-2 ring-white/90 hover:bg-[#1EBE5D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:bottom-6 sm:right-6 sm:px-5"
    >
      <MessageCircle className="h-5 w-5 shrink-0 fill-[#09182E]/15" />
      <span className="hidden whitespace-nowrap sm:inline">WhatsApp Dispatch</span>
      <span className="whitespace-nowrap sm:hidden">WhatsApp</span>
    </motion.a>
  );
}
