import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/db";
import { Fleet3DShowroom } from "@/components/Fleet3DShowroom";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interactive 3D Fleet Showroom | Mufasa Car Hire Kampala",
  description:
    "Inspect Mufasa Car Hire vehicle classes in interactive 360-degree 3D: Executive Saloons, 4x4 Land Cruiser VIP SUVs, and Commercial Cargo & Moving Vans.",
};

export default function Showroom3DPage() {
  const settings = getSiteSettings();
  return <Fleet3DShowroom settings={settings} />;
}
