"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { BookingFormSkeleton } from "./Skeletons";

export function CorporateInquiryForm({
  settings,
  isLoading = false,
}: {
  settings: SiteSettings;
  isLoading?: boolean;
}) {
  const [accountType, setAccountType] = useState<
    "NGO / Corporate" | "Hotel" | "SME / Wholesaler"
  >("NGO / Corporate");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [vehiclePreference, setVehiclePreference] = useState(
    "Dedicated Saloon / 4x4 SUV Retainer"
  );
  const [monthlyNeeds, setMonthlyNeeds] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState<{
    jobId: string;
    whatsappUrl: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_type: "Corporate",
          vehicle_name: vehiclePreference,
          vehicle_source: "Owned",
          drive_mode: "With Driver",
          pickup_location: "Kampala / Entebbe Corridor",
          dropoff_location: "As Per Monthly Schedule / Retainer",
          company_hotel_name: companyName.trim(),
          monthly_needs: monthlyNeeds.trim(),
          client_name: contactName.trim(),
          client_phone: contactPhone.trim(),
          client_email: contactEmail.trim(),
          client_type: accountType,
          marketing_opt_in: marketingOptIn,
          rate_shown:
            accountType === "Hotel"
              ? "Hotel Partner Program (10% Referral Commission)"
              : "Corporate Retainer (From UGX 1.5M–2.2M / mo)",
          currency: "UGX",
          client_total_ugx: 0,
          admin_notes: `B2B Inquiry (${accountType}) — ${companyName.trim()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to submit partnership inquiry.");
        setSubmitting(false);
        return;
      }

      setConfirmation({
        jobId: data.booking.job_id,
        whatsappUrl: data.whatsappUrl,
      });
    } catch {
      setErrorMsg("Network error. Please try again or reach us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return <BookingFormSkeleton variant="corporate" />;
  }

  return (
    <div className="rounded-2xl border border-gold/40 bg-white p-6 text-navy shadow-lg sm:p-7">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-extrabold text-navy sm:text-xl">
          Corporate Retainer &amp; Hotel Concierge Inquiry
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Request a custom monthly SLA proposal or hotel referral partnership kit
        </p>
      </div>

      {confirmation ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h3 className="mt-2 text-lg font-extrabold text-navy">
            Inquiry Logged · Ref {confirmation.jobId}
          </h3>
          <p className="mt-1 text-sm text-slate-700">
            Thank you. Our corporate accounts desk has logged your inquiry and
            can share our SLA rate card and hotel partner agreement right away on
            WhatsApp or via{" "}
            <span className="font-semibold">{settings.official_email}</span>.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={confirmation.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Connect with Accounts Desk</span>
            </a>
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="text-xs font-bold text-navy underline"
            >
              Submit another inquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Type Segmented Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-navy">
              Organization Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                ["NGO / Corporate", "Hotel", "SME / Wholesaler"] as const
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`rounded-xl border px-2.5 py-2 text-xs font-bold transition-colors ${
                    accountType === type
                      ? "border-navy bg-navy text-gold"
                      : "border-slate-300 bg-white text-slate-700 hover:border-navy/50"
                  }`}
                >
                  {type === "Hotel" ? "Hotel / Lodge" : type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Company / NGO / Hotel Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Mestil Hotel or NGO Uganda"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Primary Fleet / Service Need
              </label>
              <select
                value={vehiclePreference}
                onChange={(e) => setVehiclePreference(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-gold focus:outline-none"
              >
                <option value="Dedicated Saloon / 4x4 SUV Retainer">
                  Dedicated Saloon / 4x4 SUV Retainer
                </option>
                <option value="Hotel Guest Airport Transfers (10% Commission)">
                  Hotel Guest Airport Transfers (10% Commission)
                </option>
                <option value="Staff Shuttle (HiAce / Coaster Bus)">
                  Staff Shuttle (HiAce / Coaster Bus)
                </option>
                <option value="Upcountry NGO Field Missions (Land Cruiser)">
                  Upcountry NGO Field Missions (Land Cruiser)
                </option>
                <option value="Scheduled SME Cargo & Delivery Vans">
                  Scheduled SME Cargo &amp; Delivery Vans
                </option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 0708 854 302"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Work Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="procurement@org.ug"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-navy">
              Estimated Monthly Transport Needs *
            </label>
            <textarea
              rows={3}
              required
              value={monthlyNeeds}
              onChange={(e) => setMonthlyNeeds(e.target.value)}
              placeholder="Tell us the number of vehicles, average monthly trips, Entebbe pickups, or whether you would like printed concierge rate cards..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 accent-navy"
            />
            <span>
              I agree to receive a corporate proposal and service updates via
              WhatsApp or email (opt out anytime).
            </span>
          </label>

          {errorMsg && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-gold w-full text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting Inquiry...</span>
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                <span>Request Corporate / Hotel Proposal</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
