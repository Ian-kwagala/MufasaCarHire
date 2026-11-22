"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarCheck2,
  Car,
  CheckCircle2,
  Download,
  ExternalLink,
  KeyRound,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type {
  Booking,
  BookingStatus,
  DriveOptionType,
  FleetFilterGroup,
  PackageItem,
  Review,
  SiteSettings,
  Vehicle,
} from "@/lib/types";
import { buildAdminReplyWhatsAppUrl, formatUGX } from "@/lib/whatsapp";
import { BrandLogo } from "@/components/BrandLogo";

type AdminTab = "bookings" | "fleet" | "packages" | "reviews" | "settings";

const BOOKING_STATUSES: BookingStatus[] = [
  "New",
  "Quoted",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const STATUS_STYLE: Record<BookingStatus, string> = {
  New: "text-amber-700 bg-amber-50 border-amber-200",
  Quoted: "text-sky-700 bg-sky-50 border-sky-200",
  Confirmed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "In Progress": "text-indigo-700 bg-indigo-50 border-indigo-200",
  Completed: "text-slate-700 bg-slate-100 border-slate-200",
  Cancelled: "text-red-700 bg-red-50 border-red-200",
};

interface AdminDashboardProps {
  username: string;
  initialBookings: Booking[];
  initialVehicles: Vehicle[];
  initialPackages: PackageItem[];
  initialReviews: Review[];
  initialSettings: SiteSettings;
}

export function AdminDashboard({
  username,
  initialBookings,
  initialVehicles,
  initialPackages,
  initialReviews,
  initialSettings,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings");
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // Live collections
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  // Bookings filters & edit modal
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("All");
  const [bookingServiceFilter, setBookingServiceFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [savingBooking, setSavingBooking] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Vehicle editor modal
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle> | null>(
    null
  );
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Package editor modal
  const [editingPackage, setEditingPackage] =
    useState<Partial<PackageItem> | null>(null);
  const [savingPackage, setSavingPackage] = useState(false);

  // Review editor modal
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(
    null
  );
  const [savingReview, setSavingReview] = useState(false);

  // Settings & Password state
  const [savingSettings, setSavingSettings] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  function showToast(type: "ok" | "err", text: string) {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 3500);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  // ============================================================================
  // Bookings Actions
  // ============================================================================
  async function refreshBookings() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } finally {
      setRefreshing(false);
    }
  }

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    return bookings.filter((b) => {
      if (bookingStatusFilter !== "All" && b.status !== bookingStatusFilter) {
        return false;
      }
      if (
        bookingServiceFilter !== "All" &&
        b.service_type !== bookingServiceFilter
      ) {
        return false;
      }
      if (q) {
        const hay = [
          b.job_id,
          b.client_name,
          b.client_phone,
          b.vehicle_name,
          b.pickup_location,
          b.dropoff_location,
          b.promo_or_hotel_code,
          b.company_hotel_name,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingServiceFilter]);

  const bookingStats = useMemo(() => {
    const newCount = bookings.filter((b) => b.status === "New").length;
    const activeCount = bookings.filter(
      (b) => b.status === "Confirmed" || b.status === "In Progress"
    ).length;
    const totalRevenue = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((acc, b) => acc + (Number(b.client_total_ugx) || 0), 0);
    const totalNet = bookings
      .filter((b) => b.status !== "Cancelled")
      .reduce((acc, b) => acc + (Number(b.mufasa_net_ugx) || 0), 0);
    return { total: bookings.length, newCount, activeCount, totalRevenue, totalNet };
  }, [bookings]);

  async function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBooking) return;
    setSavingBooking(true);
    try {
      const res = await fetch(`/api/bookings/${editingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editingBooking.status,
          vehicle_source: editingBooking.vehicle_source,
          vehicle_name: editingBooking.vehicle_name,
          drive_mode: editingBooking.drive_mode,
          payment_method: editingBooking.payment_method,
          client_total_ugx: Number(editingBooking.client_total_ugx) || 0,
          driver_commission_ugx:
            Number(editingBooking.driver_commission_ugx) || 0,
          partner_payout_ugx: Number(editingBooking.partner_payout_ugx) || 0,
          hotel_fee_ugx: Number(editingBooking.hotel_fee_ugx) || 0,
          admin_notes: editingBooking.admin_notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to update booking.");
        return;
      }
      setBookings((prev) =>
        prev.map((b) => (b.id === data.booking.id ? data.booking : b))
      );
      setEditingBooking(null);
      showToast("ok", `Updated ${data.booking.job_id}.`);
    } finally {
      setSavingBooking(false);
    }
  }

  async function handleDeleteBooking(id: number) {
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      setConfirmDeleteId(null);
      showToast("ok", "Booking deleted.");
    } else {
      showToast("err", "Could not delete booking.");
    }
  }

  // ============================================================================
  // File Upload Helper (Vehicle Photos & Brand Logo)
  // ============================================================================
  async function uploadAsset(file: File, kind: string): Promise<string | null> {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Upload failed.");
        return null;
      }
      showToast("ok", "Image uploaded.");
      return data.url as string;
    } catch {
      showToast("err", "Upload failed.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  // ============================================================================
  // Fleet Actions
  // ============================================================================
  async function handleSaveVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVehicle) return;
    setSavingVehicle(true);
    try {
      const isEdit = Boolean(editingVehicle.id);
      const url = isEdit
        ? `/api/vehicles/${editingVehicle.id}`
        : "/api/vehicles";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVehicle),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to save vehicle.");
        return;
      }
      if (isEdit) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === data.vehicle.id ? data.vehicle : v))
        );
      } else {
        setVehicles((prev) => [...prev, data.vehicle]);
      }
      setEditingVehicle(null);
      showToast("ok", "Vehicle saved.");
    } finally {
      setSavingVehicle(false);
    }
  }

  async function handleDeleteVehicle(id: number) {
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setConfirmDeleteId(null);
      showToast("ok", "Vehicle deleted.");
    }
  }

  // ============================================================================
  // Packages Actions
  // ============================================================================
  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPackage) return;
    setSavingPackage(true);
    try {
      const isEdit = Boolean(editingPackage.id);
      const url = isEdit
        ? `/api/packages/${editingPackage.id}`
        : "/api/packages";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPackage),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to save package.");
        return;
      }
      if (isEdit) {
        setPackages((prev) =>
          prev.map((p) => (p.id === data.package.id ? data.package : p))
        );
      } else {
        setPackages((prev) => [...prev, data.package]);
      }
      setEditingPackage(null);
      showToast("ok", "Pricing package saved.");
    } finally {
      setSavingPackage(false);
    }
  }

  async function handleDeletePackage(id: number) {
    const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
      showToast("ok", "Package deleted.");
    }
  }

  // ============================================================================
  // Reviews Actions
  // ============================================================================
  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReview) return;
    setSavingReview(true);
    try {
      const isEdit = Boolean(editingReview.id);
      const url = isEdit ? `/api/reviews/${editingReview.id}` : "/api/reviews";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingReview),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to save review.");
        return;
      }
      if (isEdit) {
        setReviews((prev) =>
          prev.map((r) => (r.id === data.review.id ? data.review : r))
        );
      } else {
        setReviews((prev) => [data.review, ...prev]);
      }
      setEditingReview(null);
      showToast("ok", "Review saved.");
    } finally {
      setSavingReview(false);
    }
  }

  async function handleDeleteReview(id: number) {
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setConfirmDeleteId(null);
      showToast("ok", "Review deleted.");
    }
  }

  // ============================================================================
  // Settings & Password Actions
  // ============================================================================
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Failed to save settings.");
        return;
      }
      setSettings(data.settings);
      showToast("ok", "Site settings saved and live.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error || "Could not update password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      showToast("ok", "Admin password updated.");
    } finally {
      setSavingPassword(false);
    }
  }

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "bookings", label: "Bookings Register", icon: CalendarCheck2, count: bookingStats.newCount },
    { id: "fleet", label: "Fleet Catalog", icon: Car, count: vehicles.length },
    { id: "packages", label: "Pricing Table", icon: Package, count: packages.length },
    { id: "reviews", label: "Client Reviews", icon: Star, count: reviews.length },
    { id: "settings", label: "Site Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-bg text-navy lg:flex">
      {/* Left Sidebar Navigation */}
      <aside className="border-b border-white/10 bg-navy text-white lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <BrandLogo
            logoUrl={settings.logo_url}
            companyName={settings.company_name}
            slogan="Admin Portal"
          />
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-gold text-navy"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.count !== undefined && (
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      active ? "text-navy" : "text-gold"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/85 hover:border-gold hover:text-gold"
          >
            <span>View Public Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600/80"
          >
            <span>Sign Out ({username})</span>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0">
        {/* Top Context Header */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3.5">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Admin / {navItems.find((n) => n.id === activeTab)?.label}
            </div>
            <h1 className="text-lg font-extrabold text-navy">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {toast && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                  toast.type === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {toast.text}
              </span>
            )}
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-navy hover:bg-slate-50 lg:hidden"
            >
              Website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-6 space-y-6">
          {/* =================================================================
              TAB 1: BOOKINGS & DISPATCH REGISTER
          ================================================================= */}
          {activeTab === "bookings" && (
            <>
              {/* KPI Strip */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Total Logged Jobs
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-navy tabular-nums">
                    {bookingStats.total}
                  </div>
                  <div className="mt-1 text-xs text-amber-700 font-semibold tabular-nums">
                    {bookingStats.newCount} New awaiting reply
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Confirmed / In Progress
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-navy tabular-nums">
                    {bookingStats.activeCount}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Active dispatch schedule
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Gross Client Value
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-navy tabular-nums">
                    {formatUGX(bookingStats.totalRevenue)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Excludes cancelled trips
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Mufasa Net Revenue
                  </div>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-700 tabular-nums">
                    {formatUGX(bookingStats.totalNet)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    After driver, partner &amp; hotel fees
                  </div>
                </div>
              </div>

              {/* Filter & Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative min-w-[200px] flex-1 max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Search Job ID, client, phone, route, code..."
                      className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-gold focus:outline-none"
                    />
                  </div>

                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    <option value="All">All Statuses</option>
                    {BOOKING_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <select
                    value={bookingServiceFilter}
                    onChange={(e) => setBookingServiceFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    <option value="All">All Services</option>
                    <option value="Car Hire">Car Hire</option>
                    <option value="Airport Transfer">Airport Transfer</option>
                    <option value="Moving & Cargo">Moving &amp; Cargo</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshBookings}
                    disabled={refreshing}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-navy hover:bg-slate-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                    />
                    <span>Refresh</span>
                  </button>
                  <a
                    href="/api/bookings/export"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold text-gold hover:bg-navy-light"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              {/* Bookings Data Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {filteredBookings.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-bold text-navy">
                      No bookings match your filters
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Customer inquiries submitted from Home, Fleet, Airport,
                      Moving, or Corporate pages appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-bold">Job ID</th>
                          <th className="px-4 py-3 font-bold">Client &amp; Contact</th>
                          <th className="px-4 py-3 font-bold">Service &amp; Vehicle</th>
                          <th className="px-4 py-3 font-bold">Route &amp; Schedule</th>
                          <th className="px-4 py-3 font-bold text-right">
                            Total / Net
                          </th>
                          <th className="px-4 py-3 font-bold">Status</th>
                          <th className="px-4 py-3 font-bold text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredBookings.map((b) => {
                          const replyUrl = buildAdminReplyWhatsAppUrl({
                            clientPhone: b.client_phone,
                            clientName: b.client_name,
                            jobId: b.job_id,
                            status: b.status,
                            vehicleName: b.vehicle_name || b.service_type,
                            clientTotalUgx: b.client_total_ugx,
                            mtnMomo: settings.mtn_momo_code || undefined,
                            airtelMoney: settings.airtel_money_code || undefined,
                            bankDetails: settings.bank_details || undefined,
                          });

                          return (
                            <tr key={b.id} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3 font-mono font-bold text-navy whitespace-nowrap">
                                {b.job_id}
                                <div className="font-sans text-[11px] font-normal text-slate-500">
                                  {b.created_at.slice(0, 10)}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-navy">
                                  {b.client_name}
                                </div>
                                <div className="text-slate-600 tabular-nums">
                                  {b.client_phone}
                                </div>
                                {b.promo_or_hotel_code && (
                                  <div className="text-[11px] font-semibold text-gold-hover">
                                    Code: {b.promo_or_hotel_code}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-navy">
                                  {b.service_type}
                                </div>
                                <div className="text-slate-600">
                                  {b.vehicle_name || "TBD"} · {b.drive_mode}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Source: {b.vehicle_source}
                                </div>
                              </td>
                              <td className="px-4 py-3 max-w-[220px]">
                                <div className="truncate font-medium text-navy">
                                  {b.pickup_location || "—"} →{" "}
                                  {b.dropoff_location || "—"}
                                </div>
                                <div className="text-slate-500 tabular-nums">
                                  {b.booking_date || "Flexible"}{" "}
                                  {b.booking_time && `at ${b.booking_time}`}
                                  {b.flight_number && ` · Flt ${b.flight_number}`}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                                <div className="font-bold text-navy">
                                  {formatUGX(b.client_total_ugx)}
                                </div>
                                <div className="text-[11px] text-emerald-700 font-semibold">
                                  Net: {formatUGX(b.mufasa_net_ugx)}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                                    STATUS_STYLE[b.status] ||
                                    STATUS_STYLE.New
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <a
                                    href={replyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Reply to client on WhatsApp"
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-800 hover:bg-emerald-100"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => setEditingBooking({ ...b })}
                                    title="Edit booking & payouts"
                                    className="rounded-lg border border-slate-200 p-1.5 text-navy hover:bg-slate-100"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  {confirmDeleteId === `booking-${b.id}` ? (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBooking(b.id)}
                                      className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white"
                                    >
                                      Confirm
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmDeleteId(`booking-${b.id}`)
                                      }
                                      title="Delete booking"
                                      className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* =================================================================
              TAB 2: FLEET CATALOG MANAGER
          ================================================================= */}
          {activeTab === "fleet" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Manage company-owned vehicles and partner categories shown on
                  Home and Fleet pages.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEditingVehicle({
                      name: "",
                      category: "Saloon / Estate",
                      filter_group: "saloons_mpvs",
                      fleet_type: "OWNED",
                      drive_option: "DRIVER_OR_SELF",
                      transmission: "Automatic",
                      seats: "4 Passengers",
                      ac: 1,
                      luggage: "3 Suitcases",
                      best_uses: "",
                      price_display: "UGX 120,000 / day",
                      rate_ugx: 120000,
                      is_quote_only: 0,
                      image_url: "",
                      video_url: "",
                      featured: 0,
                      active: 1,
                      sort_order: vehicles.length + 1,
                    })
                  }
                  className="btn-gold text-xs py-2! px-4!"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-bold">Vehicle</th>
                        <th className="px-4 py-3 font-bold">Fleet &amp; Drive</th>
                        <th className="px-4 py-3 font-bold">Specs</th>
                        <th className="px-4 py-3 font-bold">Price Display</th>
                        <th className="px-4 py-3 font-bold">Visibility</th>
                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {vehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-navy">{v.name}</div>
                            <div className="text-slate-500">{v.category}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-navy">
                              {v.fleet_type}
                            </div>
                            <div className="text-slate-500">{v.drive_option}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {v.seats} · {v.luggage} · {v.ac ? "A/C" : "No A/C"}
                          </td>
                          <td className="px-4 py-3 font-bold text-navy tabular-nums">
                            {v.price_display}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {v.active ? "Visible" : "Hidden"}
                            {v.featured === 1 && " · Featured"}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingVehicle({ ...v })}
                                className="rounded-lg border border-slate-200 p-1.5 text-navy hover:bg-slate-100"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {confirmDeleteId === `veh-${v.id}` ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white"
                                >
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeleteId(`veh-${v.id}`)
                                  }
                                  className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 3: PRICING PACKAGES MANAGER
          ================================================================= */}
          {activeTab === "packages" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Controls the Transparent Pricing &amp; Packages table on the Home
                  page.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPackage({
                      name: "",
                      price_display: "",
                      rate_ugx: null,
                      details: "",
                      active: 1,
                      sort_order: packages.length + 1,
                    })
                  }
                  className="btn-gold text-xs py-2! px-4!"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Package</span>
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-bold">Package</th>
                      <th className="px-4 py-3 font-bold">Displayed Rate</th>
                      <th className="px-4 py-3 font-bold">Details</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {packages.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-navy">{p.name}</td>
                        <td className="px-4 py-3 font-bold text-gold-hover whitespace-nowrap tabular-nums">
                          {p.price_display}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-md">
                          {p.details}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {p.active ? "Active" : "Hidden"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingPackage({ ...p })}
                              className="rounded-lg border border-slate-200 p-1.5 text-navy hover:bg-slate-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {confirmDeleteId === `pkg-${p.id}` ? (
                              <button
                                type="button"
                                onClick={() => handleDeletePackage(p.id)}
                                className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white"
                              >
                                Confirm
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(`pkg-${p.id}`)}
                                className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 4: CLIENT REVIEWS MANAGER
          ================================================================= */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Manage verified customer testimonials displayed on the Home page.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setEditingReview({
                      client_name: "",
                      client_role: "",
                      rating: 5,
                      quote: "",
                      active: 1,
                    })
                  }
                  className="btn-gold text-xs py-2! px-4!"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Review</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-gold-hover">
                          {"★".repeat(r.rating)} ·{" "}
                          {r.active ? "Visible" : "Hidden"}
                        </div>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingReview({ ...r })}
                            className="rounded-lg border border-slate-200 p-1.5 text-navy hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {confirmDeleteId === `rev-${r.id}` ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r.id)}
                              className="rounded-lg bg-red-600 px-2 py-1 text-[11px] font-bold text-white"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(`rev-${r.id}`)}
                              className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700">
                        &ldquo;{r.quote}&rdquo;
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <div className="text-sm font-bold text-navy">
                        {r.client_name}
                      </div>
                      <div className="text-xs text-slate-500">{r.client_role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================
              TAB 5: SITE SETTINGS & PASSWORD
          ================================================================= */}
          {activeTab === "settings" && (
            <div className="grid gap-6 lg:grid-cols-12">
              <form
                onSubmit={handleSaveSettings}
                className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-8"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-extrabold text-navy">
                    Website Content, Rates &amp; Dispatch Settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Changes publish immediately across all public pages and
                    WhatsApp templates.
                  </p>
                </div>

                {/* Brand & Logo */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={settings.company_name}
                      onChange={(e) =>
                        setSettings({ ...settings, company_name: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Slogan
                    </label>
                    <input
                      type="text"
                      value={settings.slogan}
                      onChange={(e) =>
                        setSettings({ ...settings, slogan: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Brand Logo Upload (Optional — blank uses built-in Lion Emblem)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={settings.logo_url}
                      onChange={(e) =>
                        setSettings({ ...settings, logo_url: e.target.value })
                      }
                      placeholder="/uploads/logo.png"
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy px-3 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white">
                      <Upload className="h-3.5 w-3.5" />
                      <span>{uploadingImage ? "Uploading..." : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadAsset(file, "logo");
                          if (url) setSettings({ ...settings, logo_url: url });
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* WhatsApp & Contact */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Primary WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.primary_whatsapp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primary_whatsapp: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Secondary Phone
                    </label>
                    <input
                      type="text"
                      value={settings.secondary_whatsapp}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          secondary_whatsapp: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={settings.official_email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          official_email: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Kampala Office Address
                    </label>
                    <input
                      type="text"
                      value={settings.office_address}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          office_address: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      value={settings.google_maps_url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          google_maps_url: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Key Rates */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Airport Rate (UGX)
                    </label>
                    <input
                      type="number"
                      value={settings.airport_rate_ugx}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          airport_rate_ugx: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Airport Rate (USD)
                    </label>
                    <input
                      type="number"
                      value={settings.airport_rate_usd}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          airport_rate_usd: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Self-Drive / Day (UGX)
                    </label>
                    <input
                      type="number"
                      value={settings.self_drive_daily_ugx}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          self_drive_daily_ugx: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Self-Drive Deposit (UGX)
                    </label>
                    <input
                      type="number"
                      value={settings.self_drive_deposit_ugx}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          self_drive_deposit_ugx: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                {/* Promo & Payment Details */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Promo Banner Active
                    </label>
                    <select
                      value={settings.promo_banner_active}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          promo_banner_active: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="true">Active (Shown)</option>
                      <option value="false">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      value={settings.promo_code}
                      onChange={(e) =>
                        setSettings({ ...settings, promo_code: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={settings.promo_discount_percent}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          promo_discount_percent: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      MTN MoMo Merchant Code
                    </label>
                    <input
                      type="text"
                      value={settings.mtn_momo_code}
                      onChange={(e) =>
                        setSettings({ ...settings, mtn_momo_code: e.target.value })
                      }
                      placeholder="Optional"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Airtel Money Code
                    </label>
                    <input
                      type="text"
                      value={settings.airtel_money_code}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          airtel_money_code: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Show Payment on Confirmation
                    </label>
                    <select
                      value={settings.show_payment_publicly}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          show_payment_publicly: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="false">No (Send via WhatsApp only)</option>
                      <option value="true">Yes (Show after booking)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Bank Transfer Details
                  </label>
                  <input
                    type="text"
                    value={settings.bank_details}
                    onChange={(e) =>
                      setSettings({ ...settings, bank_details: e.target.value })
                    }
                    placeholder="Bank name, account name & account number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    About Story (Shown on About &amp; Safety Page)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.about_story}
                    onChange={(e) =>
                      setSettings({ ...settings, about_story: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="btn-gold text-sm"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <span>Save All Site Settings</span>
                  )}
                </button>
              </form>

              {/* Change Admin Password Card */}
              <div className="lg:col-span-4">
                <form
                  onSubmit={handleChangePassword}
                  className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <KeyRound className="h-4 w-4 text-gold-hover" />
                    <h2 className="text-base font-extrabold text-navy">
                      Change Admin Password
                    </h2>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-navy">
                      New Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn-navy-outline w-full text-xs"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          MODAL: EDIT BOOKING & PAYOUT SPLITS
      ===================================================================== */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-gold-hover">
                  {editingBooking.job_id}
                </span>
                <h2 className="text-lg font-extrabold text-navy">
                  Dispatch &amp; Financials · {editingBooking.client_name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-bg p-3 text-slate-700 space-y-1">
                <div>
                  <strong>Route:</strong> {editingBooking.pickup_location} →{" "}
                  {editingBooking.dropoff_location}
                </div>
                <div>
                  <strong>Schedule:</strong> {editingBooking.booking_date || "Flexible"}{" "}
                  {editingBooking.booking_time}
                  {editingBooking.flight_number &&
                    ` · Flight ${editingBooking.flight_number}`}
                </div>
                {editingBooking.load_description && (
                  <div>
                    <strong>Load:</strong> {editingBooking.load_description} (
                    {editingBooking.helpers_needed})
                  </div>
                )}
                {editingBooking.monthly_needs && (
                  <div>
                    <strong>Corporate Needs:</strong>{" "}
                    {editingBooking.company_hotel_name} —{" "}
                    {editingBooking.monthly_needs}
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-bold text-navy">Status</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        status: e.target.value as BookingStatus,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    {BOOKING_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Vehicle Source
                  </label>
                  <select
                    value={editingBooking.vehicle_source}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        vehicle_source: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="Owned">Owned</option>
                    <option value="Partner">Partner</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Payment Method
                  </label>
                  <select
                    value={editingBooking.payment_method}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Airtel Money">Airtel Money</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank / Invoice">Bank / Invoice</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Assigned Vehicle
                  </label>
                  <input
                    type="text"
                    value={editingBooking.vehicle_name}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        vehicle_name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Drive Mode
                  </label>
                  <select
                    value={editingBooking.drive_mode}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        drive_mode: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="With Driver">With Driver</option>
                    <option value="Self-Drive">Self-Drive</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Client Total (UGX)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.client_total_ugx}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        client_total_ugx: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Driver Comm.
                  </label>
                  <input
                    type="number"
                    value={editingBooking.driver_commission_ugx}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        driver_commission_ugx: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Partner Payout
                  </label>
                  <input
                    type="number"
                    value={editingBooking.partner_payout_ugx}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        partner_payout_ugx: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 tabular-nums"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Hotel Fee (10%)
                  </label>
                  <input
                    type="number"
                    value={editingBooking.hotel_fee_ugx}
                    onChange={(e) =>
                      setEditingBooking({
                        ...editingBooking,
                        hotel_fee_ugx: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-navy">
                  Internal Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={editingBooking.admin_notes}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      admin_notes: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="btn-gold text-xs py-2! px-5!"
                >
                  {savingBooking ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD / EDIT VEHICLE
      ===================================================================== */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-navy">
                {editingVehicle.id ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="mt-4 space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-navy">Name *</label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.name ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({ ...editingVehicle, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Category Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.category ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Filter Tab
                  </label>
                  <select
                    value={editingVehicle.filter_group ?? "saloons_mpvs"}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        filter_group: e.target.value as FleetFilterGroup,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="saloons_mpvs">Saloons &amp; MPVs</option>
                    <option value="suvs_buses">SUVs &amp; Buses</option>
                    <option value="moving_cargo">Moving &amp; Cargo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Fleet Type
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.fleet_type ?? "OWNED"}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        fleet_type: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Drive Option
                  </label>
                  <select
                    value={editingVehicle.drive_option ?? "DRIVER_OR_SELF"}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        drive_option: e.target.value as DriveOptionType,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2"
                  >
                    <option value="DRIVER_OR_SELF">Driver or Self-Drive</option>
                    <option value="DRIVER_OR_REQUEST_SELF">
                      Driver / Request Self-Drive
                    </option>
                    <option value="DRIVER_ONLY">Driver Included Only</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Transmission
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.transmission ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        transmission: e.target.value,
                      })
                    }
                    placeholder="e.g. Automatic"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">Seats</label>
                  <input
                    type="text"
                    value={editingVehicle.seats ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        seats: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Luggage / Load
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.luggage ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        luggage: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Daily Rate UGX (optional)
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.rate_ugx ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        rate_ugx: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Website Price Display *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVehicle.price_display ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        price_display: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Photo URL / Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingVehicle.image_url ?? ""}
                      onChange={(e) =>
                        setEditingVehicle({
                          ...editingVehicle,
                          image_url: e.target.value,
                        })
                      }
                      placeholder="/uploads/car.jpg"
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-navy px-2.5 py-2 font-bold text-navy">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await uploadAsset(f, "vehicle");
                          if (url)
                            setEditingVehicle({
                              ...editingVehicle,
                              image_url: url,
                            });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-navy">
                  Showcase Video URL / MP4 Upload (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingVehicle.video_url ?? ""}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        video_url: e.target.value,
                      })
                    }
                    placeholder="/videos/premio.mp4 or upload MP4/WebM"
                    className="flex-1 rounded-lg border border-slate-300 px-2.5 py-2"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-navy px-2.5 py-2 font-bold text-navy">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await uploadAsset(f, "vehicle-video");
                        if (url)
                          setEditingVehicle({
                            ...editingVehicle,
                            video_url: url,
                          });
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-navy">
                  Best Uses Description
                </label>
                <textarea
                  rows={2}
                  value={editingVehicle.best_uses ?? ""}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      best_uses: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="inline-flex items-center gap-1.5 font-semibold">
                  <input
                    type="checkbox"
                    checked={editingVehicle.ac === 1}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        ac: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  Air Conditioned
                </label>
                <label className="inline-flex items-center gap-1.5 font-semibold">
                  <input
                    type="checkbox"
                    checked={editingVehicle.is_quote_only === 1}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        is_quote_only: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  Quote Only
                </label>
                <label className="inline-flex items-center gap-1.5 font-semibold">
                  <input
                    type="checkbox"
                    checked={editingVehicle.featured === 1}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        featured: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  Featured on Home
                </label>
                <label className="inline-flex items-center gap-1.5 font-semibold">
                  <input
                    type="checkbox"
                    checked={editingVehicle.active === 1}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        active: e.target.checked ? 1 : 0,
                      })
                    }
                  />
                  Visible on Website
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVehicle}
                  className="btn-gold text-xs py-2! px-5!"
                >
                  {savingVehicle ? "Saving..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD / EDIT PACKAGE
      ===================================================================== */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-navy">
                {editingPackage.id ? "Edit Package" : "Add Pricing Package"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-navy">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingPackage.name ?? ""}
                  onChange={(e) =>
                    setEditingPackage({ ...editingPackage, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">
                  Displayed Rate *
                </label>
                <input
                  type="text"
                  required
                  value={editingPackage.price_display ?? ""}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      price_display: e.target.value,
                    })
                  }
                  placeholder="e.g. UGX 120,000 / day"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">
                  Details &amp; Inclusions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPackage.details ?? ""}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      details: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <label className="inline-flex items-center gap-1.5 font-semibold">
                <input
                  type="checkbox"
                  checked={editingPackage.active === 1}
                  onChange={(e) =>
                    setEditingPackage({
                      ...editingPackage,
                      active: e.target.checked ? 1 : 0,
                    })
                  }
                />
                Visible on Website
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPackage}
                  className="btn-gold text-xs py-2! px-5!"
                >
                  {savingPackage ? "Saving..." : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ADD / EDIT REVIEW
      ===================================================================== */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-navy">
                {editingReview.id ? "Edit Client Review" : "Add Client Review"}
              </h2>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveReview} className="mt-4 space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.client_name ?? ""}
                    onChange={(e) =>
                      setEditingReview({
                        ...editingReview,
                        client_name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-navy">
                    Role / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingReview.client_role ?? ""}
                    onChange={(e) =>
                      setEditingReview({
                        ...editingReview,
                        client_role: e.target.value,
                      })
                    }
                    placeholder="e.g. NGO Lead, Kololo"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">Rating</label>
                <select
                  value={editingReview.rating ?? 5}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      rating: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-bold text-navy">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingReview.quote ?? ""}
                  onChange={(e) =>
                    setEditingReview({ ...editingReview, quote: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <label className="inline-flex items-center gap-1.5 font-semibold">
                <input
                  type="checkbox"
                  checked={editingReview.active === 1}
                  onChange={(e) =>
                    setEditingReview({
                      ...editingReview,
                      active: e.target.checked ? 1 : 0,
                    })
                  }
                />
                Visible on Website
              </label>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="btn-gold text-xs py-2! px-5!"
                >
                  {savingReview ? "Saving..." : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
