import type { Metadata } from "next";
import "./globals.css";
import { getSiteSettings } from "@/lib/db";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mufasa Car Hire | Travel Like a KING — Kampala, Entebbe & Uganda",
  description:
    "Kampala's most trustworthy car hire, Entebbe Airport transfers (UGX 80,000), corporate logistics, and moving & cargo services. GPS-tracked, insured, and 30-min WhatsApp response.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSiteSettings();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-navy antialiased">
        <SiteHeader settings={settings} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
