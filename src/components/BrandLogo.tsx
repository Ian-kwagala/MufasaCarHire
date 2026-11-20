import React from "react";

interface BrandLogoProps {
  logoUrl?: string;
  companyName?: string;
  slogan?: string;
  darkText?: boolean;
}

/**
 * Displays the custom uploaded logo from the Admin Dashboard if available,
 * or falls back to the executive Navy & Gold Lion + Car emblem described in the Master Brief.
 */
export function BrandLogo({
  logoUrl,
  companyName = "MUFASA CAR HIRE",
  slogan = "Travel Like a KING",
  darkText = false,
}: BrandLogoProps) {
  return (
    <div className="inline-flex items-center gap-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={companyName}
          className="h-11 w-auto max-w-[140px] rounded-lg object-contain bg-white/95 p-0.5 shadow-sm"
        />
      ) : (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/60 bg-navy shadow-sm"
          aria-hidden="true"
        >
          {/* Custom Lion Crown + Car Silhouette SVG Emblem */}
          <svg
            viewBox="0 0 48 48"
            className="h-8 w-8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Royal Lion Crown */}
            <path
              d="M12 18L16 10L24 15L32 10L36 18H12Z"
              fill="#C59B3B"
              stroke="#C59B3B"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Sleek Car Silhouette */}
            <path
              d="M8 30L12 22H36L40 30H42V35H38C38 36.6569 36.6569 38 35 38C33.3431 38 32 36.6569 32 35H16C16 36.6569 14.6569 38 13 38C11.3431 38 10 36.6569 10 35H6V30H8Z"
              fill="#FFFFFF"
            />
            <path d="M14 24.5H34L36.5 29H11.5L14 24.5Z" fill="#0E2444" />
            <circle cx="13" cy="34.5" r="2" fill="#C59B3B" />
            <circle cx="35" cy="34.5" r="2" fill="#C59B3B" />
          </svg>
        </div>
      )}

      <div className="leading-tight">
        <div
          className={`text-base font-extrabold tracking-wide uppercase ${
            darkText ? "text-navy" : "text-white"
          }`}
        >
          {companyName}
        </div>
        <div className="text-xs font-semibold tracking-wider text-gold">
          {slogan}
        </div>
      </div>
    </div>
  );
}
