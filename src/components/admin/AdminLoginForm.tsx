"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import { BrandLogo } from "@/components/BrandLogo";

export function AdminLoginForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setErrorMsg("Network error while signing in.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo
            logoUrl={settings.logo_url}
            companyName={settings.company_name}
            slogan="Dispatch & Operations Portal"
          />
        </div>

        <div className="rounded-2xl border border-white/15 bg-white p-7 text-navy shadow-2xl">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-navy">
                Staff Admin Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Manage bookings, fleet, rates &amp; site settings
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-navy">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-gold focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
