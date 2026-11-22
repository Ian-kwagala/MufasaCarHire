"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const QUOTA_EVENT_NAME = "gmp-quota-exceeded";

let listenersInstalled = false;

function installGlobalGmpQuotaListeners() {
  if (typeof window === "undefined" || listenersInstalled) return;
  listenersInstalled = true;

  const win = window as unknown as Record<string, unknown>;
  const existingAuthFailure = win.gm_authFailure;
  win.gm_authFailure = () => {
    if (typeof existingAuthFailure === "function") {
      (existingAuthFailure as () => void)();
    }
    window.dispatchEvent(new CustomEvent(QUOTA_EVENT_NAME));
  };

  const origError = console.error;
  console.error = (...args: unknown[]) => {
    origError.apply(console, args);
    const msg = args.map((a) => String(a)).join(" ");
    if (
      msg.includes("OverQuotaMapError") ||
      msg.includes("QuotaExceededError")
    ) {
      window.dispatchEvent(new CustomEvent(QUOTA_EVENT_NAME));
    }
  };
}

export function triggerGmpQuotaBanner() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(QUOTA_EVENT_NAME));
  }
}

export function isGmpQuotaError(err: unknown): boolean {
  if (!err) return false;
  const text =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === "object"
      ? JSON.stringify(err)
      : String(err);
  return (
    text.includes("RESOURCE_EXHAUSTED") ||
    text.includes("OVER_QUERY_LIMIT") ||
    text.includes("OverQuotaMapError") ||
    text.includes("QuotaExceededError") ||
    /\b429\b/.test(text)
  );
}

export function GmpQuotaBanner() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    installGlobalGmpQuotaListeners();

    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
      setDismissed(false);
    };

    window.addEventListener(QUOTA_EVENT_NAME, handleQuotaExceeded);
    return () => {
      window.removeEventListener(QUOTA_EVENT_NAME, handleQuotaExceeded);
    };
  }, []);

  if (!quotaExceeded || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-50 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-900 shadow-sm md:text-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 pr-6 relative">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
        <span>
          Google Maps Platform quota reached. If you are the app owner, visit{" "}
          <a
            href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-950 underline hover:text-amber-800"
          >
            maps developer site
          </a>{" "}
          for instructions to update your account.
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss quota notification"
          className="absolute right-0 rounded p-1 text-amber-800 hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
