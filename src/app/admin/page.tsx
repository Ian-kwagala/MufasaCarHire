import React from "react";
import { getAdminSession } from "@/lib/auth";
import {
  getBookings,
  getPackages,
  getReviews,
  getSiteSettings,
  getVehicles,
} from "@/lib/db";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const settings = getSiteSettings();
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm settings={settings} />;
  }

  const bookings = getBookings();
  const vehicles = getVehicles({ activeOnly: false });
  const packages = getPackages({ activeOnly: false });
  const reviews = getReviews({ activeOnly: false });

  return (
    <AdminDashboard
      username={session.username}
      initialBookings={bookings}
      initialVehicles={vehicles}
      initialPackages={packages}
      initialReviews={reviews}
      initialSettings={settings}
    />
  );
}
