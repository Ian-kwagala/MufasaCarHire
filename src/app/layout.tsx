import type { Metadata } from "next";
import "./globals.css";
import { getReviews, getSiteSettings, getVehicles } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { MotionProvider } from "@/components/MotionPrimitives";
import { GmpQuotaBanner } from "@/components/GmpQuotaBanner";
import { getSiteBaseUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE_URL = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mufasa Car Hire | Kampala Car Hire & Entebbe Airport Transfers",
    template: "%s | Mufasa Car Hire Kampala",
  },
  description:
    "Trusted Kampala car hire, fixed-rate Entebbe airport transfers (UGX 80,000), Day-1 self-drive rentals, corporate retainers, and moving vans across Uganda.",
  keywords: [
    "Kampala car hire",
    "Entebbe airport transfers",
    "self drive car hire Kampala",
    "car rental Uganda",
    "Kampala moving vans",
    "corporate car hire Kampala",
  ],
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: SITE_URL,
    siteName: "Mufasa Car Hire",
    title: "Mufasa Car Hire | Kampala Car Hire & Entebbe Airport Transfers",
    description:
      "GPS-tracked, insured Kampala car hire, fixed UGX 80,000 Entebbe airport transfers with live flight tracking, and moving logistics. 30-min WhatsApp confirmation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mufasa Car Hire | Kampala Car Hire & Entebbe Airport Transfers",
    description:
      "Kampala's most trustworthy car hire, Entebbe airport transfers, Day-1 self-drive, and moving vans across Uganda.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSiteSettings();
  const vehicles = getVehicles({ activeOnly: true });
  const reviews = getReviews({ activeOnly: true });

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-navy antialiased">
        <LocalBusinessJsonLd
          settings={settings}
          vehicles={vehicles}
          reviews={reviews}
        />
        <MotionProvider>
          <GmpQuotaBanner />
          <SiteHeader settings={settings} />
          <main className="flex-1">{children}</main>
          <SiteFooter settings={settings} />
          <FloatingWhatsAppButton settings={settings} />
        </MotionProvider>
      </body>
    </html>
  );
}
